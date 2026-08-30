import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { PaymentStore } from '../../state/payment.store';
import { PaymentSkeletonComponent } from '../../components/payment-skeleton/payment-skeleton.component';
import { PaymentErrorComponent } from '../../components/payment-error/payment-error.component';
import { PaymentUnavailableComponent } from '../../components/payment-unavailable/payment-unavailable.component';
import { CardFormComponent } from '../../components/card-form/card-form.component';
import { PaymentResultPanelComponent } from '../../components/payment-result-panel/payment-result-panel.component';
import { TripSummaryCardComponent } from '../../../booking/components/trip-summary-card/trip-summary-card.component';
import { MoneyPipe } from '../../../../shared/pipes/money.pipe';

// Orchestrates only: reads PaymentStore, wires child components, sets SEO
// metadata. All fetch/charge/navigation logic lives in the store; all card
// field state lives in CardFormComponent. This page never sees raw card
// details — only the CardDetails object CardFormComponent emits once, on
// submit, which is forwarded straight into store.submit() and never stored.
@Component({
  selector: 'app-payment-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PaymentStore],
  imports: [
    RouterLink,
    PaymentSkeletonComponent,
    PaymentErrorComponent,
    PaymentUnavailableComponent,
    CardFormComponent,
    PaymentResultPanelComponent,
    TripSummaryCardComponent,
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
      } @else if (store.staleBooking()) {
        <app-payment-unavailable reason="STALE" />
      } @else {
        @let hotel = store.hotel()!;
        @let room = store.room()!;
        @let rate = store.rate()!;
        @let booking = store.booking()!;

        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a> / <a routerLink="/hotels">Hotels</a> /
          <span aria-current="page">Payment</span>
        </nav>

        <h1 class="heading">Payment</h1>
        <p class="reassurance">Your payment details are only used for this transaction.</p>

        <div class="layout">
          <app-trip-summary-card
            [hotel]="hotel"
            [room]="room"
            [rate]="rate"
            [checkIn]="booking.selection.checkIn"
            [checkOut]="booking.selection.checkOut"
            [occupancyLabel]="occupancyLabel(booking.selection.adults, booking.selection.children)"
          />

          <section class="pay-section" aria-labelledby="pay-heading">
            <h2 id="pay-heading" class="section-title">Amount due</h2>
            <div class="amount-due">{{ booking.totalPrice | money }}</div>
            <p class="cancellation-note">Cancellation terms were confirmed at Booking Review and still apply.</p>

            <app-payment-result-panel
              [processing]="store.processing()"
              [result]="store.result()"
              (retry)="store.clearResult()"
            />

            <app-card-form
              [disabled]="store.processing()"
              [payLabel]="'Pay ' + (booking.totalPrice | money)"
              (pay)="store.submit($event)"
            />

            <a routerLink="/checkout" [queryParams]="{ bookingId: booking.id }" class="cancel-link">
              Cancel and return to review
            </a>
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

    .reassurance {
      margin: calc(var(--space-4) * -1) 0 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-6);
      align-items: start;
    }

    .pay-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .section-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
    }

    .amount-due {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-extrabold);
    }

    .cancellation-note {
      margin: calc(var(--space-2) * -1) 0 0;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .cancel-link {
      align-self: center;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 360px 1fr;
      }
    }
  `,
})
export class PaymentPageComponent {
  protected readonly store = inject(PaymentStore);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected occupancyLabel(adults: number, children: number): string {
    const adultsLabel = `${adults} adult${adults === 1 ? '' : 's'}`;
    return children > 0 ? `${adultsLabel}, ${children} child${children === 1 ? '' : 'ren'}` : adultsLabel;
  }

  private readonly updateSeo = effect(() => {
    const hotel = this.store.hotel();
    if (!hotel) return;
    this.title.setTitle(`Payment — ${hotel.name} — Meridian Travel`);
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  });
}
