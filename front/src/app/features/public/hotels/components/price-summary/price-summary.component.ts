import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Money } from '../../../../../shared/types/money.model';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';

// Total-first pricing hierarchy: the stay total is what a traveller
// actually evaluates, so it carries the most visual weight; per-night is
// always secondary. Taxes status is always stated in words, never implied.
@Component({
  selector: 'app-price-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe],
  template: `
    <div class="price">
      <span class="context">{{ nights() }} night{{ nights() === 1 ? '' : 's' }}, {{ occupancyLabel() }}</span>
      <span class="total">{{ totalPrice() | money }}</span>
      <span class="taxes" [class.excluded]="!taxesIncluded()">
        {{ taxesIncluded() ? 'total · taxes included' : 'total · taxes & fees excluded' }}
      </span>
      <span class="per-night">{{ pricePerNight() | money }} / night</span>
    </div>
  `,
  styles: `
    .price {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: end;
      gap: 1px;
    }

    .context {
      font-size: 10.5px;
      color: var(--color-text-muted);
    }

    .total {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-xl);
      color: var(--color-text-primary);
      white-space: nowrap;
    }

    .taxes {
      font-size: 10.5px;
      color: var(--color-text-muted);
    }

    .taxes.excluded {
      color: color-mix(in srgb, var(--color-warning) 55%, black);
      font-weight: var(--font-weight-semibold);
    }

    .per-night {
      font-size: 10.5px;
      color: var(--color-text-muted);
    }
  `,
})
export class PriceSummaryComponent {
  readonly totalPrice = input.required<Money>();
  readonly pricePerNight = input.required<Money>();
  readonly taxesIncluded = input(true);
  readonly nights = input.required<number>();
  readonly occupancyLabel = input('2 adults');
}
