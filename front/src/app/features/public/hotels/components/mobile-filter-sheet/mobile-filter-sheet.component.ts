import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, map, switchMap } from 'rxjs';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { FilterFormComponent } from '../filter-form/filter-form.component';
import { HotelFilters, createEmptyFilters } from '../../models/hotel-filter.model';
import { HotelSearchQuery } from '../../models/hotel-search-query.model';
import { HotelSortKey } from '../../models/hotel-sort.model';
import { HOTEL_SEARCH_PROVIDER } from '../../data-access/hotel-search.provider';

// Bottom sheet, per the approved mobile design language. Filter changes
// stage locally (never touch the URL) until the traveller taps
// "Show N stays" — the preview count is a live query against the same
// provider the page itself uses, so it's never a guess.
@Component({
  selector: 'app-mobile-filter-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrawerComponent, ButtonComponent, FilterFormComponent],
  template: `
    <app-drawer [open]="open()" edge="block-end" label="Filters" (requestClose)="close()">
      <div class="header">
        <span class="title">Filters</span>
        <button type="button" class="clear" (click)="staged.set(emptyFilters)">Clear all</button>
      </div>
      <div class="body">
        <app-filter-form [filters]="staged()" (filtersChange)="staged.set($event)" />
      </div>
      <div class="footer">
        <app-button fullWidth size="lg" (click)="apply()">
          @if (previewCount(); as count) {
            Show {{ count }} {{ count === 1 ? 'stay' : 'stays' }}
          } @else {
            Show stays
          }
        </app-button>
      </div>
    </app-drawer>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-4) var(--space-3);
      border-block-end: 1px solid var(--color-border);
    }

    .title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-md);
    }

    .clear {
      background: none;
      border: none;
      font-size: 12.5px;
      font-weight: var(--font-weight-bold);
      color: var(--color-teal-600);
      cursor: pointer;
    }

    .body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4);
    }

    .footer {
      padding: var(--space-4);
      border-block-start: 1px solid var(--color-border);
    }
  `,
})
export class MobileFilterSheetComponent {
  private readonly provider = inject(HOTEL_SEARCH_PROVIDER);

  readonly open = input(false);
  readonly filters = input.required<HotelFilters>();
  readonly query = input.required<HotelSearchQuery>();
  readonly sort = input.required<HotelSortKey>();
  readonly requestClose = output<void>();
  readonly filtersApplied = output<HotelFilters>();

  protected readonly staged = signal<HotelFilters>(createEmptyFilters());
  protected readonly emptyFilters = createEmptyFilters();

  protected readonly previewCount = toSignal(
    toObservable(this.staged).pipe(
      debounceTime(200),
      switchMap((filters) =>
        this.provider
          .search({
            query: this.query(),
            filters,
            sort: this.sort(),
            page: 1,
            pageSize: 1,
          })
          .pipe(map((response) => response.totalResults)),
      ),
    ),
    { initialValue: undefined },
  );

  constructor() {
    // Re-seed the staged copy from the committed filters each time the
    // sheet opens, so a dismissed-without-applying edit never leaks in.
    toObservable(this.open)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((isOpen) => {
        if (isOpen) this.staged.set(this.filters());
      });
  }

  close(): void {
    this.requestClose.emit();
  }

  apply(): void {
    this.filtersApplied.emit(this.staged());
    this.requestClose.emit();
  }
}
