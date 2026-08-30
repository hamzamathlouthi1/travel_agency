import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HotelResultsStore } from '../../state/hotel-results.store';
import { SearchSummaryComponent } from '../../components/search-summary/search-summary.component';
import { ResultsHeaderComponent } from '../../components/results-header/results-header.component';
import { SortControlComponent } from '../../components/sort-control/sort-control.component';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { MobileFilterSheetComponent } from '../../components/mobile-filter-sheet/mobile-filter-sheet.component';
import { HotelResultCardComponent } from '../../components/hotel-result-card/hotel-result-card.component';
import { HotelResultSkeletonComponent } from '../../components/hotel-result-skeleton/hotel-result-skeleton.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { EmptyResultsComponent } from '../../components/empty-results/empty-results.component';
import { ErrorResultsComponent } from '../../components/error-results/error-results.component';
import { activeFilterCount, isFiltersEmpty } from '../../models/hotel-filter.model';

// Orchestrates only: reads state from HotelResultsStore, wires child
// components, sets SEO metadata. No fetching, filtering, or URL parsing
// happens here — that's the store's and the util's job.
@Component({
  selector: 'app-hotel-results-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelResultsStore],
  imports: [
    SearchSummaryComponent,
    ResultsHeaderComponent,
    SortControlComponent,
    FilterSidebarComponent,
    MobileFilterSheetComponent,
    HotelResultCardComponent,
    HotelResultSkeletonComponent,
    PaginationComponent,
    EmptyResultsComponent,
    ErrorResultsComponent,
  ],
  template: `
    <div class="container page">
      <app-search-summary [query]="store.query()" />

      <div class="context-row">
        <app-results-header
          [destination]="store.query().destination || 'your destination'"
          [totalResults]="store.loading() ? null : store.totalResults()"
          [nights]="nights()"
          [occupancyLabel]="occupancyLabel()"
        />
        <div class="controls">
          <button type="button" class="filters-trigger" (click)="mobileFiltersOpen.set(true)">
            Filters
            @if (activeFilters() > 0) {
              <span class="count">{{ activeFilters() }}</span>
            }
          </button>
          <app-sort-control [active]="store.sort()" (sortChange)="store.setSort($event)" />
        </div>
      </div>

      @if (store.partialAvailability()) {
        <div class="partial-banner" role="status">
          Some availability may still be updating — more stays could appear shortly.
        </div>
      }

      <div class="layout">
        <app-filter-sidebar [filters]="store.filters()" (filtersChange)="store.setFilters($event)" />

        <div class="results" [class.updating]="store.updating() && !store.loading()">
          @if (store.error()) {
            <app-error-results (retry)="store.retry()" />
          } @else if (store.loading()) {
            @for (i of skeletonRows; track i) {
              <app-hotel-result-skeleton />
            }
          } @else if (store.isEmpty()) {
            <app-empty-results
              [reason]="isFiltersEmpty(store.filters()) ? 'NO_AVAILABILITY' : 'FILTERED'"
              (clearFilters)="store.clearFilters()"
            />
          } @else {
            @for (hotel of store.results(); track hotel.id) {
              <app-hotel-result-card [hotel]="hotel" [nights]="nights()" />
            }
            @if (store.totalPages() > 1) {
              <app-pagination
                [page]="currentPage()"
                [totalPages]="store.totalPages()"
                (pageChange)="store.setPage($event)"
              />
            }
          }
        </div>
      </div>
    </div>

    <app-mobile-filter-sheet
      [open]="mobileFiltersOpen()"
      [filters]="store.filters()"
      [query]="store.query()"
      [sort]="store.sort()"
      (requestClose)="mobileFiltersOpen.set(false)"
      (filtersApplied)="store.setFilters($event)"
    />
  `,
  styles: `
    .page {
      padding-block: var(--space-6) var(--space-16);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .context-row {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .controls {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .filters-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      min-height: 44px;
    }

    .count {
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      border-radius: 999px;
      padding: 1px 7px;
    }

    .partial-banner {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: var(--color-teal-100);
      color: var(--color-teal-600);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
      align-items: start;
    }

    .results {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      transition: opacity var(--transition-base);
    }

    .results.updating {
      opacity: 0.5;
      pointer-events: none;
    }

    @media (min-width: 768px) {
      .context-row {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
      }
      .filters-trigger {
        display: none;
      }
    }

    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 272px 1fr;
      }
    }
  `,
})
export class HotelResultsPageComponent implements OnInit {
  protected readonly store = inject(HotelResultsStore);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly mobileFiltersOpen = signal(false);
  protected readonly skeletonRows = [1, 2, 3];
  protected readonly isFiltersEmpty = isFiltersEmpty;

  protected readonly nights = computed(() => {
    const { checkIn, checkOut } = this.store.query();
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  });

  protected readonly occupancyLabel = computed(() => {
    const { adults, children, rooms } = this.store.query();
    const adultsLabel = `${adults} adult${adults === 1 ? '' : 's'}`;
    const childrenLabel = children > 0 ? `, ${children} child${children === 1 ? '' : 'ren'}` : '';
    const roomsLabel = `${rooms} room${rooms === 1 ? '' : 's'}`;
    return `${adultsLabel}${childrenLabel} · ${roomsLabel}`;
  });

  protected readonly currentPage = computed(() => this.store.page());
  protected readonly activeFilters = computed(() => activeFilterCount(this.store.filters()));

  ngOnInit(): void {
    this.title.setTitle('Hotels — Meridian Travel');
    this.meta.updateTag({
      name: 'description',
      content: 'Compare hotels with transparent pricing, clear cancellation policies and instant confirmation.',
    });
  }
}
