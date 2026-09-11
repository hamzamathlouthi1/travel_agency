import { Injectable, PendingTasks, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BOOKING_PROVIDER } from '../../booking/data-access/booking.provider';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { RATE_VERIFICATION_PROVIDER } from '../../public/hotels/data-access/rate-verification.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { HotelRoom } from '../../public/hotels/models/room.model';
import { RatePlan } from '../../public/hotels/models/rate-plan.model';
import { RateVerificationResult } from '../../public/hotels/models/rate-verification.model';
import { Booking } from '../../booking/domain/booking.model';

type VerificationPhase = 'idle' | 'verifying';

// Owns the Booking Review step: loads the booking created by Traveller
// Details (by id, from the URL — never the whole Booking object), re-hydrates
// the hotel/room/rate for display, and runs the same final rate recheck
// hotel-detail.store.ts already established (RATE_VERIFICATION_PROVIDER —
// there is exactly one verification mechanism in this app). Tri-state signal
// shape (undefined = loading, null = confirmed absent, T = loaded) mirrors
// every other store in the funnel.
@Injectable()
export class BookingReviewStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingProvider = inject(BOOKING_PROVIDER);
  private readonly detailProvider = inject(HOTEL_DETAIL_PROVIDER);
  private readonly verificationProvider = inject(RATE_VERIFICATION_PROVIDER);
  private readonly pendingTasks = inject(PendingTasks);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly bookingId = computed(() => this.queryParamMap().get('bookingId'));
  // No bookingId at all in the URL — never even attempts a fetch.
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

  // Booking + hotel both loaded fine, but the room/rate no longer exists —
  // the underlying inventory changed since the booking was created.
  readonly staleBooking = computed(
    () => !this.loading() && !this.error() && !!this.booking() && !!this.hotel() && !this.rate(),
  );

  private readonly verificationPhaseSignal = signal<VerificationPhase>('idle');
  private readonly verificationResultSignal = signal<RateVerificationResult | null>(null);
  private readonly readyForPaymentSignal = signal(false);

  readonly verifying = computed(() => this.verificationPhaseSignal() === 'verifying');
  readonly verificationResult = this.verificationResultSignal.asReadonly();
  readonly readyForPayment = this.readyForPaymentSignal.asReadonly();

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
  }

  retryBooking(): void {
    const id = this.bookingId();
    if (id) this.fetchBooking(id);
  }

  retryHotel(): void {
    const booking = this.booking();
    if (booking) this.fetchHotel(booking.selection.hotelSlug);
  }

  // AVAILABLE_SAME_PRICE proceeds straight to Payment. Every other outcome
  // stops here and waits for the traveller — same contract as
  // HotelDetailStore.verifyAndContinue.
  verifyAndContinue(): void {
    const rate = this.rate();
    if (!rate || this.verifying()) return;

    this.verificationPhaseSignal.set('verifying');
    this.verificationResultSignal.set(null);

    this.verificationProvider.verify(rate.id).subscribe((result) => {
      this.verificationPhaseSignal.set('idle');
      this.verificationResultSignal.set(result);

      if (result.status === 'AVAILABLE_SAME_PRICE') {
        this.readyForPaymentSignal.set(true);
        this.proceedToPayment();
      }
    });
  }

  retryVerification(): void {
    this.verificationResultSignal.set(null);
    this.verifyAndContinue();
  }

  // The only path that may change an already-created booking's price — and
  // only once the traveller has explicitly accepted the new amount.
  acceptPriceChange(): void {
    const result = this.verificationResult();
    const booking = this.booking();
    if (!booking || result?.status !== 'AVAILABLE_PRICE_CHANGED' || !result.latestPrice) return;

    this.bookingProvider.confirmPrice(booking.id, result.latestPrice).subscribe((updated) => {
      this.bookingSignal.set(updated);
      this.readyForPaymentSignal.set(true);
      this.proceedToPayment();
    });
  }

  // SOLD_OUT: never silently drop the traveller — send them back to the
  // same hotel's room list, with the original search context preserved so
  // they don't have to re-search.
  returnToRoomSelection(): void {
    const booking = this.booking();
    if (!booking) return;
    const { hotelSlug, checkIn, checkOut, adults, children, rooms } = booking.selection;
    void this.router.navigate(['/hotels', hotelSlug], { queryParams: { checkIn, checkOut, adults, children, rooms } });
  }

  // Re-opens Traveller Details for this exact stay so the customer never
  // has to re-search or re-pick a room/rate — only re-enter traveller
  // details, which this mock intentionally doesn't pre-fill (see
  // TravellerDetailsPageComponent).
  editTravellers(): void {
    const booking = this.booking();
    if (!booking) return;
    const { hotelSlug, roomId, rateId, checkIn, checkOut, adults, children, rooms, agreedPrice } = booking.selection;
    void this.router.navigate(['/booking'], {
      queryParams: {
        hotelSlug,
        roomId,
        rateId,
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
        amount: agreedPrice.amount,
        currency: agreedPrice.currency,
      },
    });
  }

  private proceedToPayment(): void {
    const booking = this.booking();
    if (!booking) return;
    void this.router.navigate(['/payment'], { queryParams: { bookingId: booking.id } });
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
