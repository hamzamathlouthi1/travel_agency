import { Injectable, PendingTasks, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BOOKING_PROVIDER } from '../../booking/data-access/booking.provider';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { HotelRoom } from '../../public/hotels/models/room.model';
import { RatePlan } from '../../public/hotels/models/rate-plan.model';
import { Booking } from '../../booking/domain/booking.model';

// Read-only: loads the confirmed booking (by id) and its hotel for display.
// A booking that exists but isn't yet CONFIRMED is never shown here — it's
// sent back to /payment instead, so a reload or a bookmarked link can never
// present an unpaid booking as confirmed.
@Injectable()
export class ConfirmationStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingProvider = inject(BOOKING_PROVIDER);
  private readonly detailProvider = inject(HOTEL_DETAIL_PROVIDER);
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
    // Never present an unpaid booking as confirmed.
    effect(() => {
      const booking = this.booking();
      untracked(() => {
        if (booking && booking.status !== 'CONFIRMED') {
          void this.router.navigate(['/payment'], { queryParams: { bookingId: booking.id } });
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
