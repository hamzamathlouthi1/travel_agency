const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null,
  );
}

// Moves focus inside `container` (first focusable element, or the container
// itself as a fallback) and keeps Tab/Shift+Tab cycling within it. Returns a
// cleanup function that removes the listener and restores focus to
// `returnTo`. Used by every overlay (Dropdown, Drawer, the mobile search
// sheet) so keyboard users never get lost behind a scrim.
export function trapFocus(container: HTMLElement, returnTo: HTMLElement | null): () => void {
  const focusables = focusableElements(container);
  (focusables[0] ?? container).focus();

  const handler = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const current = focusableElements(container);
    if (current.length === 0) {
      event.preventDefault();
      return;
    }
    const first = current[0];
    const last = current[current.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handler);

  return () => {
    container.removeEventListener('keydown', handler);
    returnTo?.focus();
  };
}
