import { firstValueFrom } from 'rxjs';
import { MockBookingProvider } from './mock-booking.provider';
import { BookingRequest } from '../domain/booking-request.model';

function fakeRequest(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    selection: {
      hotelSlug: 'meridian-bosphorus-hotel',
      roomId: 'deluxe-bosphorus',
      rateId: 'deluxe-breakfast-flex',
      checkIn: '2026-09-10',
      checkOut: '2026-09-14',
      adults: 2,
      children: 0,
      rooms: 1,
      agreedPrice: { amount: 1200, currency: 'TND' },
    },
    leadTraveller: { type: 'ADULT', title: 'MR', firstName: 'Amir', lastName: 'Ben Salah', dateOfBirth: null },
    contact: { email: 'amir@example.com', phone: '+216 20 000 000' },
    additionalTravellers: [],
    specialRequests: null,
    ...overrides,
  };
}

describe('MockBookingProvider', () => {
  let provider: MockBookingProvider;

  beforeEach(() => {
    provider = new MockBookingProvider();
  });

  it('creates a booking draft with the agreed price and a PENDING_PAYMENT status', async () => {
    const booking = await firstValueFrom(provider.createBooking(fakeRequest()));
    expect(booking.status).toBe('PENDING_PAYMENT');
    expect(booking.totalPrice).toEqual({ amount: 1200, currency: 'TND' });
    expect(booking.id).toBeTruthy();
    expect(booking.reference).toBeTruthy();
    expect(booking.paymentReference).toBeNull();
  });

  it('assigns each booking a unique, human-readable reference', async () => {
    const first = await firstValueFrom(provider.createBooking(fakeRequest()));
    const second = await firstValueFrom(provider.createBooking(fakeRequest()));
    expect(first.reference).not.toBe(second.reference);
    expect(first.reference).toMatch(/^MER-\d{2}-\d{6}$/);
  });

  it('assigns a unique id to each created booking', async () => {
    const first = await firstValueFrom(provider.createBooking(fakeRequest()));
    const second = await firstValueFrom(provider.createBooking(fakeRequest()));
    expect(first.id).not.toBe(second.id);
  });

  it('persists the created draft so it can be retrieved by id afterwards', async () => {
    const created = await firstValueFrom(
      provider.createBooking(
        fakeRequest({ leadTraveller: { type: 'ADULT', title: 'MS', firstName: 'Lina', lastName: 'Trabelsi', dateOfBirth: null } }),
      ),
    );

    const fetched = await firstValueFrom(provider.getById(created.id));
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(created.id);
    expect(fetched!.leadTraveller.firstName).toBe('Lina');
  });

  it('resolves null for an id that was never created', async () => {
    const fetched = await firstValueFrom(provider.getById('does-not-exist'));
    expect(fetched).toBeNull();
  });

  it('deterministically fails creation for the scripted decline email, every time', async () => {
    const request = fakeRequest({ contact: { email: 'demo-declined@meridian-test.dev', phone: '+216 20 000 000' } });
    await expect(firstValueFrom(provider.createBooking(request))).rejects.toThrow();
    await expect(firstValueFrom(provider.createBooking(request))).rejects.toThrow();
  });

  it('is case/whitespace-insensitive when matching the scripted decline email', async () => {
    const request = fakeRequest({ contact: { email: '  Demo-Declined@Meridian-Test.DEV  ', phone: '+216 20 000 000' } });
    await expect(firstValueFrom(provider.createBooking(request))).rejects.toThrow();
  });

  it('leaves provider state usable after a failed creation — a later successful booking is still retrievable', async () => {
    const declined = fakeRequest({ contact: { email: 'demo-declined@meridian-test.dev', phone: '+216 20 000 000' } });
    await expect(firstValueFrom(provider.createBooking(declined))).rejects.toThrow();

    const booking = await firstValueFrom(provider.createBooking(fakeRequest()));
    const fetched = await firstValueFrom(provider.getById(booking.id));
    expect(fetched?.id).toBe(booking.id);
  });

  it('confirmPrice updates the total and the selection agreedPrice, leaving everything else intact', async () => {
    const created = await firstValueFrom(provider.createBooking(fakeRequest()));
    const updated = await firstValueFrom(provider.confirmPrice(created.id, { amount: 1300, currency: 'TND' }));

    expect(updated.totalPrice).toEqual({ amount: 1300, currency: 'TND' });
    expect(updated.selection.agreedPrice).toEqual({ amount: 1300, currency: 'TND' });
    expect(updated.id).toBe(created.id);
    expect(updated.leadTraveller).toEqual(created.leadTraveller);
  });

  it('confirmPrice fails for an id that does not exist', async () => {
    await expect(firstValueFrom(provider.confirmPrice('does-not-exist', { amount: 1, currency: 'TND' }))).rejects.toThrow();
  });

  it('markPaid sets the booking to CONFIRMED with the payment reference attached', async () => {
    const created = await firstValueFrom(provider.createBooking(fakeRequest()));
    const paid = await firstValueFrom(provider.markPaid(created.id, 'PAY-123'));

    expect(paid.status).toBe('CONFIRMED');
    expect(paid.paymentReference).toBe('PAY-123');

    const fetched = await firstValueFrom(provider.getById(created.id));
    expect(fetched?.status).toBe('CONFIRMED');
  });

  it('markPaid fails for an id that does not exist', async () => {
    await expect(firstValueFrom(provider.markPaid('does-not-exist', 'PAY-1'))).rejects.toThrow();
  });
});
