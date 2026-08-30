import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BookingReviewStore } from '../../state/booking-review.store';
import { CheckoutSkeletonComponent } from '../../components/checkout-skeleton/checkout-skeleton.component';
import { CheckoutErrorComponent } from '../../components/checkout-error/checkout-error.component';
import { BookingUnavailableComponent } from '../../components/booking-unavailable/booking-unavailable.component';
import { TravellerSummaryComponent } from '../../components/traveller-summary/traveller-summary.component';
import { PriceBreakdownComponent } from '../../components/price-breakdown/price-breakdown.component';
import { RateRecheckPanelComponent } from '../../components/rate-recheck-panel/rate-recheck-panel.component';
import { TripSummaryCardComponent } from '../../../booking/components/trip-summary-card/trip-summary-card.component';
import { CancellationBadgeComponent } from '../../../public/hotels/components/cancellation-badge/cancellation-badge.component';
import { BOARD_TYPE_LABEL } from '../../../public/hotels/models/hotel-result.model';
import { PAYMENT_TIMING_LABEL } from '../../../public/hotels/models/rate-plan.model';

// Orchestrates only: reads BookingReviewStore, wires child components, sets
// SEO metadata. All fetch/verification/navigation logic lives in the store.
@Component({
  selector: 'app-booking-review-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BookingReviewStore],
  imports: [
    RouterLink,
    CheckoutSkeletonComponent,
    CheckoutErrorComponent,
    BookingUnavailableComponent,
    TravellerSummaryComponent,
    PriceBreakdownComponent,
    RateRecheckPanelComponent,
    TripSummaryCardComponent,
    CancellationBadgeComponent,
  ],
  template: `
    <div class="container page">
      @if (store.invalidRequest()) {
        <app-booking-unavailable reason="MISSING" />
      } @else if (store.error()) {
        <app-checkout-error (retry)="store.retryBooking(); store.retryHotel()" />
      } @else if (store.loading()) {
        <app-checkout-skeleton />
      } @else if (store.bookingNotFound()) {
        <app-booking-unavailable reason="NOT_FOUND" />
      } @else if (store.staleBooking()) {
        <app-booking-unavailable reason="STALE" />
      } @else {
        @let hotel = store.hotel()!;
        @let room = store.room()!;
        @let rate = store.rate()!;
        @let booking = store.booking()!;

        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a> / <a routerLink="/hotels">Hotels</a> /
          <span aria-current="page">Review your booking</span>
        </nav>

        <h1 class="heading">Review your booking</h1>

        <div class="layout">
          <div class="main">
            <app-trip-summary-card
              [hotel]="hotel"
              [room]="room"
              [rate]="rate"
              [checkIn]="booking.selection.checkIn"
              [checkOut]="booking.selection.checkOut"
              [occupancyLabel]="occupancyLabel()"
            />

            <app-traveller-summary
              [leadTraveller]="booking.leadTraveller"
              [contact]="booking.contact"
              [additionalTravellers]="booking.additionalTravellers"
              (edit)="store.editTravellers()"
            />

            <app-price-breakdown [rate]="rate" [nights]="nights()" [total]="booking.totalPrice" />

            <section class="section" aria-labelledby="conditions-heading">
              <h2 id="conditions-heading" class="section-title">Conditions</h2>
              <app-cancellation-badge [policy]="rate.cancellationPolicy" />
              <p class="condition-line">{{ boardLabel() }}</p>
              @if (paymentTimingLabel()) {
                <p class="condition-line">{{ paymentTimingLabel() }}</p>
              }
              @if (booking.specialRequests) {
                <p class="condition-line">Special request: {{ booking.specialRequests }}</p>
              }
              <p class="terms-note">
                By continuing you agree to the property's rate conditions and the
                <a routerLink="/terms">terms &amp; conditions</a>.
              </p>
            </section>
          </div>

          <div class="side">
            <app-rate-recheck-panel
              [verifying]="store.verifying()"
              [result]="store.verificationResult()"
              (continueClicked)="store.verifyAndContinue()"
              (acceptPriceChange)="store.acceptPriceChange()"
              (retry)="store.retryVerification()"
              (seeOtherRates)="store.returnToRoomSelection()"
            />
          </div>
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

    .breadcrumb {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .breadcrumb a {
      color: var(--color-text-muted);
    }

    .heading {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .main {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      min-width: 0;
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
      margin: 0 0 var(--space-1);
    }

    .condition-line {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .terms-note {
      margin: var(--space-2) 0 0;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .side {
      position: static;
    }

    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 1fr 360px;
      }

      .side {
        position: sticky;
        inset-block-start: var(--space-5);
      }
    }
  `,
})
export class BookingReviewPageComponent {
  protected readonly store = inject(BookingReviewStore);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly selection = computed(() => this.store.booking()?.selection ?? null);

  protected readonly nights = computed(() => {
    const selection = this.selection();
    if (!selection) return 1;
    const ms = new Date(selection.checkOut).getTime() - new Date(selection.checkIn).getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  });

  protected readonly occupancyLabel = computed(() => {
    const selection = this.selection();
    if (!selection) return '';
    const adultsLabel = `${selection.adults} adult${selection.adults === 1 ? '' : 's'}`;
    return selection.children > 0
      ? `${adultsLabel}, ${selection.children} child${selection.children === 1 ? '' : 'ren'}`
      : adultsLabel;
  });

  protected boardLabel(): string {
    const rate = this.store.rate();
    return rate ? BOARD_TYPE_LABEL[rate.boardType] : '';
  }

  protected paymentTimingLabel(): string | null {
    const timing = this.store.rate()?.paymentTiming;
    return timing ? PAYMENT_TIMING_LABEL[timing] : null;
  }

  private readonly updateSeo = effect(() => {
    const hotel = this.store.hotel();
    if (!hotel) return;
    this.title.setTitle(`Review your booking — ${hotel.name} — Meridian Travel`);
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  });
}
