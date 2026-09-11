// Locks document scroll while a full-screen/overlay surface is open on
// mobile (drawers, the mobile search sheet) so the page behind it can't
// scroll underneath a fixed-position panel. Call the returned function to
// unlock. Safe to call only in the browser — callers gate this behind
// PlatformService.isBrowser.
export function lockBodyScroll(document: Document): () => void {
  const { body } = document;
  const previousOverflow = body.style.overflow;
  body.style.overflow = 'hidden';
  return () => {
    body.style.overflow = previousOverflow;
  };
}
