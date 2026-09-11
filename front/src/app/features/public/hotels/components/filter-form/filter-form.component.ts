import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FilterSectionComponent } from '../filter-section/filter-section.component';
import { HotelFilters } from '../../models/hotel-filter.model';
import { AmenityId, BoardType, BOARD_TYPE_LABEL } from '../../models/hotel-result.model';

interface BoardOption {
  readonly value: BoardType;
  readonly label: string;
}
interface AmenityOption {
  readonly value: AmenityId;
  readonly label: string;
}

// Filter content shared by the desktop sidebar and the mobile sheet — one
// place defining every filter group, so the two surfaces can never drift
// apart. Purely controlled: emits a full next HotelFilters on every toggle,
// the parent decides whether that applies immediately (desktop) or stages
// until "Show N stays" (mobile).
//
// Area and price-range bounds are placeholder mock content — real
// implementation should read available areas/price bounds as facets on the
// search response rather than a static list baked into this component.
const BOARD_OPTIONS: readonly BoardOption[] = (
  ['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'ALL_INCLUSIVE'] as const
).map((value) => ({ value, label: BOARD_TYPE_LABEL[value] }));

const AMENITY_OPTIONS: readonly AmenityOption[] = [
  { value: 'wifi', label: 'Free Wi-Fi' },
  { value: 'pool', label: 'Pool' },
  { value: 'parking', label: 'Parking' },
  { value: 'airport-shuttle', label: 'Airport shuttle' },
  { value: 'spa', label: 'Spa' },
  { value: 'family-rooms', label: 'Family rooms' },
];

const AREA_OPTIONS: readonly string[] = ['Sultanahmet', 'Taksim', 'Beyoğlu', 'Kadıköy'];

@Component({
  selector: 'app-filter-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterSectionComponent],
  template: `
    <app-filter-section title="Price · total stay">
      <div class="price-row">
        <label class="price-field">
          <span class="visually-hidden">Minimum price</span>
          <input
            type="number"
            inputmode="numeric"
            placeholder="Min"
            [value]="filters().minPrice ?? ''"
            (change)="patch({ minPrice: toNumber($any($event.target).value) })"
          />
        </label>
        <span class="dash" aria-hidden="true">—</span>
        <label class="price-field">
          <span class="visually-hidden">Maximum price</span>
          <input
            type="number"
            inputmode="numeric"
            placeholder="Max"
            [value]="filters().maxPrice ?? ''"
            (change)="patch({ maxPrice: toNumber($any($event.target).value) })"
          />
        </label>
      </div>
    </app-filter-section>

    <app-filter-section title="Star category">
      @for (star of [5, 4, 3, 2]; track star) {
        <label class="row">
          <input
            type="checkbox"
            [checked]="filters().stars.includes(star)"
            (change)="toggleListValue('stars', star)"
          />
          {{ star }} stars
        </label>
      }
    </app-filter-section>

    <app-filter-section title="Guest rating">
      <div class="chip-row">
        @for (rating of [9, 8, 7]; track rating) {
          <button
            type="button"
            class="chip"
            [class.active]="filters().minGuestRating === rating"
            (click)="patch({ minGuestRating: filters().minGuestRating === rating ? null : rating })"
          >
            {{ rating }}+ {{ rating === 9 ? 'Exceptional' : rating === 8 ? 'Excellent' : 'Good' }}
          </button>
        }
      </div>
    </app-filter-section>

    <app-filter-section title="Board">
      @for (option of boardOptions; track option.value) {
        <label class="row">
          <input
            type="checkbox"
            [checked]="filters().boardTypes.includes(option.value)"
            (change)="toggleListValue('boardTypes', option.value)"
          />
          {{ option.label }}
        </label>
      }
    </app-filter-section>

    <app-filter-section title="Cancellation">
      <label class="row">
        <input
          type="checkbox"
          [checked]="filters().freeCancellationOnly"
          (change)="patch({ freeCancellationOnly: !filters().freeCancellationOnly })"
        />
        Free cancellation
      </label>
    </app-filter-section>

    <app-filter-section title="Amenities">
      @for (option of amenityOptions; track option.value) {
        <label class="row">
          <input
            type="checkbox"
            [checked]="filters().amenities.includes(option.value)"
            (change)="toggleListValue('amenities', option.value)"
          />
          {{ option.label }}
        </label>
      }
    </app-filter-section>

    <app-filter-section title="Area">
      @for (area of areaOptions; track area) {
        <label class="row">
          <input
            type="checkbox"
            [checked]="filters().areas.includes(area)"
            (change)="toggleListValue('areas', area)"
          />
          {{ area }}
        </label>
      }
    </app-filter-section>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      padding-block: 5px;
      min-height: 32px;
      cursor: pointer;
    }

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      accent-color: var(--color-ink-950);
      flex-shrink: 0;
    }

    .chip-row {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      align-items: flex-start;
    }

    .chip {
      font-size: 12.5px;
      font-weight: var(--font-weight-semibold);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      padding: 7px 14px;
      background: var(--color-surface);
      cursor: pointer;
    }

    .chip.active {
      background: var(--color-ink-950);
      border-color: var(--color-ink-950);
      color: var(--color-text-inverse);
      font-weight: var(--font-weight-bold);
    }

    .price-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .price-field {
      flex: 1;
    }

    .price-field input {
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 8px 10px;
    }

    .price-field input:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .dash {
      color: var(--color-text-muted);
    }

    input:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  `,
})
export class FilterFormComponent {
  readonly filters = input.required<HotelFilters>();
  readonly filtersChange = output<HotelFilters>();

  protected readonly boardOptions = BOARD_OPTIONS;
  protected readonly amenityOptions = AMENITY_OPTIONS;
  protected readonly areaOptions = AREA_OPTIONS;

  protected patch(change: Partial<HotelFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...change });
  }

  protected toggleListValue(
    key: 'stars' | 'boardTypes' | 'amenities' | 'areas',
    value: number | BoardType | AmenityId | string,
  ): void {
    const current = this.filters()[key] as readonly unknown[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.patch({ [key]: next } as Partial<HotelFilters>);
  }

  protected toNumber(value: string): number | null {
    if (value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
