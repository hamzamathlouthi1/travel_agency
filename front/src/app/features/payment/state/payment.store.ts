import { Injectable, PendingTasks, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BOOKING_PROVIDER } from '../../booking/data-access/booking.provider';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { HotelRoom } from '../../public/hotels/models/room.model';
import { RatePlan } from '../../public/hotels/models/rate-plan.model';
import { Booking } from '../../booking/domain/booking.model';
import { PAYMENT_GATEWAY } from '../data-access/payment-gateway.provider';
import { CardDetails } from '../domain/card-details.model';
import { PaymentResult } from '../domain/payment-result.model';

// Owns the Payment step: loads the booking (by id only, same URL boundary
// as Booking Review), re-hydrates the hotel/room/rate for display, and
// submits the charge. Card details are accepted only as a `submit()`
// parameter — never stored on a signal here, never assigned to Booking,
// discarded the instant the gateway call resolves. See PAYMENT_GATEWAY for
// why a real payment success will eventually be backend-authoritative.
@Injectable()
export class PaymentStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingProvider = inject(BOOKING_PROVIDER);
  private readonly detailProvider = inject(HOTEL_DETAIL_PROVIDER);
  private readonly gateway = inject(PAYMENT_GATEWAY);
  private readonly pendingTasks = inject(PendingTasks);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, { requireSync: true });
  readonly bookingId = computed(() => this.queryParamMap().get('bookingId'));
  readonly invalidRequest = computed(() => !this.bookingId());

  private readonly bookingSignal = signal<Booking | null | undefined>(undefined);
  private readonly bookingFetchErrorSignal = signal(false);
  private latestBookingRequestId = 0;

  readonly booking = computed(() => this.bookingSignal() ?? null);
  readonly bookingNotFound = computed(() => this.bookingSignal() === null && !this.bookingFetchErrorSignal());
  readonly bookingFetchError = this.bookingFetchErrorSignal.asReadonly();
  private readonly loadingBooking = computed(
    () => !this.invalidRequest() && this.bookingSignal() === undefined && !this.bookingFetchErrorSignal(),
  );

  private readonly hotelSignal = signal<HotelDetail | null | undefined>(undefined);
  private readonly hotelFetchErrorSignal = signal(false);
  private latestHotelRequestId = 0;

  readonly hotel = computed(() => this.hotelSignal() ?? null);
  readonly hotelFetchError = this.hotelFetchErrorSignal.asReadonly();
  private readonly loadingHotel = computed(
    () => !!this.booking() && this.hotelSignal() === undefined && !this.hotelFetchErrorSignal(),
  );

  readonly loading = computed(() => this.loadingBooking() || this.loadingHotel());
  readonly error = computed(() => this.bookingFetchError() || this.hotelFetchError());

  readonly room = computed<HotelRoom | null>(() => {
    const hotel = this.hotel();
    const booking = this.booking();
    return hotel && booking ? (hotel.rooms.find((r) => r.id === booking.selection.roomId) ?? null) : null;
  });

  readonly rate = computed<RatePlan | null>(() => {
    const room = this.room();
    const booking = this.booking();
    return room && booking ? (room.ratePlans.find((r) => r.id === booking.selection.rateId) ?? null) : null;
  });

  readonly staleBooking = computed(
    () => !this.loading() && !this.error() && !!this.booking() && !!this.hotel() && !this.rate(),
  );

  private readonly processingSignal = signal(false);
  private readonly resultSignal = signal<PaymentResult | null>(null);
  readonly processing = this.processingSignal.asReadonly();
  readonly result = this.resultSignal.asReadonly();

  constructor() {
    effect(() => {
      const id = this.bookingId();
      untracked(() => {
        if (id) this.fetchBooking(id);
      });
    });
    effect(() => {
      const booking = this.booking();
      untracked(() => {
        if (booking) this.fetchHotel(booking.selection.hotelSlug);
      });
    });
    // A booking already CONFIRMED (payment already succeeded, e.g. the
    // traveller navigated back) skips straight to Confirmation rather than
    // offering to charge the card a second time.
    effect(() => {
      const booking = this.booking();
      untracked(() => {
        if (booking?.status === 'CONFIRMED') {
          void this.router.navigate(['/payment', 'confirmation'], { queryParams: { bookingId: booking.id } });
        }
      });
    });
  }

  retryBooking(): void {
    const id = this.bookingId();
    if (id) this.fetchBooking(id);
  }

  retryHotel(): void {
    const booking = this.booking();
    if (booking) this.fetchHotel(booking.selection.hotelSlug);
  }

  // Dismisses a DECLINED/TECHNICAL_ERROR result so the card form is front
  // and center again for another attempt.
  clearResult(): void {
    this.resultSignal.set(null);
  }

  // Guarded against double submission: a second call while one charge is
  // already in flight is a no-op.
  submit(card: CardDetails): void {
    const booking = this.booking();
    if (!booking || this.processingSignal()) return;

    this.processingSignal.set(true);
    this.resultSignal.set(null);
    const completeTask = this.pendingTasks.add();

    this.gateway.charge({ bookingId: booking.id, amount: booking.totalPrice, method: 'CARD', card }).subscribe({
      next: (result) => {
        this.resultSignal.set(result);

        if (result.status !== 'SUCCESS' || !result.gatewayReference) {
          this.processingSignal.set(false);
          completeTask();
          return;
        }

        this.bookingProvider.markPaid(booking.id, result.gatewayReference).subscribe({
          next: (updated) => {
            this.bookingSignal.set(updated);
            this.processingSignal.set(false);
            completeTask();
            void this.router.navigate(['/payment', 'confirmation'], { queryParams: { bookingId: updated.id } });
          },
          error: () => {
            this.processingSignal.set(false);
            this.resultSignal.set({ status: 'TECHNICAL_ERROR', gatewayReference: null, declineReason: null });
            completeTask();
          },
        });
      },
      error: () => {
        this.processingSignal.set(false);
        this.resultSignal.set({ status: 'TECHNICAL_ERROR', gatewayReference: null, declineReason: null });
        completeTask();
      },
    });
  }

  private fetchBooking(id: string): void {
    const requestId = ++this.latestBookingRequestId;
    this.bookingFetchErrorSignal.set(false);
    const completeTask = this.pendingTasks.add();

    this.bookingProvider.getById(id).subscribe({
      next: (booking) => {
        if (requestId === this.latestBookingRequestId) this.bookingSignal.set(booking);
        completeTask();
      },
      error: () => {
        if (requestId === this.latestBookingRequestId) this.bookingFetchErrorSignal.set(true);
        completeTask();
      },
    });
  }

  private fetchHotel(slug: string): void {
    const requestId = ++this.latestHotelRequestId;
    this.hotelFetchErrorSignal.set(false);
    const completeTask = this.pendingTasks.add();

    this.detailProvider.getBySlug(slug).subscribe({
      next: (hotel) => {
        if (requestId === this.latestHotelRequestId) this.hotelSignal.set(hotel);
        completeTask();
      },
      error: () => {
        if (requestId === this.latestHotelRequestId) this.hotelFetchErrorSignal.set(true);
        completeTask();
      },
    });
  }
}
