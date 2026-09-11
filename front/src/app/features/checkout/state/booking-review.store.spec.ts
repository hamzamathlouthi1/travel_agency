import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { BookingReviewStore } from './booking-review.store';
import { BOOKING_PROVIDER } from '../../booking/data-access/booking.provider';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { RATE_VERIFICATION_PROVIDER } from '../../public/hotels/data-access/rate-verification.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { Booking } from '../../booking/domain/booking.model';
import { RateVerificationResult } from '../../public/hotels/models/rate-verification.model';

function fakeHotel(): HotelDetail {
  return {
    id: 'h1',
    slug: 'test-hotel',
    name: 'Test Hotel',
    destination: 'Istanbul',
    area: 'Beyoğlu',
    starRating: 4,
    guestRating: 8.5,
    guestRatingLabel: 'Excellent',
    reviewCount: 100,
    description: 'A test hotel.',
    images: [],
    amenities: [],
    location: { area: 'Beyoğlu', destination: 'Istanbul', distanceNote: null },
    policies: { checkInFrom: '14:00', checkOutUntil: '12:00', childrenPolicy: null },
    rooms: [
      {
        id: 'room-1',
        name: 'Test Room',
        description: null,
        occupancy: { maxAdults: 2, maxChildren: 0 },
        beds: [],
        sizeSquareMeters: null,
        view: null,
        amenities: [],
        images: [],
        ratePlans: [
          {
            id: 'rate-a',
            boardType: 'BREAKFAST',
            cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-09-08' },
            totalPrice: { amount: 1000, currency: 'TND' },
            pricePerNight: { amount: 250, currency: 'TND' },
            taxes: { included: true },
            availability: null,
            available: true,
          },
        ],
      },
    ],
  };
}

function fakeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'BKG-1',
    status: 'PENDING_PAYMENT',
    totalPrice: { amount: 1000, currency: 'TND' },
    createdAt: new Date().toISOString(),
    selection: {
      hotelSlug: 'test-hotel',
      roomId: 'room-1',
      rateId: 'rate-a',
      checkIn: '2026-09-10',
      checkOut: '2026-09-14',
      adults: 2,
      children: 0,
      rooms: 1,
      agreedPrice: { amount: 1000, currency: 'TND' },
    },
    leadTraveller: { type: 'ADULT', title: 'MR', firstName: 'Amir', lastName: 'Ben Salah', dateOfBirth: null },
    contact: { email: 'amir@example.com', phone: '+216 20 000 000' },
    additionalTravellers: [],
    specialRequests: null,
    reference: 'MER-26-000001',
    paymentReference: null,
    ...overrides,
  };
}

@Component({ selector: 'app-test-host', template: '', providers: [BookingReviewStore] })
class TestHostComponent {
  readonly store = inject(BookingReviewStore);
}

