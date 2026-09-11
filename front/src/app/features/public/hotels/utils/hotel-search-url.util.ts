import { ParamMap, Params } from '@angular/router';
import { HotelSearchQuery } from '../models/hotel-search-query.model';
import { HotelFilters } from '../models/hotel-filter.model';
import { AmenityId, BoardType } from '../models/hotel-result.model';
import { DEFAULT_SORT, HOTEL_SORT_OPTIONS, HotelSortKey } from '../models/hotel-sort.model';

// The ONE place that knows how /hotels query params map to domain state and
// back. Everything else (the store, components) reads/writes typed objects
// — never ActivatedRoute.queryParamMap directly. Round-tripping through
// toParams(parseParams(p)) must be stable so back/forward and a shared URL
// always land on the same page.

const VALID_BOARD_TYPES: readonly BoardType[] = [
  'ROOM_ONLY',
  'BREAKFAST',
  'HALF_BOARD',
  'FULL_BOARD',
  'ALL_INCLUSIVE',
];
const VALID_AMENITIES: readonly AmenityId[] = [
  'wifi',
  'pool',
  'parking',
  'spa',
  'airport-shuttle',
  'air-conditioning',
  'family-rooms',
  'breakfast',
];
const VALID_SORT_KEYS = new Set(HOTEL_SORT_OPTIONS.map((o) => o.key));

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function inWeekIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function toInt(value: string | null, fallback: number): number {
  const parsed = value === null ? NaN : Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNumberOrNull(value: string | null): number | null {
  if (value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toList(value: string | null): readonly string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

// Angular's ParamMap only exposes .get()/.getAll(), while the parsers below
// index with brackets for readability — this is the one conversion point.
export function paramMapToParams(map: ParamMap): Params {
  return Object.fromEntries(map.keys.map((key) => [key, map.get(key)]));
}

export function parseSearchQuery(params: Params): HotelSearchQuery {
  return {
    destination: (params['destination'] as string | undefined)?.trim() || '',
    checkIn: (params['checkIn'] as string | undefined) || todayIso(),
    checkOut: (params['checkOut'] as string | undefined) || inWeekIso(),
    adults: toInt(params['adults'] ?? null, 2),
    children: toInt(params['children'] ?? null, 0),
    rooms: toInt(params['rooms'] ?? null, 1),
  };
}

export function parseFilters(params: Params): HotelFilters {
  return {
    minPrice: toNumberOrNull(params['minPrice'] ?? null),
    maxPrice: toNumberOrNull(params['maxPrice'] ?? null),
    stars: toList(params['stars'] ?? null)
      .map(Number)
      .filter((n) => n >= 1 && n <= 5),
    minGuestRating: toNumberOrNull(params['rating'] ?? null),
    boardTypes: toList(params['board'] ?? null).filter((b): b is BoardType =>
      VALID_BOARD_TYPES.includes(b as BoardType),
    ),
    freeCancellationOnly: params['freeCancellation'] === 'true',
    amenities: toList(params['amenities'] ?? null).filter((a): a is AmenityId =>
      VALID_AMENITIES.includes(a as AmenityId),
    ),
    areas: toList(params['area'] ?? null),
  };
}

export function parseSort(params: Params): HotelSortKey {
  const raw = params['sort'] as string | undefined;
  return raw && VALID_SORT_KEYS.has(raw as HotelSortKey) ? (raw as HotelSortKey) : DEFAULT_SORT;
}

export function parsePage(params: Params): number {
  return toInt(params['page'] ?? null, 1);
}

// Builds the full query-param object for a router navigation. Omits
// default/empty values so the URL stays as short as it can (e.g. page=1 or
// sort=RECOMMENDED never appear), while still round-tripping correctly
// since the parsers above treat "absent" as the same default.
export function toQueryParams(
  query: HotelSearchQuery,
  filters: HotelFilters,
  sort: HotelSortKey,
  page: number,
): Params {
  const params: Params = {
    destination: query.destination || null,
    checkIn: query.checkIn || null,
    checkOut: query.checkOut || null,
    adults: query.adults !== 2 ? query.adults : null,
    children: query.children !== 0 ? query.children : null,
    rooms: query.rooms !== 1 ? query.rooms : null,
    minPrice: filters.minPrice ?? null,
    maxPrice: filters.maxPrice ?? null,
    stars: filters.stars.length ? filters.stars.join(',') : null,
    rating: filters.minGuestRating ?? null,
    board: filters.boardTypes.length ? filters.boardTypes.join(',') : null,
    freeCancellation: filters.freeCancellationOnly ? 'true' : null,
    amenities: filters.amenities.length ? filters.amenities.join(',') : null,
    area: filters.areas.length ? filters.areas.join(',') : null,
    sort: sort !== DEFAULT_SORT ? sort : null,
    page: page !== 1 ? page : null,
  };

  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== null));
}
