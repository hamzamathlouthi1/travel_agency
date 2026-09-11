import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmationStore } from './confirmation.store';
import { BOOKING_PROVIDER } from '../../booking/data-access/booking.provider';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { Booking } from '../../booking/domain/booking.model';

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
    status: 'CONFIRMED',
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
    paymentReference: 'PAY-1',
    ...overrides,
  };
}

@Component({ selector: 'app-test-host', template: '', providers: [ConfirmationStore] })
class TestHostComponent {
  readonly store = inject(ConfirmationStore);
}

describe('ConfirmationStore', () => {
  let bookingSubjects: Subject<Booking | null>[];
  let detailSubjects: Subject<HotelDetail | null>[];

  function fakeBookingProvider() {
    bookingSubjects = [];
    return {
      createBooking: () => {
        throw new Error('not used');
      },
      getById(_id: string): Observable<Booking | null> {
        const subject = new Subject<Booking | null>();
        bookingSubjects.push(subject);
        return subject.asObservable();
      },
      confirmPrice: () => {
        throw new Error('not used');
      },
      markPaid: () => {
        throw new Error('not used');
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

  async function setup(url: string, bookingProvider: unknown, detailProvider: unknown) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'confirmation', component: TestHostComponent }]),
        { provide: BOOKING_PROVIDER, useValue: bookingProvider },
        { provide: HOTEL_DETAIL_PROVIDER, useValue: detailProvider },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;
    const appRef = TestBed.inject(ApplicationRef);
    const flush = () => appRef.tick();
    return { harness, store: host.store, router: TestBed.inject(Router), flush };
  }

  it('loads a confirmed booking and its hotel', async () => {
    const { store, flush } = await setup('/confirmation?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider());
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    expect(store.loading()).toBe(false);
    expect(store.booking()?.reference).toBe('MER-26-000001');
    expect(store.room()?.id).toBe('room-1');
  });

  it('reports bookingNotFound for a missing booking', async () => {
    const { store } = await setup('/confirmation?bookingId=missing', fakeBookingProvider(), fakeDetailProvider());
    bookingSubjects[0].next(null);
    expect(store.bookingNotFound()).toBe(true);
  });

  it('redirects to /payment rather than showing an unpaid booking as confirmed', async () => {
    const { router, flush } = await setup('/confirmation?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider());
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking({ status: 'PENDING_PAYMENT', paymentReference: null }));
    flush();

    expect(navigateSpy).toHaveBeenCalledWith(['/payment'], { queryParams: { bookingId: 'BKG-1' } });
  });

  it('the booking reference is stable across repeated reads (no re-derivation)', async () => {
    const { store, flush } = await setup('/confirmation?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider());
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    const first = store.booking()?.reference;
    const second = store.booking()?.reference;
    expect(first).toBe('MER-26-000001');
    expect(first).toBe(second);
  });

  it('sets error when the booking fetch fails', async () => {
    const failingProvider = { ...fakeBookingProvider(), getById: () => throwError(() => new Error('boom')) };
    const { store } = await setup('/confirmation?bookingId=BKG-1', failingProvider, fakeDetailProvider());
    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);
  });
});
