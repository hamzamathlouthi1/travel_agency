import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RatePlan } from '../../../public/hotels/models/rate-plan.model';
import { Money } from '../../../../shared/types/money.model';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';

// Never invents a fee line — the mock rate model only ever carries a total,
// a per-night price, and whether taxes are included (see TaxesInfo). If a
// future supplier feed adds real itemized fees, add a line here rather than
// approximating one now.
@Component({
  selector: 'app-price-breakdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <section class="section" aria-labelledby="price-breakdown-heading">
      <h2 id="price-breakdown-heading" class="section-title">Price</h2>
      <div class="row">
        <span>{{ nights() }} night{{ nights() === 1 ? '' : 's' }} &times; {{ rate().pricePerNight | money }}</span>
        <span class="v">{{ rate().totalPrice | money }}</span>
      </div>
      <div class="row">
        <span>Taxes &amp; fees</span>
        <span class="v">{{ rate().taxes.included ? 'Included' : 'Payable at the property' }}</span>
      </div>
      <div class="total-row">
        <span>Total</span>
        <span class="total-amount">{{ total() | money }}</span>
      </div>
    </section>
  `,
  styles: `
    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .section-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
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
      padding-block-start: var(--space-3);
      border-block-start: 1px solid var(--color-surface-subtle);
      font-weight: var(--font-weight-extrabold);
    }

    .total-amount {
      font-size: var(--font-size-xl);
    }
  `,
})
export class PriceBreakdownComponent {
  readonly rate = input.required<RatePlan>();
  readonly nights = input.required<number>();
  // The booking's current agreed price — authoritative over rate.totalPrice
  // once a price-change has been accepted (see BookingReviewStore.acceptPriceChange).
  readonly total = input.required<Money>();
}
