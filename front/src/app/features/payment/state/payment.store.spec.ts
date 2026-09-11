import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PaymentStore } from './payment.store';
import { BOOKING_PROVIDER } from '../../booking/data-access/booking.provider';
import { HOTEL_DETAIL_PROVIDER } from '../../public/hotels/data-access/hotel-detail.provider';
import { PAYMENT_GATEWAY } from '../data-access/payment-gateway.provider';
import { HotelDetail } from '../../public/hotels/models/hotel-detail.model';
import { Booking } from '../../booking/domain/booking.model';
import { PaymentResult } from '../domain/payment-result.model';
import { CardDetails } from '../domain/card-details.model';

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

function fakeCard(): CardDetails {
  return { holderName: 'Amir Ben Salah', number: '4242 4242 4242 4242', expiry: '12/29', cvv: '123' };
}

@Component({ selector: 'app-test-host', template: '', providers: [PaymentStore] })
class TestHostComponent {
  readonly store = inject(PaymentStore);
}

describe('PaymentStore', () => {
  let bookingSubjects: Subject<Booking | null>[];
  let markPaidCalls: Array<{ id: string; reference: string }>;
  let detailSubjects: Subject<HotelDetail | null>[];
  let chargeSubjects: Subject<PaymentResult>[];
  let chargeRequests: Array<{ card: CardDetails }>;

  function fakeBookingProvider() {
    bookingSubjects = [];
    markPaidCalls = [];
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
      markPaid(id: string, reference: string): Observable<Booking> {
        markPaidCalls.push({ id, reference });
        return of(fakeBooking({ status: 'CONFIRMED', paymentReference: reference }));
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

  function fakeGateway() {
    chargeSubjects = [];
    chargeRequests = [];
    return {
      charge(request: { card: CardDetails }): Observable<PaymentResult> {
        chargeRequests.push(request);
        const subject = new Subject<PaymentResult>();
        chargeSubjects.push(subject);
        return subject.asObservable();
      },
    };
  }

  async function setup(url: string, bookingProvider: unknown, detailProvider: unknown, gateway: unknown) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'payment', component: TestHostComponent }]),
        { provide: BOOKING_PROVIDER, useValue: bookingProvider },
        { provide: HOTEL_DETAIL_PROVIDER, useValue: detailProvider },
        { provide: PAYMENT_GATEWAY, useValue: gateway },
      ],
    });
    const harness = await RouterTestingHarness.create(url);
    const host = harness.routeDebugElement!.componentInstance as TestHostComponent;
    const appRef = TestBed.inject(ApplicationRef);
    const flush = () => appRef.tick();
    return { harness, store: host.store, router: TestBed.inject(Router), flush };
  }

  it('reports invalidRequest when bookingId is missing', async () => {
    const { store } = await setup('/payment', fakeBookingProvider(), fakeDetailProvider(), fakeGateway());
    expect(store.invalidRequest()).toBe(true);
  });

  it('loads booking and hotel, then charges the card on submit and confirms the booking', async () => {
    const { store, router, flush } = await setup(
      '/payment?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeGateway(),
    );
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeCard());
    expect(store.processing()).toBe(true);

    chargeSubjects[0].next({ status: 'SUCCESS', gatewayReference: 'PAY-1', declineReason: null });
    expect(markPaidCalls).toEqual([{ id: 'BKG-1', reference: 'PAY-1' }]);
    expect(navigateSpy).toHaveBeenCalledWith(['/payment', 'confirmation'], { queryParams: { bookingId: 'BKG-1' } });
    expect(store.processing()).toBe(false);
  });

  it('prevents a second submit while one charge is already in flight', async () => {
    const { store, flush } = await setup('/payment?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider(), fakeGateway());
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeCard());
    store.submit(fakeCard());

    expect(chargeSubjects.length).toBe(1);
  });

  it('reports DECLINED distinctly from a technical error, without navigating or marking paid', async () => {
    const { store, router, flush } = await setup(
      '/payment?bookingId=BKG-1',
      fakeBookingProvider(),
      fakeDetailProvider(),
      fakeGateway(),
    );
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeCard());
    chargeSubjects[0].next({ status: 'DECLINED', gatewayReference: null, declineReason: 'Card declined' });

    expect(store.result()?.status).toBe('DECLINED');
    expect(store.processing()).toBe(false);
    expect(markPaidCalls.length).toBe(0);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('reports TECHNICAL_ERROR when the gateway itself errors, and allows retry via clearResult', async () => {
    const failingGateway = { charge: () => throwError(() => new Error('network down')) };
    const { store, flush } = await setup('/payment?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider(), failingGateway);
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeCard());
    expect(store.result()?.status).toBe('TECHNICAL_ERROR');
    expect(store.processing()).toBe(false);

    store.clearResult();
    expect(store.result()).toBeNull();
  });

  it('allows a fresh submit to proceed after a previous one resolved', async () => {
    const { store, flush } = await setup('/payment?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider(), fakeGateway());
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeCard());
    chargeSubjects[0].next({ status: 'DECLINED', gatewayReference: null, declineReason: null });
    expect(store.processing()).toBe(false);

    store.submit(fakeCard());
    expect(chargeSubjects.length).toBe(2);
  });

  it('never carries card details into the PaymentResult it exposes', async () => {
    const { store, flush } = await setup('/payment?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider(), fakeGateway());
    bookingSubjects[0].next(fakeBooking());
    flush();
    detailSubjects[0].next(fakeHotel());

    store.submit(fakeCard());
    chargeSubjects[0].next({ status: 'SUCCESS', gatewayReference: 'PAY-1', declineReason: null });

    expect(JSON.stringify(store.result())).not.toContain('4242');
    expect(JSON.stringify(store.booking())).not.toContain('4242');
  });

  it('redirects straight to confirmation for a booking that is already CONFIRMED', async () => {
    const { router, flush } = await setup('/payment?bookingId=BKG-1', fakeBookingProvider(), fakeDetailProvider(), fakeGateway());
    const navigateSpy = vi.spyOn(router, 'navigate');
    bookingSubjects[0].next(fakeBooking({ status: 'CONFIRMED', paymentReference: 'PAY-OLD' }));
    flush();

    expect(navigateSpy).toHaveBeenCalledWith(['/payment', 'confirmation'], { queryParams: { bookingId: 'BKG-1' } });
  });
});
