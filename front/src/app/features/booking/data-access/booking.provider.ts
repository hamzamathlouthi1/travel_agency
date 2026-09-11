import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Money } from '../../../shared/types/money.model';
import { Booking } from '../domain/booking.model';
import { BookingRequest } from '../domain/booking-request.model';

// Creates and reads back the reservation. createBooking's price is the one
// already agreed during hotel-detail rate verification; getById resolves to
// `null` for an id that genuinely doesn't exist (distinct from a thrown
// error), same convention as HotelDetailProvider.getBySlug. confirmPrice
// exists solely for Booking Review's final rate recheck — the ONLY path
// allowed to change an existing booking's price, and only after the
// traveller has explicitly accepted the new amount (see
// BookingReviewStore.acceptPriceChange). Swap the `useClass` in
// app.config.ts for a Spring Boot-backed implementation later
// (POST/GET/PATCH API_ENDPOINTS.bookings.base) — no component needs to change.
export interface BookingProvider {
  createBooking(request: BookingRequest): Observable<Booking>;
  getById(id: string): Observable<Booking | null>;
  confirmPrice(id: string, agreedPrice: Money): Observable<Booking>;
  // The ONLY path that marks a booking CONFIRMED — called exactly once, by
  // PaymentStore, after PAYMENT_GATEWAY returns SUCCESS. A real backend
  // makes this call itself once it has independently verified the payment
  // with the gateway; Angular never gets to decide "paid" on its own.
  markPaid(id: string, paymentReference: string): Observable<Booking>;
}

export const BOOKING_PROVIDER = new InjectionToken<BookingProvider>('BOOKING_PROVIDER');
