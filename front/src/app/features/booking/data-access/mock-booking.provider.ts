import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { BookingProvider } from './booking.provider';
import { BookingRequest } from '../domain/booking-request.model';
import { Booking } from '../domain/booking.model';
import { Money } from '../../../shared/types/money.model';

const SIMULATED_LATENCY_MS = 900;

// A dev/test-only trigger for the BOOKING_CREATE_ERROR path — same
// convention as "demo-price-changed"/"demo-sold-out" in
// mock-rate-verification.provider.ts: deterministic, keyed off ordinary
// form input, never a switch exposed anywhere in customer-facing UI.
const DECLINED_CONTACT_EMAIL = 'demo-declined@meridian-test.dev';

@Injectable({ providedIn: 'root' })
export class MockBookingProvider implements BookingProvider {
  private sequence = 0;
  // In-memory only, for the lifetime of this browser session/SSR request —
  // a real backend persists this. Enough continuity for /checkout,
  // /payment and /payment/confirmation to all resolve the same draft by id.
  private readonly bookings = new Map<string, Booking>();

  createBooking(request: BookingRequest): Observable<Booking> {
    if (request.contact.email.trim().toLowerCase() === DECLINED_CONTACT_EMAIL) {
      return throwError(() => new Error('BOOKING_CREATE_ERROR')).pipe(delay(SIMULATED_LATENCY_MS));
    }

    this.sequence += 1;
    const createdAt = new Date();
    const booking: Booking = {
      id: `BKG-${createdAt.getTime().toString(36).toUpperCase()}-${this.sequence}`,
      status: 'PENDING_PAYMENT',
      totalPrice: request.selection.agreedPrice,
      createdAt: createdAt.toISOString(),
      selection: request.selection,
      leadTraveller: request.leadTraveller,
      contact: request.contact,
      additionalTravellers: request.additionalTravellers,
      specialRequests: request.specialRequests,
      reference: `MER-${createdAt.getFullYear() % 100}-${String(this.sequence).padStart(6, '0')}`,
      paymentReference: null,
    };
    this.bookings.set(booking.id, booking);

    return of(booking).pipe(delay(SIMULATED_LATENCY_MS));
  }

  getById(id: string): Observable<Booking | null> {
    return of(this.bookings.get(id) ?? null).pipe(delay(SIMULATED_LATENCY_MS));
  }

  confirmPrice(id: string, agreedPrice: Money): Observable<Booking> {
    const existing = this.bookings.get(id);
    if (!existing) {
      return throwError(() => new Error(`No booking found for id "${id}"`)).pipe(delay(SIMULATED_LATENCY_MS));
    }

    const updated: Booking = {
      ...existing,
      totalPrice: agreedPrice,
      selection: { ...existing.selection, agreedPrice },
    };
    this.bookings.set(id, updated);

    return of(updated).pipe(delay(SIMULATED_LATENCY_MS));
  }

  markPaid(id: string, paymentReference: string): Observable<Booking> {
    const existing = this.bookings.get(id);
    if (!existing) {
      return throwError(() => new Error(`No booking found for id "${id}"`)).pipe(delay(SIMULATED_LATENCY_MS));
    }

    const updated: Booking = { ...existing, status: 'CONFIRMED', paymentReference };
    this.bookings.set(id, updated);

    return of(updated).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
