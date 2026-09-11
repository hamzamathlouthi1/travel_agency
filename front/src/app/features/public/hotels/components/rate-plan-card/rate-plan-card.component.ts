import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RatePlan } from '../../models/rate-plan.model';
import { BOARD_TYPE_LABEL } from '../../models/hotel-result.model';
import { CancellationBadgeComponent } from '../cancellation-badge/cancellation-badge.component';
import { PriceSummaryComponent } from '../price-summary/price-summary.component';
import { AvailabilityMessageComponent } from '../availability-message/availability-message.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';

// One rate plan under a room. The board + cancellation + price are always
// shown together so two rates for the same room never look interchangeable
// — the traveller must be able to see WHY the prices differ. The Select
// button's accessible name repeats the room name and key terms so a
// screen-reader user gets the full context without needing surrounding markup.
@Component({
  selector: 'app-rate-plan-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CancellationBadgeComponent, PriceSummaryComponent, AvailabilityMessageComponent, ButtonComponent, DecimalPipe],
  template: `
    <li class="rate" [class.selected]="selected()" [class.sold-out]="soldOut()">
      <div class="terms">
        <span class="board">{{ boardLabel() }}</span>
        @if (!soldOut()) {
          <app-cancellation-badge [policy]="rate().cancellationPolicy" />
          <app-availability-message [signal]="rate().availability" />
        } @else {
          <span class="sold-out-label">Sold out for these dates</span>
        }
      </div>

      <div class="action">
        @if (soldOut()) {
          <span class="struck">{{ rate().totalPrice.amount | number: '1.0-0' }} {{ rate().totalPrice.currency }}</span>
          <app-button variant="ghost" size="md" [disabled]="true">Sold out</app-button>
        } @else {
          <app-price-summary
            [totalPrice]="rate().totalPrice"
            [pricePerNight]="rate().pricePerNight"
            [taxesIncluded]="rate().taxes.included"
            [nights]="nights()"
            [occupancyLabel]="occupancyLabel()"
          />
          @if (selected()) {
            <app-button variant="primary" size="md" [attr.aria-label]="selectedLabel()">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" fill="none" /></svg>
              Selected
            </app-button>
          } @else {
            <app-button
              variant="secondary"
              size="md"
              [attr.aria-label]="selectLabel()"
              (click)="select.emit()"
            >
              Select
            </app-button>
          }
        }
      </div>
    </li>
  `,
  styles: `
    .rate {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      border-block-start: 1px solid var(--color-surface-subtle);
      flex-wrap: wrap;
    }

    .rate.selected {
      background: var(--color-teal-100);
    }

    .rate.sold-out {
      opacity: 0.6;
    }

    .terms {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .board {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .sold-out-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .action {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .struck {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
      color: var(--color-ink-300);
      text-decoration: line-through;
    }
  `,
})
export class RatePlanCardComponent {
  readonly rate = input.required<RatePlan>();
  readonly roomName = input.required<string>();
  readonly nights = input(1);
  readonly occupancyLabel = input('2 adults');
  readonly selected = input(false);
  readonly soldOut = input(false);
  readonly select = output<void>();

  protected readonly boardLabel = computed(() => BOARD_TYPE_LABEL[this.rate().boardType]);

  protected selectLabel(): string {
    return `Select rate for ${this.roomName()}: ${this.boardLabel()}, ${this.rate().totalPrice.amount} ${this.rate().totalPrice.currency} total`;
  }

  protected selectedLabel(): string {
    return `${this.roomName()}, ${this.boardLabel()} — selected`;
  }
}
