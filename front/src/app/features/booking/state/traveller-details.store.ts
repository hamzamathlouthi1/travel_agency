import { Injectable, PendingTasks, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { paramMapToParams } from '../../public/hotels/utils/hotel-search-url.util';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { HotelRoom } from '../../public/hotels/models/room.model';
import { RatePlan } from '../../public/hotels/models/rate-plan.model';
import { BOOKING_PROVIDER } from '../data-access/booking.provider';
import { parseBookingSelection } from '../data-access/booking-selection-url.util';
import { BookingRequest } from '../domain/booking-request.model';
import { TravellerType } from '../domain/traveller.model';

// Owns the traveller-details step lifecycle. The room/rate/price selection
// arrives only via URL query params (see hotel-detail.store.ts
// proceedToBooking()) — never router state — so this store re-derives it
// the same way HotelDetailStore derives its own URL-driven state, then
// re-fetches the hotel purely for display (name, room, rate) before
// submitting the booking. Tri-state signal shape (undefined = loading,
// null = confirmed absent, T = loaded) mirrors HotelDetailStore throughout.
@Injectable()
export class TravellerDetailsStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly detailProvider = inject(HOTEL_DETAIL_PROVIDER);
  private readonly bookingProvider = inject(BOOKING_PROVIDER);
  private readonly pendingTasks = inject(PendingTasks);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly selection = computed(() => parseBookingSelection(paramMapToParams(this.queryParamMap())));
  // A missing/malformed/hand-edited query param — fails closed before any
  // fetch is attempted.
  readonly invalidSelection = computed(() => this.selection() === null);

  // Every occupant slot beyond the lead traveller (who is always the first
  // ADULT), in the order the form should render them.
  readonly additionalTravellerSlots = computed<readonly TravellerType[]>(() => {
    const selection = this.selection();
    if (!selection) return [];
    const adults: TravellerType[] = Array(Math.max(0, selection.adults - 1)).fill('ADULT');
    const children: TravellerType[] = Array(selection.children).fill('CHILD');
    return [...adults, ...children];
  });

  private readonly hotelSignal = signal<HotelDetail | null | undefined>(undefined);
  private readonly fetchErrorSignal = signal(false);
  private latestRequestId = 0;

  readonly hotel = computed(() => this.hotelSignal() ?? null);
  readonly loading = computed(
    () => !this.invalidSelection() && this.hotelSignal() === undefined && !this.fetchErrorSignal(),
  );
  readonly fetchError = this.fetchErrorSignal.asReadonly();

  readonly selectedRoom = computed<HotelRoom | null>(() => {
    const hotel = this.hotel();
    const selection = this.selection();
    return hotel && selection ? (hotel.rooms.find((r) => r.id === selection.roomId) ?? null) : null;
  });

  readonly selectedRate = computed<RatePlan | null>(() => {
    const room = this.selectedRoom();
    const selection = this.selection();
    return room && selection ? (room.ratePlans.find((r) => r.id === selection.rateId) ?? null) : null;
  });

  // Hotel loaded fine, but the room/rate id from the URL no longer exists
  // on it — a stale or tampered link, distinct from invalidSelection (which
  // never gets far enough to fetch anything).
  readonly staleSelection = computed(
    () => !this.loading() && !this.fetchError() && !!this.hotel() && !this.selectedRate(),
  );

  private readonly submittingSignal = signal(false);
  private readonly submitErrorSignal = signal(false);
  readonly submitting = this.submittingSignal.asReadonly();
  readonly submitError = this.submitErrorSignal.asReadonly();

  constructor() {
    effect(() => {
      const selection = this.selection();
      untracked(() => {
        if (selection) this.fetchHotel(selection.hotelSlug);
      });
    });
  }

  retry(): void {
    const selection = this.selection();
    if (selection) this.fetchHotel(selection.hotelSlug);
  }

  submit(payload: Omit<BookingRequest, 'selection'>): void {
    const selection = this.selection();
    if (!selection || this.submittingSignal()) return;

    this.submittingSignal.set(true);
    this.submitErrorSignal.set(false);
    const completeTask = this.pendingTasks.add();

    this.bookingProvider.createBooking({ ...payload, selection }).subscribe({
      next: (booking) => {
        this.submittingSignal.set(false);
        completeTask();
        void this.router.navigate(['/checkout'], { queryParams: { bookingId: booking.id } });
      },
      error: () => {
        this.submittingSignal.set(false);
        this.submitErrorSignal.set(true);
        completeTask();
      },
    });
  }

  private fetchHotel(slug: string): void {
    const requestId = ++this.latestRequestId;
    this.fetchErrorSignal.set(false);
    const completeTask = this.pendingTasks.add();

    this.detailProvider.getBySlug(slug).subscribe({
      next: (hotel) => {
        if (requestId === this.latestRequestId) this.hotelSignal.set(hotel);
        completeTask();
      },
      error: () => {
        if (requestId === this.latestRequestId) this.fetchErrorSignal.set(true);
        completeTask();
      },
    });
  }
}
