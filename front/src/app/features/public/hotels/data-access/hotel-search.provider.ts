import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { HotelResult } from '../models/hotel-result.model';
import { HotelSearchQuery } from '../models/hotel-search-query.model';
import { HotelFilters } from '../models/hotel-filter.model';
import { HotelSortKey } from '../models/hotel-sort.model';

export interface HotelSearchRequest {
  readonly query: HotelSearchQuery;
  readonly filters: HotelFilters;
  readonly sort: HotelSortKey;
  readonly page: number;
  readonly pageSize: number;
}

export interface HotelSearchResponse {
  readonly results: readonly HotelResult[];
  readonly totalResults: number;
  readonly totalPages: number;
  /**
   * true when one inventory source failed to answer in time but others
   * did — the page must stay usable, never blocked, on this signal. Never
   * surface which source failed.
   */
  readonly partialAvailability: boolean;
}

// HotelResultsStore depends on this token only. Swap the `useClass` in
// app.config.ts for a Spring Boot-backed implementation later and no
// component or the store itself needs to change.
export interface HotelSearchProvider {
  search(request: HotelSearchRequest): Observable<HotelSearchResponse>;
}

export const HOTEL_SEARCH_PROVIDER = new InjectionToken<HotelSearchProvider>(
  'HOTEL_SEARCH_PROVIDER',
);
