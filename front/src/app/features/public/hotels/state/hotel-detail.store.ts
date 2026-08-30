import { Injectable, PendingTasks, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HOTEL_DETAIL_PROVIDER } from '../data-access/hotel-detail.provider';
import { RATE_VERIFICATION_PROVIDER } from '../data-access/rate-verification.provider';
import { HotelDetail } from '../models/hotel-detail.model';
import { HotelRoom } from '../models/room.model';
import { RatePlan } from '../models/rate-plan.model';
import { RateVerificationResult } from '../models/rate-verification.model';
import { paramMapToParams, parseSearchQuery } from '../utils/hotel-search-url.util';

type VerificationPhase = 'idle' | 'verifying';

// Owns the full Hotel Detail + Room/Rate selection + rate-verification
// lifecycle. Slug and search context both come from the URL — the same
// typed boundary (hotel-search-url.util.ts) Hotel Results already uses, so
// dates/travellers survive the /hotels -> /hotels/:slug navigation without
// a second parser.
@Injectable()
export class HotelDetailStore {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly detailProvider = inject(HOTEL_DETAIL_PROVIDER);
  private readonly verificationProvider = inject(RATE_VERIFICATION_PROVIDER);
  // See hotel-results.store.ts for why this is needed: this is a zoneless
  // app, and the mock providers' simulated latency isn't otherwise tracked
  // as "pending" during SSR.
  private readonly pendingTasks = inject(PendingTasks);

  private readonly paramMap = toSignal(this.route.paramMap, { requireSync: true });
  private readonly queryParamMap = toSignal(this.route.queryParamMap, { requireSync: true });

  readonly slug = computed(() => this.paramMap().get('slug') ?? '');
  readonly searchContext = computed(() => parseSearchQuery(paramMapToParams(this.queryParamMap())));
  readonly nights = computed(() => {
    const { checkIn, checkOut } = this.searchContext();
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  });

  // undefined = not yet loaded, null = confirmed not found, HotelDetail = loaded.
  private readonly hotelSignal = signal<HotelDetail | null | undefined>(undefined);
  private readonly errorSignal = signal(false);
  private latestRequestId = 0;

  readonly hotel = computed(() => this.hotelSignal() ?? null);
  readonly loading = computed(() => this.hotelSignal() === undefined && !this.errorSignal());
  readonly notFound = computed(() => this.hotelSignal() === null && !this.errorSignal());
  readonly error = this.errorSignal.asReadonly();

  readonly hasAnyAvailability = computed(() => {
    const hotel = this.hotel();
    if (!hotel) return false;
    return hotel.rooms.some((room) => room.ratePlans.some((rate) => this.isRateBookable(rate)));
  });

  private readonly selectedRoomIdSignal = signal<string | null>(null);
  private readonly selectedRateIdSignal = signal<string | null>(null);
  private readonly soldOutRateIdsSignal = signal<ReadonlySet<string>>(new Set());
  // A rate discovered SOLD_OUT during verification (see verifyAndContinue)
  // must stop rendering as bookable everywhere it appears — exposed so the
  // room list can re-derive each rate's sold-out state itself rather than
  // the store and the UI silently disagreeing about it.
  readonly soldOutRateIds = this.soldOutRateIdsSignal.asReadonly();

  readonly selectedRoom = computed<HotelRoom | null>(() => {
    const hotel = this.hotel();
    const roomId = this.selectedRoomIdSignal();
    return hotel?.rooms.find((r) => r.id === roomId) ?? null;
  });

  readonly selectedRate = computed<RatePlan | null>(() => {
    const room = this.selectedRoom();
    const rateId = this.selectedRateIdSignal();
    return room?.ratePlans.find((r) => r.id === rateId) ?? null;
  });

  readonly hasSelection = computed(() => !!this.selectedRoom() && !!this.selectedRate());

  private readonly verificationPhaseSignal = signal<VerificationPhase>('idle');
  private readonly verificationResultSignal = signal<RateVerificationResult | null>(null);

  readonly verifying = computed(() => this.verificationPhaseSignal() === 'verifying');
  readonly verificationResult = this.verificationResultSignal.asReadonly();

  constructor() {
    effect(() => {
      const slug = this.slug();
      untracked(() => this.fetchHotel(slug));
    });
  }

  retry(): void {
    this.fetchHotel(this.slug());
  }

  isRateSoldOut(rate: RatePlan): boolean {
    return !this.isRateBookable(rate);
  }

  private isRateBookable(rate: RatePlan): boolean {
    return rate.available && !this.soldOutRateIdsSignal().has(rate.id);
  }

  selectRate(room: HotelRoom, rate: RatePlan): void {
    if (!this.isRateBookable(rate)) return;
    this.selectedRoomIdSignal.set(room.id);
    this.selectedRateIdSignal.set(rate.id);
    // A fresh selection invalidates any prior verification outcome.
    this.verificationResultSignal.set(null);
    this.verificationPhaseSignal.set('idle');
  }

  clearSelection(): void {
    this.selectedRoomIdSignal.set(null);
    this.selectedRateIdSignal.set(null);
    this.verificationResultSignal.set(null);
    this.verificationPhaseSignal.set('idle');
  }

  // Runs the rate recheck. AVAILABLE_SAME_PRICE proceeds straight to
  // booking; every other outcome stops here and waits for the traveller
  // (see acceptPriceChange / retryVerification / clearSelection).
  verifyAndContinue(): void {
    const rate = this.selectedRate();
    if (!rate || this.verifying()) return;

    this.verificationPhaseSignal.set('verifying');
    this.verificationResultSignal.set(null);

    this.verificationProvider.verify(rate.id).subscribe((result) => {
      this.verificationPhaseSignal.set('idle');
      this.verificationResultSignal.set(result);

      if (result.status === 'SOLD_OUT') {
        this.soldOutRateIdsSignal.set(new Set([...this.soldOutRateIdsSignal(), rate.id]));
      }
      if (result.status === 'AVAILABLE_SAME_PRICE') {
        this.proceedToBooking(rate.totalPrice);
      }
    });
  }

  retryVerification(): void {
    this.verificationResultSignal.set(null);
    this.verifyAndContinue();
  }

  acceptPriceChange(): void {
    const result = this.verificationResult();
    const rate = this.selectedRate();
    if (!rate || result?.status !== 'AVAILABLE_PRICE_CHANGED' || !result.latestPrice) return;
    this.proceedToBooking(result.latestPrice);
  }

  private proceedToBooking(agreedPrice: RatePlan['totalPrice']): void {
    const hotel = this.hotel();
    const room = this.selectedRoom();
    const rate = this.selectedRate();
    if (!hotel || !room || !rate) return;

    const { checkIn, checkOut, adults, children, rooms } = this.searchContext();
    void this.router.navigate(['/booking'], {
      queryParams: {
        hotelSlug: hotel.slug,
        roomId: room.id,
        rateId: rate.id,
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

  private fetchHotel(slug: string): void {
    const requestId = ++this.latestRequestId;
    this.errorSignal.set(false);
    const completeTask = this.pendingTasks.add();

    this.detailProvider.getBySlug(slug).subscribe({
      next: (hotel) => {
        if (requestId === this.latestRequestId) {
          this.hotelSignal.set(hotel);
        }
        completeTask();
      },
      error: () => {
        if (requestId === this.latestRequestId) {
          this.errorSignal.set(true);
        }
        completeTask();
      },
    });
  }
}