describe('BookingReviewStore', () => {
  let bookingSubjects: Subject<Booking | null>[];
  let detailSubjects: Subject<HotelDetail | null>[];
  let verificationSubjects: Subject<RateVerificationResult>[];
  let confirmPriceCalls: Array<{ id: string; price: unknown }>;

  function fakeBookingProvider() {
    bookingSubjects = [];
    confirmPriceCalls = [];
    return {
      createBooking: () => {
        throw new Error('not used in these tests');
      },
      getById(_id: string): Observable<Booking | null> {
        const subject = new Subject<Booking | null>();
        bookingSubjects.push(subject);
        return subject.asObservable();
      },
      confirmPrice(id: string, price: unknown): Observable<Booking> {
        confirmPriceCalls.push({ id, price });
        return of(fakeBooking({ totalPrice: price as Booking['totalPrice'] }));
      },
    };
  }

  function fakeDetailProvider() {
    detailSubjects = [];
    return {
      getBySlug(_slug: string): Observable<HotelDetail | null> {
        const subject = new Subject<HotelDetail | null>();
        detailSubjects.push(subject);
        return subject.asObservable();
      },
    };
  }

  function fakeVerificationProvider() {
    verificationSubjects = [];
    return {
      verify(_rateId: string): Observable<RateVerificationResult> {
        const subject = new Subject<RateVerificationResult>();
        verificationSubjects.push(subject);
        return subject.asObservable();
      },
    };
  }

  async function setup(url: string, bookingProvider: unknown, detailProvider: unknown, verificationProvider: unknown) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'checkout', component: TestHostComponent }]),
        { provide: BOOKING_PROVIDER, useValue: bookingProvider },
        { provide: HOTEL_DETAIL_PROVIDER, useValue: detailProvider },
        { provide: RATE_VERIFICATION_PROVIDER, useValue: verificationProvider },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;
    const appRef = TestBed.inject(ApplicationRef);
    // The booking->hotel fetch is a second, chained effect (see
    // hotel-results.store.spec.ts for why this needs an explicit tick
    // rather than fixture.whenStable()).
    const flush = () => appRef.tick();
    return { harness, store: host.store, router: TestBed.inject(Router), flush };
  }

  it('reports invalidRequest and fetches nothing when bookingId is missing', async () => {
    const { store, flush } = await setup('/checkout', fakeBookingProvider(), fakeDetailProvider(), fakeVerificationProvider());
    expect(store.invalidRequest()).toBe(true);
    expect(bookingSubjects.length).toBe(0);
  });

  it('loads the booking then the hotel, exposing room/rate once both resolve', async () => {
    const { store, flush } = await setup(
      '/checkout?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    expect(store.loading()).toBe(true);

    bookingSubjects[0].next(fakeBooking());
    flush();
    expect(store.loading()).toBe(true); // still waiting on the hotel fetch

    detailSubjects[0].next(fakeHotel());
    expect(store.loading()).toBe(false);
    expect(store.room()?.id).toBe('room-1');
    expect(store.rate()?.id).toBe('rate-a');
  });

  it('reports bookingNotFound when the provider resolves null', async () => {
    const { store, flush } = await setup(
      '/checkout?bookingId=missing',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    bookingSubjects[0].next(null);
    flush();
    expect(store.bookingNotFound()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('reports staleBooking when the hotel no longer has the booked room/rate', async () => {
    const { store, flush } = await setup(
      '/checkout?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    bookingSubjects[0].next(fakeBooking({ selection: { ...fakeBooking().selection, roomId: 'gone' } }));
    flush();
    detailSubjects[0].next(fakeHotel());
    expect(store.staleBooking()).toBe(true);
  });

  it('sets error when the booking fetch fails', async () => {
    const failingProvider = { ...fakeBookingProvider(), getById: () => throwError(() => new Error('boom')) };
    const { store, flush } = await setup('/checkout?bookingId=BKG-1', failingProvider, fakeDetailProvider(), fakeVerificationProvider());
    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('AVAILABLE_SAME_PRICE marks ready and navigates straight to payment', async () => {
    const { store, router, flush } = await setup(
      '/checkout?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.verifyAndContinue();
    expect(store.verifying()).toBe(true);
    verificationSubjects[0].next({ status: 'AVAILABLE_SAME_PRICE' });

    expect(store.readyForPayment()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/payment'], { queryParams: { bookingId: 'BKG-1' } });
  });

  it('AVAILABLE_PRICE_CHANGED blocks navigation until accepted, then confirms the new price', async () => {
    const { store, router, flush } = await setup(
      '/checkout?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.verifyAndContinue();
    verificationSubjects[0].next({
      status: 'AVAILABLE_PRICE_CHANGED',
      previousPrice: { amount: 1000, currency: 'TND' },
      latestPrice: { amount: 1050, currency: 'TND' },
    });

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(store.readyForPayment()).toBe(false);

    store.acceptPriceChange();
    expect(confirmPriceCalls).toEqual([{ id: 'BKG-1', price: { amount: 1050, currency: 'TND' } }]);
    expect(store.readyForPayment()).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith(['/payment'], { queryParams: { bookingId: 'BKG-1' } });
  });

  it('SOLD_OUT blocks navigation and returnToRoomSelection navigates to the hotel with search context preserved', async () => {
    const { store, router, flush } = await setup(
      '/checkout?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.verifyAndContinue();
    verificationSubjects[0].next({ status: 'SOLD_OUT' });
    expect(navigateSpy).not.toHaveBeenCalled();

    store.returnToRoomSelection();
    expect(navigateSpy).toHaveBeenCalledWith(['/hotels', 'test-hotel'], {
      queryParams: { checkIn: '2026-09-10', checkOut: '2026-09-14', adults: 2, children: 0, rooms: 1 },
    });
  });

  it('TEMPORARY_ERROR allows retry', async () => {
    const { store, flush } = await setup(
      '/checkout?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.verifyAndContinue();
    verificationSubjects[0].next({ status: 'TEMPORARY_ERROR' });
    expect(store.verificationResult()?.status).toBe('TEMPORARY_ERROR');

    store.retryVerification();
    expect(store.verifying()).toBe(true);
    verificationSubjects[1].next({ status: 'AVAILABLE_SAME_PRICE' });
    expect(store.verifying()).toBe(false);
  });
});
