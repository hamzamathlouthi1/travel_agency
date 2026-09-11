import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HotelDetailStore } from './hotel-detail.store';
import { HOTEL_DETAIL_PROVIDER } from '../data-access/hotel-detail.provider';
import { RATE_VERIFICATION_PROVIDER } from '../data-access/rate-verification.provider';
import { HotelDetail } from '../models/hotel-detail.model';
import { RateVerificationResult } from '../models/rate-verification.model';

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
            cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-08' },
            totalPrice: { amount: 1000, currency: 'TND' },
            pricePerNight: { amount: 200, currency: 'TND' },
            taxes: { included: true },
            availability: null,
            available: true,
          },
          {
            id: 'rate-b',
            boardType: 'ROOM_ONLY',
            cancellationPolicy: { type: 'NON_REFUNDABLE' },
            totalPrice: { amount: 800, currency: 'TND' },
            pricePerNight: { amount: 160, currency: 'TND' },
            taxes: { included: true },
            availability: null,
            available: true,
          },
        ],
      },
    ],
  };
}

@Component({ selector: 'app-test-host', template: '', providers: [HotelDetailStore] })
class TestHostComponent {
  readonly store = inject(HotelDetailStore);
}

describe('HotelDetailStore', () => {
  let detailSubjects: Subject<HotelDetail | null>[];
  let verificationSubjects: Subject<RateVerificationResult>[];

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

  async function setup(url: string, detailProvider: unknown, verificationProvider: unknown) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'hotels/:slug', component: TestHostComponent }]),
        { provide: HOTEL_DETAIL_PROVIDER, useValue: detailProvider },
        { provide: RATE_VERIFICATION_PROVIDER, useValue: verificationProvider },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;
    return { harness, store: host.store, router: TestBed.inject(Router) };
  }

  it('is loading until the first response, then holds the hotel', async () => {
    const { store } = await setup('/hotels/test-hotel', fakeDetailProvider(), fakeVerificationProvider());

    expect(store.loading()).toBe(true);
    expect(store.hotel()).toBeNull();

    detailSubjects[0].next(fakeHotel());

    expect(store.loading()).toBe(false);
    expect(store.hotel()?.name).toBe('Test Hotel');
    expect(store.notFound()).toBe(false);
  });

  it('reports notFound when the provider resolves null', async () => {
    const { store } = await setup('/hotels/missing', fakeDetailProvider(), fakeVerificationProvider());
    detailSubjects[0].next(null);
    expect(store.notFound()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('sets error and clears loading when the provider fails', async () => {
    const failingProvider = { getBySlug: () => throwError(() => new Error('boom')) };
    const { store } = await setup('/hotels/test-hotel', failingProvider, fakeVerificationProvider());
    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('preserves checkIn/checkOut/adults/children/rooms from the URL (survives /hotels -> /hotels/:slug navigation)', async () => {
    const { store } = await setup(
      '/hotels/test-hotel?checkIn=2026-10-12&checkOut=2026-10-18&adults=2&children=1&rooms=1',
      fakeDetailProvider(),
      fakeVerificationProvider(),
    );
    const query = store.searchContext();
    expect(query.checkIn).toBe('2026-10-12');
    expect(query.checkOut).toBe('2026-10-18');
    expect(query.adults).toBe(2);
    expect(query.children).toBe(1);
    expect(query.rooms).toBe(1);
    expect(store.nights()).toBe(6);
  });

  it('selecting a rate exposes selectedRoom/selectedRate; selecting a different rate in the same room updates it', async () => {
    const { store } = await setup('/hotels/test-hotel', fakeDetailProvider(), fakeVerificationProvider());
    const hotel = fakeHotel();
    detailSubjects[0].next(hotel);

    const room = hotel.rooms[0];
    const [rateA, rateB] = room.ratePlans;

    store.selectRate(room, rateA);
    expect(store.hasSelection()).toBe(true);
    expect(store.selectedRate()?.id).toBe('rate-a');

    store.selectRate(room, rateB);
    expect(store.selectedRate()?.id).toBe('rate-b');
    expect(store.selectedRoom()?.id).toBe('room-1');
  });

  it('AVAILABLE_SAME_PRICE proceeds straight to booking', async () => {
    const { store, router } = await setup('/hotels/test-hotel', fakeDetailProvider(), fakeVerificationProvider());
    const navigateSpy = vi.spyOn(router, 'navigate');
    const hotel = fakeHotel();
    detailSubjects[0].next(hotel);
    store.selectRate(hotel.rooms[0], hotel.rooms[0].ratePlans[0]);

    store.verifyAndContinue();
    expect(store.verifying()).toBe(true);
    verificationSubjects[0].next({ status: 'AVAILABLE_SAME_PRICE' });

    expect(store.verifying()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/booking'], expect.objectContaining({ queryParams: expect.objectContaining({ rateId: 'rate-a' }) }));
  });

  it('AVAILABLE_PRICE_CHANGED blocks continuation until explicit acceptance', async () => {
    const { store, router } = await setup('/hotels/test-hotel', fakeDetailProvider(), fakeVerificationProvider());
    const navigateSpy = vi.spyOn(router, 'navigate');
    const hotel = fakeHotel();
    detailSubjects[0].next(hotel);
    store.selectRate(hotel.rooms[0], hotel.rooms[0].ratePlans[0]);

    store.verifyAndContinue();
    verificationSubjects[0].next({
      status: 'AVAILABLE_PRICE_CHANGED',
      previousPrice: { amount: 1000, currency: 'TND' },
      latestPrice: { amount: 1040, currency: 'TND' },
    });

    expect(store.verificationResult()?.status).toBe('AVAILABLE_PRICE_CHANGED');
    expect(navigateSpy).not.toHaveBeenCalled(); // blocked — no silent price change

    store.acceptPriceChange();
    expect(navigateSpy).toHaveBeenCalledWith(
      ['/booking'],
      expect.objectContaining({ queryParams: expect.objectContaining({ amount: 1040 }) }),
    );
  });

  it('SOLD_OUT blocks continuation and marks the rate sold out', async () => {
    const { store, router } = await setup('/hotels/test-hotel', fakeDetailProvider(), fakeVerificationProvider());
    const navigateSpy = vi.spyOn(router, 'navigate');
    const hotel = fakeHotel();
    detailSubjects[0].next(hotel);
    const rate = hotel.rooms[0].ratePlans[0];
    store.selectRate(hotel.rooms[0], rate);

    store.verifyAndContinue();
    verificationSubjects[0].next({ status: 'SOLD_OUT' });

    expect(store.verificationResult()?.status).toBe('SOLD_OUT');
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(store.isRateSoldOut(rate)).toBe(true);
  });

  it('TEMPORARY_ERROR allows retry', async () => {
    const { store } = await setup('/hotels/test-hotel', fakeDetailProvider(), fakeVerificationProvider());
    const hotel = fakeHotel();
    detailSubjects[0].next(hotel);
    store.selectRate(hotel.rooms[0], hotel.rooms[0].ratePlans[0]);

    store.verifyAndContinue();
    verificationSubjects[0].next({ status: 'TEMPORARY_ERROR' });
    expect(store.verificationResult()?.status).toBe('TEMPORARY_ERROR');

    store.retryVerification();
    expect(store.verifying()).toBe(true);
    verificationSubjects[1].next({ status: 'AVAILABLE_SAME_PRICE' });
    expect(store.verifying()).toBe(false);
  });
});
