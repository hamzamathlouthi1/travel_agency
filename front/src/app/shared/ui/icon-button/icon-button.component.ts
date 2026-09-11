import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Square icon-only control. `ariaLabel` is required — an icon button with no
// accessible name is a common a11y failure, so there is no way to omit it.
@Component({
  selector: 'app-icon-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-expanded]="ariaExpanded()"
      [class.subtle]="variant() === 'subtle'"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: contents;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      background: transparent;
      color: var(--color-ink-950);
      cursor: pointer;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast);
    }

    button:hover:not(:disabled) {
      background: var(--color-surface-subtle);
    }

    button:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    button.subtle {
      border-color: var(--color-border);
    }
  `,
})
export class IconButtonComponent {
  readonly ariaLabel = input.required<string>();
  readonly ariaExpanded = input<boolean | null>(null);
  readonly variant = input<'plain' | 'subtle'>('plain');
  readonly disabled = input(false);
}
