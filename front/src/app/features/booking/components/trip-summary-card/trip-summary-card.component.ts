import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HotelDetail } from '../../../public/hotels/models/hotel-detail.model';
import { HotelRoom } from '../../../public/hotels/models/room.model';
import { RatePlan } from '../../../public/hotels/models/rate-plan.model';
import { BOARD_TYPE_LABEL } from '../../../public/hotels/models/hotel-result.model';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';

// Read-only recap of what's being booked — no verification/CTA logic here
// (that already happened on the hotel detail page); this just keeps the
// traveller oriented while they fill in traveller details.
@Component({
  selector: 'app-trip-summary-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <aside class="card" aria-label="Trip summary">
      <div class="head">
        <div class="hotel-name">{{ hotel().name }}</div>
        <div class="room-name">{{ room().name }} · {{ boardLabel() }}</div>
      </div>
      <div class="rows">
        <div class="row"><span>Check-in</span><span class="v">{{ checkIn() }}</span></div>
        <div class="row"><span>Check-out</span><span class="v">{{ checkOut() }}</span></div>
        <div class="row"><span>Guests</span><span class="v">{{ occupancyLabel() }}</span></div>
      </div>
      <div class="total-row">
        <span>Total</span>
        <span class="total-amount">{{ rate().totalPrice | money }}</span>
      </div>
    </aside>
  `,
  styles: `
    .card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .head {
      padding: var(--space-4) var(--space-5);
      border-block-end: 1px solid var(--color-surface-subtle);
    }

    .hotel-name {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-sm);
    }

    .room-name {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin-block-start: 2px;
    }

    .rows {
      padding: var(--space-4) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      border-block-end: 1px solid var(--color-surface-subtle);
    }

    .row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .row .v {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: var(--space-4) var(--space-5);
      font-weight: var(--font-weight-extrabold);
    }

    .total-amount {
      font-size: var(--font-size-xl);
    }
  `,
})
export class TripSummaryCardComponent {
  readonly hotel = input.required<HotelDetail>();
  readonly room = input.required<HotelRoom>();
  readonly rate = input.required<RatePlan>();
  readonly checkIn = input.required<string>();
  readonly checkOut = input.required<string>();
  readonly occupancyLabel = input.required<string>();

  protected boardLabel(): string {
    return BOARD_TYPE_LABEL[this.rate().boardType];
  }
}
