export type HotelSortKey =
  | 'RECOMMENDED'
  | 'PRICE_LOW'
  | 'PRICE_HIGH'
  | 'GUEST_RATING'
  | 'STAR_RATING'
  | 'BEST_VALUE';

export interface HotelSortOption {
  readonly key: HotelSortKey;
  readonly label: string;
}

// "Recommended" is never presented as objectively best — the description
// exists so the UI can explain the ranking rather than imply authority.
export const HOTEL_SORT_OPTIONS: readonly HotelSortOption[] = [
  { key: 'RECOMMENDED', label: 'Recommended' },
  { key: 'PRICE_LOW', label: 'Price: lowest first' },
  { key: 'PRICE_HIGH', label: 'Price: highest first' },
  { key: 'GUEST_RATING', label: 'Guest rating' },
  { key: 'STAR_RATING', label: 'Hotel stars' },
  { key: 'BEST_VALUE', label: 'Best value' },
];

export const DEFAULT_SORT: HotelSortKey = 'RECOMMENDED';

export function sortLabel(key: HotelSortKey): string {
  return HOTEL_SORT_OPTIONS.find((o) => o.key === key)?.label ?? 'Recommended';
}
