import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ConfirmationStore } from '../../state/confirmation.store';
import { PaymentSkeletonComponent } from '../../components/payment-skeleton/payment-skeleton.component';
import { PaymentErrorComponent } from '../../components/payment-error/payment-error.component';
import { PaymentUnavailableComponent } from '../../components/payment-unavailable/payment-unavailable.component';
import { ConfirmationHeroComponent } from '../../components/confirmation-hero/confirmation-hero.component';
import { ConfirmedTravellersComponent } from '../../components/confirmed-travellers/confirmed-travellers.component';
import { TripSummaryCardComponent } from '../../../booking/components/trip-summary-card/trip-summary-card.component';
import { CancellationBadgeComponent } from '../../../public/hotels/components/cancellation-badge/cancellation-badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';

// Orchestrates only: reads ConfirmationStore, wires child components, sets
// SEO metadata. All fetch/redirect logic (never showing an unpaid booking
// as confirmed) lives in the store.
@Component({
  selector: 'app-confirmation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationStore],
  imports: [
    PaymentSkeletonComponent,
    PaymentErrorComponent,
    PaymentUnavailableComponent,
    ConfirmationHeroComponent,
    ConfirmedTravellersComponent,
    TripSummaryCardComponent,
    CancellationBadgeComponent,
    ButtonComponent,
    MoneyPipe,
  ],
  template: `
    <div class="container page">
      @if (store.invalidRequest()) {
        <app-payment-unavailable reason="MISSING" />
      } @else if (store.error()) {
        <app-payment-error (retry)="store.retryBooking(); store.retryHotel()" />
      } @else if (store.loading()) {
        <app-payment-skeleton />
      } @else if (store.bookingNotFound()) {
        <app-payment-unavailable reason="NOT_FOUND" />
      } @else {
        @let hotel = store.hotel()!;
        @let room = store.room();
        @let rate = store.rate();
        @let booking = store.booking()!;

        <app-confirmation-hero [reference]="booking.reference" />

        <div class="grid">
          @if (hotel && room && rate) {
            <app-trip-summary-card
              [hotel]="hotel"
              [room]="room"
              [rate]="rate"
              [checkIn]="booking.selection.checkIn"
              [checkOut]="booking.selection.checkOut"
              [occupancyLabel]="occupancyLabel(booking.selection.adults, booking.selection.children)"
            />
          }

          <app-confirmed-travellers
            [leadTraveller]="booking.leadTraveller"
            [contact]="booking.contact"
            [additionalTravellers]="booking.additionalTravellers"
          />

          <section class="section" aria-labelledby="payment-status-heading">
            <h2 id="payment-status-heading" class="section-title">Payment</h2>
            <p class="line"><span class="v">Paid</span> &middot; {{ booking.totalPrice | money }}</p>
            @if (booking.paymentReference) {
              <p class="line muted">Payment reference {{ booking.paymentReference }}</p>
            }
          </section>

          @if (rate) {
            <section class="section" aria-labelledby="cancellation-heading">
              <h2 id="cancellation-heading" class="section-title">Cancellation</h2>
              <app-cancellation-badge [policy]="rate.cancellationPolicy" />
            </section>
          }

          <section class="section" aria-labelledby="next-steps-heading">
            <h2 id="next-steps-heading" class="section-title">Next steps</h2>
            <p class="line muted">
              A confirmation has been recorded for {{ booking.contact.email }}. Bring your booking reference at
              check-in.
            </p>
            <div class="actions">
              <app-button variant="secondary" [navLink]="['/account', 'bookings', booking.id]">View booking</app-button>
              <app-button variant="primary" [navLink]="['/']">Return home</app-button>
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      padding-block: var(--space-5) var(--space-16);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      max-width: 640px;
      margin-inline: auto;
      width: 100%;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .section-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
    }

    .line {
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .line .v {
      font-weight: var(--font-weight-bold);
      color: var(--color-success);
    }

    .line.muted {
      color: var(--color-text-muted);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-block-start: var(--space-2);
    }
  `,
})
export class ConfirmationPageComponent {
  protected readonly store = inject(ConfirmationStore);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected occupancyLabel(adults: number, children: number): string {
    const adultsLabel = `${adults} adult${adults === 1 ? '' : 's'}`;
    return children > 0 ? `${adultsLabel}, ${children} child${children === 1 ? '' : 'ren'}` : adultsLabel;
  }

  private readonly updateSeo = effect(() => {
    const booking = this.store.booking();
    if (!booking) return;
    this.title.setTitle(`Booking confirmed — ${booking.reference} — Meridian Travel`);
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  });
}
