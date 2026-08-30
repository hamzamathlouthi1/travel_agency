export type SearchMode = 'HOTELS' | 'VOYAGES' | 'CIRCUITS';

export const SEARCH_MODES: readonly { readonly mode: SearchMode; readonly label: string }[] = [
  { mode: 'HOTELS', label: 'Hotels' },
  { mode: 'VOYAGES', label: 'Voyages' },
  { mode: 'CIRCUITS', label: 'Circuits' },
];
