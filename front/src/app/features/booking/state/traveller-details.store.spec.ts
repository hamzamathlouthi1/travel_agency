import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TravellerDetailsStore } from './traveller-details.store';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { BOOKING_PROVIDER } from '../data-access/booking.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { Booking } from '../domain/booking.model';
import { BookingRequest } from '../domain/booking-request.model';

const VALID_QUERY =
  'hotelSlug=test-hotel&roomId=room-1&rateId=rate-a&checkIn=2026-09-10&checkOut=2026-09-14&adults=2&children=0&rooms=1&amount=1000&currency=TND';

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

function fakeSubmitPayload(): Omit<BookingRequest, 'selection'> {
  return {
    leadTraveller: { type: 'ADULT', title: 'MR', firstName: 'Amir', lastName: 'Ben Salah', dateOfBirth: null },
    contact: { email: 'amir@example.com', phone: '+216 20 000 000' },
    additionalTravellers: [],
    specialRequests: null,
  };
}

@Component({ selector: 'app-test-host', template: '', providers: [TravellerDetailsStore] })
class TestHostComponent {
  readonly store = inject(TravellerDetailsStore);
}

describe('TravellerDetailsStore', () => {
  let detailSubjects: Subject<HotelDetail | null>[];
  let bookingSubjects: Subject<Booking>[];

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

  function fakeBookingProvider() {
    bookingSubjects = [];
    return {
      createBooking(_request: BookingRequest): Observable<Booking> {
        const subject = new Subject<Booking>();
        bookingSubjects.push(subject);
        return subject.asObservable();
      },
      getById(_id: string): Observable<Booking | null> {
        return of(null);
      },
    };
  }

  async function setup(url: string, detailProvider: unknown, bookingProvider: unknown) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'booking', component: TestHostComponent }]),
        { provide: HOTEL_DETAIL_PROVIDER, useValue: detailProvider },
        { provide: BOOKING_PROVIDER, useValue: bookingProvider },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;
    return { harness, store: host.store, router: TestBed.inject(Router) };
  }

  it('fetches the hotel for display once a valid selection is parsed from the URL', async () => {
    const { store } = await setup(`/booking?${VALID_QUERY}`, fakeDetailProvider(), fakeBookingProvider());

    expect(store.invalidSelection()).toBe(false);
    expect(store.loading()).toBe(true);

    detailSubjects[0].next(fakeHotel());

    expect(store.loading()).toBe(false);
    expect(store.hotel()?.name).toBe('Test Hotel');
    expect(store.selectedRoom()?.id).toBe('room-1');
    expect(store.selectedRate()?.id).toBe('rate-a');
  });

  it('reports invalidSelection and never fetches when required query params are missing', async () => {
    const { store } = await setup('/booking?hotelSlug=test-hotel', fakeDetailProvider(), fakeBookingProvider());

    expect(store.invalidSelection()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(detailSubjects.length).toBe(0);
  });

  it('reports staleSelection when the hotel loads but no longer has the selected room/rate', async () => {
    const { store } = await setup(
      '/booking?hotelSlug=test-hotel&roomId=missing-room&rateId=missing-rate&checkIn=2026-09-10&checkOut=2026-09-14&adults=2&children=0&rooms=1&amount=1000&currency=TND',
      fakeDetailProvider(),
      fakeBookingProvider(),
    );
    detailSubjects[0].next(fakeHotel());

    expect(store.staleSelection()).toBe(true);
    expect(store.invalidSelection()).toBe(false);
  });

  it('derives the correct additional-traveller slots from adults/children', async () => {
    const { store } = await setup(
      '/booking?hotelSlug=test-hotel&roomId=room-1&rateId=rate-a&checkIn=2026-09-10&checkOut=2026-09-14&adults=3&children=2&rooms=1&amount=1000&currency=TND',
      fakeDetailProvider(),
      fakeBookingProvider(),
    );
    // 3 adults + 2 children = 5 travellers total; the lead traveller is the
    // first adult, so 2 more ADULT slots and 2 CHILD slots remain.
    expect(store.additionalTravellerSlots()).toEqual(['ADULT', 'ADULT', 'CHILD', 'CHILD']);
  });

  it('submits, then navigates to /checkout with the new booking id only on success', async () => {
    const { store, router } = await setup(`/booking?${VALID_QUERY}`, fakeDetailProvider(), fakeBookingProvider());
    const navigateSpy = vi.spyOn(router, 'navigate');
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeSubmitPayload());
    expect(store.submitting()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();

    bookingSubjects[0].next({
      id: 'BKG-TEST-1',
      status: 'PENDING_PAYMENT',
      totalPrice: { amount: 1000, currency: 'TND' },
      createdAt: new Date().toISOString(),
      selection: store.selection()!,
      leadTraveller: fakeSubmitPayload().leadTraveller,
      contact: fakeSubmitPayload().contact,
      additionalTravellers: [],
      specialRequests: null,
      reference: 'MER-26-000001',
      paymentReference: null,
    });

    expect(store.submitting()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/checkout'], { queryParams: { bookingId: 'BKG-TEST-1' } });
  });

  it('sets submitError and does not navigate when booking creation fails', async () => {
    const { store, router } = await setup(`/booking?${VALID_QUERY}`, fakeDetailProvider(), fakeBookingProvider());
    const navigateSpy = vi.spyOn(router, 'navigate');
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeSubmitPayload());
    bookingSubjects[0].error(new Error('BOOKING_CREATE_ERROR'));

    expect(store.submitting()).toBe(false);
    expect(store.submitError()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('ignores a submit call while one is already in flight', async () => {
    const bookingProvider = fakeBookingProvider();
    const { store } = await setup(`/booking?${VALID_QUERY}`, fakeDetailProvider(), bookingProvider);
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeSubmitPayload());
    store.submit(fakeSubmitPayload());

    expect(bookingSubjects.length).toBe(1);
  });

  it('sets fetchError when the hotel fetch fails', async () => {
    const failingProvider = { getBySlug: () => throwError(() => new Error('boom')) };
    const { store } = await setup(`/booking?${VALID_QUERY}`, failingProvider, fakeBookingProvider());

    expect(store.fetchError()).toBe(true);
    expect(store.loading()).toBe(false);
  });
});
