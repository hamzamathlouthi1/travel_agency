import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RateVerificationResult } from '../../../public/hotels/models/rate-verification.model';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';

type Phase = 'idle' | 'verifying' | 'price-changed' | 'sold-out' | 'error';

// The last thing the traveller sees before Payment: a live re-check of the
// rate they reviewed. Every outcome is announced (aria-live), never
// color-only — price changes and sold-out both require an explicit action,
// never a silent continue. Mirrors the four RateVerificationResult
// outcomes BookingSummaryPanelComponent already established on the hotel
// detail page; this is the Booking Review equivalent, not a second system.
@Component({
  selector: 'app-rate-recheck-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe, ButtonComponent, SpinnerComponent],
  template: `
    <div class="panel" aria-live="polite">
      @switch (phase()) {
        @case ('verifying') {
          <div class="state verifying" role="status">
            <app-spinner size="sm" />
            <span>Confirming this rate is still available&hellip;</span>
          </div>
        }
        @case ('price-changed') {
          <div class="state price-changed" role="alert">
            <div class="state-title">The price for this room has changed</div>
            <div class="price-compare">
              <span class="was">Previous total <b>{{ result()!.previousPrice! | money }}</b></span>
              <span class="now">New total <b>{{ result()!.latestPrice! | money }}</b></span>
            </div>
            <p class="hint">You won't be charged until you accept this new price.</p>
            <div class="actions">
              <app-button variant="secondary" (click)="seeOtherRates.emit()">Choose another room</app-button>
              <app-button variant="primary" (click)="acceptPriceChange.emit()">Accept &amp; continue</app-button>
            </div>
          </div>
        }
        @case ('sold-out') {
          <div class="state sold-out" role="alert">
            <div class="state-title">This room just sold out</div>
            <p class="hint">It was booked while you were reviewing your details. Other rooms may still be open.</p>
            <app-button variant="primary" (click)="seeOtherRates.emit()">Choose another room</app-button>
          </div>
        }
        @case ('error') {
          <div class="state error" role="alert">
            <div class="state-title">We couldn't confirm this rate</div>
            <p class="hint">Something went wrong on our side.</p>
            <app-button variant="destructive" (click)="retry.emit()">Retry</app-button>
          </div>
        }
        @default {
          <app-button variant="primary" size="lg" fullWidth (click)="continueClicked.emit()">
            Proceed to payment
          </app-button>
        }
      }
    </div>
  `,
  styles: `
    .panel {
      display: flex;
      flex-direction: column;
    }

    .state {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .state.verifying {
      flex-direction: row;
      align-items: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .state-title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-sm);
    }

    .price-changed .state-title {
      color: color-mix(in srgb, var(--color-amber-600) 70%, black);
    }

    .sold-out .state-title,
    .error .state-title {
      color: var(--color-danger);
    }

    .price-compare {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: var(--font-size-sm);
    }

    .was {
      color: var(--color-text-muted);
      text-decoration: line-through;
    }

    .now {
      color: var(--color-text-primary);
    }

    .hint {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-block-start: var(--space-1);
    }

    @media (min-width: 480px) {
      .actions app-button {
        flex: 1;
      }
    }
  `,
})
export class RateRecheckPanelComponent {
  readonly verifying = input(false);
  readonly result = input<RateVerificationResult | null>(null);

  readonly continueClicked = output<void>();
  readonly acceptPriceChange = output<void>();
  readonly retry = output<void>();
  readonly seeOtherRates = output<void>();

  protected readonly phase = computed<Phase>(() => {
    if (this.verifying()) return 'verifying';
    switch (this.result()?.status) {
      case 'AVAILABLE_PRICE_CHANGED':
        return 'price-changed';
      case 'SOLD_OUT':
        return 'sold-out';
      case 'TEMPORARY_ERROR':
        return 'error';
      default:
        return 'idle';
    }
  });
}
