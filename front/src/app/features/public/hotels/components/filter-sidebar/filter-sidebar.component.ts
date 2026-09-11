import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterFormComponent } from '../filter-form/filter-form.component';
import { HotelFilters, isFiltersEmpty } from '../../models/hotel-filter.model';

// Persistent desktop sidebar — every change applies immediately (no
// desktop user should be forced through a modal per filter).
@Component({
  selector: 'app-filter-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterFormComponent],
  template: `
    <aside class="sidebar" aria-label="Filters">
      <div class="head">
        <span class="title">Filters</span>
        @if (!isEmpty()) {
          <button type="button" class="clear" (click)="filtersChange.emit(emptyFilters)">
            Clear all
          </button>
        }
      </div>
      <app-filter-form [filters]="filters()" (filtersChange)="filtersChange.emit($event)" />
    </aside>
  `,
  styles: `
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      position: sticky;
      inset-block-start: var(--space-5);
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-sm);
    }

    .clear {
      background: none;
      border: none;
      font-size: 12.5px;
      font-weight: var(--font-weight-bold);
      color: var(--color-teal-600);
      cursor: pointer;
    }
  `,
})
export class FilterSidebarComponent {
  readonly filters = input.required<HotelFilters>();
  readonly filtersChange = output<HotelFilters>();

  protected readonly emptyFilters: HotelFilters = {
    minPrice: null,
    maxPrice: null,
    stars: [],
    minGuestRating: null,
    boardTypes: [],
    freeCancellationOnly: false,
    amenities: [],
    areas: [],
  };

  protected isEmpty(): boolean {
    return isFiltersEmpty(this.filters());
  }
}
