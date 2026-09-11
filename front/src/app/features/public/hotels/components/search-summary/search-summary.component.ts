import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { HotelSearchQuery } from '../../models/hotel-search-query.model';
import { TravelSearchComponent } from '../../../search/components/travel-search/travel-search.component';
import { formatDateRange } from '../../../../../shared/utils/date.util';

// Collapsed by default: destination/dates/travellers plus "Modify search".
// Tapping it reveals the same approved TravelSearchComponent used on the
// homepage — never a redesigned, bespoke search editor.
@Component({
  selector: 'app-search-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TravelSearchComponent],
  template: `
    @if (!editing()) {
      <div class="summary">
        <div class="fields">
          <div class="field">
            <span class="k">Destination</span>
            <span class="v">{{ query().destination || 'Anywhere' }}</span>
          </div>
          <span class="divider"></span>
          <div class="field">
            <span class="k">Check-in — check-out</span>
            <span class="v">{{ dateRangeLabel() }} · {{ nights() }} night{{ nights() === 1 ? '' : 's' }}</span>
          </div>
          <span class="divider"></span>
          <div class="field">
            <span class="k">Travellers &amp; rooms</span>
            <span class="v">{{ occupancyLabel() }}</span>
          </div>
        </div>
        <button type="button" class="modify" (click)="editing.set(true)">Modify search</button>
      </div>
    } @else {
      <div class="editor">
        <app-travel-search />
        <button type="button" class="cancel" (click)="editing.set(false)">Cancel</button>
      </div>
    }
  `,
  styles: `
    .summary {
      display: flex;
      align-items: stretch;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      flex-wrap: wrap;
    }

    .fields {
      display: flex;
      flex: 1;
      flex-wrap: wrap;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: var(--space-3) var(--space-4);
      min-width: 0;
    }

    .k {
      font-size: 10.5px;
      font-weight: var(--font-weight-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .v {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .divider {
      width: 1px;
      background: var(--color-border);
      margin-block: var(--space-2);
    }

    .modify {
      flex-shrink: 0;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      border: none;
      padding: 0 var(--space-5);
      cursor: pointer;
    }

    .modify:hover {
      background: var(--color-ink-900);
    }

    .editor {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .cancel {
      align-self: flex-start;
      background: none;
      border: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-muted);
      cursor: pointer;
      padding: var(--space-2);
    }

    @media (max-width: 767px) {
      .fields {
        display: none;
      }
      .summary {
        flex-direction: column;
      }
      .modify {
        padding: var(--space-3);
        text-align: start;
      }
    }
  `,
})
export class SearchSummaryComponent {
  readonly query = input.required<HotelSearchQuery>();
  readonly locale = input('en-US');

  protected readonly editing = signal(false);

  protected readonly nights = computed(() => {
    const { checkIn, checkOut } = this.query();
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  });

  protected readonly dateRangeLabel = computed(() => {
    const { checkIn, checkOut } = this.query();
    return formatDateRange(checkIn, checkOut, this.locale());
  });

  protected readonly occupancyLabel = computed(() => {
    const { adults, children, rooms } = this.query();
    const adultsLabel = `${adults} adult${adults === 1 ? '' : 's'}`;
    const childrenLabel = children > 0 ? `, ${children} child${children === 1 ? '' : 'ren'}` : '';
    const roomsLabel = `${rooms} room${rooms === 1 ? '' : 's'}`;
    return `${adultsLabel}${childrenLabel} · ${roomsLabel}`;
  });
}
