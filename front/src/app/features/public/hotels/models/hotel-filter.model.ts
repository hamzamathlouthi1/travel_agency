import { AmenityId, BoardType } from './hotel-result.model';

export interface HotelFilters {
  readonly minPrice: number | null;
  readonly maxPrice: number | null;
  readonly stars: readonly number[];
  readonly minGuestRating: number | null; // 9 | 8 | 7
  readonly boardTypes: readonly BoardType[];
  readonly freeCancellationOnly: boolean;
  readonly amenities: readonly AmenityId[];
  readonly areas: readonly string[];
}

export function createEmptyFilters(): HotelFilters {
  return {
    minPrice: null,
    maxPrice: null,
    stars: [],
    minGuestRating: null,
    boardTypes: [],
    freeCancellationOnly: false,
    amenities: [],
    areas: [],
  };
}

export function isFiltersEmpty(filters: HotelFilters): boolean {
  return (
    filters.minPrice === null &&
    filters.maxPrice === null &&
    filters.stars.length === 0 &&
    filters.minGuestRating === null &&
    filters.boardTypes.length === 0 &&
    !filters.freeCancellationOnly &&
    filters.amenities.length === 0 &&
    filters.areas.length === 0
  );
}

export function activeFilterCount(filters: HotelFilters): number {
  let count = 0;
  if (filters.minPrice !== null || filters.maxPrice !== null) count += 1;
  count += filters.stars.length;
  if (filters.minGuestRating !== null) count += 1;
  count += filters.boardTypes.length;
  if (filters.freeCancellationOnly) count += 1;
  count += filters.amenities.length;
  count += filters.areas.length;
  return count;
}
