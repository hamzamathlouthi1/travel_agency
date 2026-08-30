import { Injectable, PendingTasks, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HOTEL_SEARCH_PROVIDER } from '../data-access/hotel-search.provider';
import { HotelResult } from '../models/hotel-result.model';
import { HotelSearchQuery } from '../models/hotel-search-query.model';
import { HotelFilters, createEmptyFilters } from '../models/hotel-filter.model';
import { HotelSortKey } from '../models/hotel-sort.model';
import {
  paramMapToParams,
  parseFilters,
  parsePage,
  parseSearchQuery,
  parseSort,
  toQueryParams,
} from '../utils/hotel-search-url.util';

const PAGE_SIZE = 3;

// Owns everything the Hotel Results page needs. Query/filters/sort/page are
// derived straight from the URL (so refresh, back/forward, and a shared
// link all reproduce the same view); every mutation navigates rather than
// mutating local state, keeping the URL the single source of truth.
//
// `loading` is true only before the first response ever arrives for the
// current navigation; `updating` is true on every subsequent re-fetch
// (filter/sort/page change) — the results grid stays mounted and dimmed
// instead of the whole page blanking.
@Injectable()
export class HotelResultsStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly provider = inject(HOTEL_SEARCH_PROVIDER);
  // This is a zoneless app: a plain RxJS delay() (used by the mock provider
  // to simulate latency) isn't tracked as "pending" the way HttpClient is,
  // so SSR would otherwise serialize the page before the mock data arrives.
  // Registering the fetch as a pending task makes SSR wait for it — and
  // costs nothing once a real HttpClient-backed provider replaces the mock.
  private readonly pendingTasks = inject(PendingTasks);

  private readonly paramMap = toSignal(this.route.queryParamMap, {
    requireSync: true,
  });

  readonly query = computed<HotelSearchQuery>(() =>
    parseSearchQuery(paramMapToParams(this.paramMap())),
  );
  readonly filters = computed<HotelFilters>(() => parseFilters(paramMapToParams(this.paramMap())));
  readonly sort = computed<HotelSortKey>(() => parseSort(paramMapToParams(this.paramMap())));
  readonly page = computed<number>(() => parsePage(paramMapToParams(this.paramMap())));

  private readonly resultsSignal = signal<readonly HotelResult[] | null>(null);
  private readonly totalResultsSignal = signal(0);
  private readonly totalPagesSignal = signal(1);
  private readonly errorSignal = signal(false);
  private readonly partialAvailabilitySignal = signal(false);
  private readonly updatingSignal = signal(false);
  private latestRequestId = 0;

  readonly results = this.resultsSignal.asReadonly();
  readonly totalResults = this.totalResultsSignal.asReadonly();
  readonly totalPages = this.totalPagesSignal.asReadonly();
  readonly loading = computed(() => this.resultsSignal() === null && !this.errorSignal());
  readonly updating = this.updatingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly partialAvailability = this.partialAvailabilitySignal.asReadonly();
  readonly isEmpty = computed(() => this.resultsSignal()?.length === 0);

  constructor() {
    effect(() => {
      const query = this.query();
      const filters = this.filters();
      const sort = this.sort();
      const page = this.page();
      untracked(() => this.fetch(query, filters, sort, page));
    });
  }

  retry(): void {
    this.fetch(this.query(), this.filters(), this.sort(), this.page());
  }

  // Return the navigation promise (rather than firing-and-forgetting) so a
  // caller — a component, or a test — can await the URL/state update
  // actually landing instead of guessing at timing.
  setFilters(filters: HotelFilters): Promise<boolean> {
    return this.navigate(this.query(), filters, this.sort(), 1);
  }

  clearFilters(): Promise<boolean> {
    return this.navigate(this.query(), createEmptyFilters(), this.sort(), 1);
  }

  setSort(sort: HotelSortKey): Promise<boolean> {
    return this.navigate(this.query(), this.filters(), sort, 1);
  }

  setPage(page: number): Promise<boolean> {
    return this.navigate(this.query(), this.filters(), this.sort(), page);
  }

  private fetch(query: HotelSearchQuery, filters: HotelFilters, sort: HotelSortKey, page: number): void {
    const requestId = ++this.latestRequestId;
    this.updatingSignal.set(true);
    this.errorSignal.set(false);
    const completeTask = this.pendingTasks.add();

    this.provider.search({ query, filters, sort, page, pageSize: PAGE_SIZE }).subscribe({
      next: (response) => {
        if (requestId === this.latestRequestId) {
          // a stale request (superseded by a newer one) never overwrites state
          this.resultsSignal.set(response.results);
          this.totalResultsSignal.set(response.totalResults);
          this.totalPagesSignal.set(response.totalPages);
          this.partialAvailabilitySignal.set(response.partialAvailability);
          this.updatingSignal.set(false);
        }
        completeTask();
      },
      error: () => {
        if (requestId === this.latestRequestId) {
          this.errorSignal.set(true);
          this.updatingSignal.set(false);
        }
        completeTask();
      },
    });
  }

  private navigate(
    query: HotelSearchQuery,
    filters: HotelFilters,
    sort: HotelSortKey,
    page: number,
  ): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toQueryParams(query, filters, sort, page),
    });
  }
}
