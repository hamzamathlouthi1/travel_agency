import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HotelDetail } from '../../models/hotel-detail.model';
import { HotelRoom } from '../../models/room.model';
import { RatePlan } from '../../models/rate-plan.model';
import { BOARD_TYPE_LABEL } from '../../models/hotel-result.model';
import { RateVerificationResult } from '../../models/rate-verification.model';
import { MoneyPipe } from '../../../../../shared/pipes/money.pipe';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';

// Desktop sticky sidebar + mobile sticky bottom CTA, one component (CSS
// toggles which renders, both always in the DOM so SSR output is
// consistent regardless of viewport — same pattern as TravelSearchComponent).
// Rate verification's four outcomes render inline here rather than as a
// separate dialog: this is where the traveller's attention already is.
@Component({
  selector: 'app-booking-summary-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MoneyPipe, ButtonComponent, SpinnerComponent],
  template: `
    <!-- DESKTOP -->
    <aside class="desktop-panel" aria-label="Booking summary">
      @if (!rate()) {
        <div class="empty">
          <span class="empty-kicker">Your stay</span>
          <h3>Ready when you are</h3>
          <p>Select a room below to see the full price and continue securely.</p>
          <ul><li>No hidden booking fees</li><li>Instant confirmation</li><li>24/7 travel support</li></ul>
        </div>
      } @else {
        <div class="head">
          <div class="hotel-name">{{ hotel()?.name }}</div>
          <div class="room-name">{{ room()?.name }}</div>
        </div>
        <div class="rows">
          <div class="row"><span>Check-in</span><span class="v">{{ checkIn() }}</span></div>
          <div class="row"><span>Check-out</span><span class="v">{{ checkOut() }}</span></div>
          <div class="row"><span>Guests</span><span class="v">{{ occupancyLabel() }}</span></div>
          <div class="row"><span>Board</span><span class="v">{{ boardLabel() }}</span></div>
        </div>

        @switch (verificationPhase()) {
          @case ('verifying') {
            <div class="verify verifying" role="status">
              <app-spinner size="sm" />
              <span>Confirming this rate is still available&hellip;</span>
            </div>
          }
          @case ('price-changed') {
            <div class="verify price-changed" role="alert">
              <div class="verify-title">Price updated</div>
              <p>
                The latest price for this room is <b>{{ verificationResult()!.latestPrice! | money }}</b>.
                It was {{ verificationResult()!.previousPrice! | money }} when you selected it.
              </p>
              <div class="verify-actions">
                <app-button variant="secondary" size="sm" fullWidth (click)="seeOtherRates.emit()">See other rates</app-button>
                <app-button variant="primary" size="sm" fullWidth (click)="acceptPriceChange.emit()">Accept &amp; continue</app-button>
              </div>
            </div>
          }
          @case ('sold-out') {
            <div class="verify sold-out" role="alert">
              <div class="verify-title">This rate just sold out</div>
              <p>It was booked while you were reviewing. Other rates may still be open.</p>
              <app-button variant="primary" size="sm" fullWidth (click)="seeOtherRates.emit()">See other rates</app-button>
            </div>
          }
          @case ('error') {
            <div class="verify error" role="alert">
              <div class="verify-title">We couldn't confirm this rate</div>
              <p>Something went wrong on our side.</p>
              <app-button variant="destructive" size="sm" fullWidth (click)="retry.emit()">Retry</app-button>
            </div>
          }
          @default {
            <div class="total-row">
              <span>Total</span>
              <span class="total-amount">{{ rate()!.totalPrice | money }}</span>
            </div>
            <div class="cta-slot">
              <app-button variant="primary" size="lg" fullWidth (click)="continueClicked.emit()">
                Continue to travellers
              </app-button>
            </div>
          }
        }
      }
    </aside>

    <!-- MOBILE STICKY CTA -->
    @if (rate()) {
      <div class="mobile-cta" [class.expanded]="verificationPhase() !== 'idle'">
        @switch (verificationPhase()) {
          @case ('verifying') {
            <div class="mobile-verify" role="status">
              <app-spinner size="sm" />
              <span>Confirming availability&hellip;</span>
            </div>
          }
          @case ('price-changed') {
            <div class="mobile-verify-block" role="alert">
              <div class="verify-title">Price updated</div>
              <p>Latest price: <b>{{ verificationResult()!.latestPrice! | money }}</b> (was {{ verificationResult()!.previousPrice! | money }})</p>
              <div class="verify-actions">
                <app-button variant="secondary" size="md" fullWidth (click)="seeOtherRates.emit()">Other rates</app-button>
                <app-button variant="primary" size="md" fullWidth (click)="acceptPriceChange.emit()">Accept</app-button>
              </div>
            </div>
          }
          @case ('sold-out') {
            <div class="mobile-verify-block" role="alert">
              <div class="verify-title">Just sold out</div>
              <app-button variant="primary" size="md" fullWidth (click)="seeOtherRates.emit()">See other rates</app-button>
            </div>
          }
          @case ('error') {
            <div class="mobile-verify-block" role="alert">
              <div class="verify-title">Couldn't confirm this rate</div>
              <app-button variant="destructive" size="md" fullWidth (click)="retry.emit()">Retry</app-button>
            </div>
          }
          @default {
            <div class="mobile-row">
              <div>
                <div class="mobile-total">{{ rate()!.totalPrice | money }}</div>
                <div class="mobile-room">{{ room()?.name }} · total</div>
              </div>
              <app-button variant="primary" size="lg" (click)="continueClicked.emit()">Continue</app-button>
            </div>
          }
        }
      </div>
    }
  `,
  styles: `
    .desktop-panel {
      display: none;
    }

    .empty {
      padding: var(--space-5);
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
    .empty-kicker { color: var(--color-amber-600); font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    .empty h3 { margin: var(--space-2) 0; color: var(--color-text-primary); font-family: var(--font-family-display); font-size: var(--font-size-xl); }
    .empty p { margin: 0; line-height: var(--line-height-relaxed); }
    .empty ul { list-style: none; display: grid; gap: var(--space-2); padding: var(--space-4) 0 0; margin: var(--space-4) 0 0; border-top: 1px solid var(--color-border); }
    .empty li::before { content: '✓'; color: var(--color-success); font-weight: 900; margin-right: 8px; }

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
      padding: var(--space-4) var(--space-5) var(--space-3);
      font-weight: var(--font-weight-extrabold);
    }

    .total-amount {
      font-size: var(--font-size-xl);
    }

    .cta-slot {
      padding: 0 var(--space-5) var(--space-5);
    }

    .verify {
      padding: var(--space-4) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .verify.verifying {
      flex-direction: row;
      align-items: center;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .verify p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--line-height-relaxed);
    }

    .verify-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .verify.price-changed .verify-title {
      color: color-mix(in srgb, var(--color-amber-600) 70%, black);
    }

    .verify.sold-out .verify-title,
    .verify.error .verify-title {
      color: var(--color-danger);
    }

    .verify-actions {
      display: flex;
      gap: var(--space-2);
      margin-block-start: var(--space-2);
    }

    .mobile-cta {
      position: sticky;
      inset-block-end: 0;
      background: var(--color-surface);
      border-block-start: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      padding: var(--space-3) var(--space-4);
      padding-block-end: max(var(--space-3), env(safe-area-inset-bottom));
      z-index: var(--z-sticky);
    }

    .mobile-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
    }

    .mobile-total {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
    }

    .mobile-room {
      font-size: 10.5px;
      color: var(--color-text-muted);
    }

    .mobile-verify {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }

    .mobile-verify-block {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .mobile-verify-block p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin: 0;
    }

    @media (min-width: 1024px) {
      .desktop-panel {
        display: block;
        position: sticky;
        inset-block-start: var(--space-5);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: var(--color-surface);
        box-shadow: var(--shadow-md);
        overflow: hidden;
      }

      .mobile-cta {
        display: none;
      }
    }
  `,
})
export class BookingSummaryPanelComponent {
  readonly hotel = input<HotelDetail | null>(null);
  readonly room = input<HotelRoom | null>(null);
  readonly rate = input<RatePlan | null>(null);
  readonly checkIn = input('');
  readonly checkOut = input('');
  readonly occupancyLabel = input('');
  readonly verifying = input(false);
  readonly verificationResult = input<RateVerificationResult | null>(null);

  readonly continueClicked = output<void>();
  readonly acceptPriceChange = output<void>();
  readonly retry = output<void>();
  readonly seeOtherRates = output<void>();

  protected boardLabel(): string {
    const rate = this.rate();
    return rate ? BOARD_TYPE_LABEL[rate.boardType] : '';
  }

  protected verificationPhase(): 'idle' | 'verifying' | 'price-changed' | 'sold-out' | 'error' {
    if (this.verifying()) return 'verifying';
    const result = this.verificationResult();
    switch (result?.status) {
      case 'AVAILABLE_PRICE_CHANGED':
        return 'price-changed';
      case 'SOLD_OUT':
        return 'sold-out';
      case 'TEMPORARY_ERROR':
        return 'error';
      default:
        return 'idle';
    }
  }
}
