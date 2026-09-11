import { convertToParamMap } from '@angular/router';
import { paramMapToParams } from '../../public/hotels/utils/hotel-search-url.util';
import { parseBookingSelection } from './booking-selection-url.util';

function params(overrides: Record<string, string> = {}) {
  return paramMapToParams(
    convertToParamMap({
      hotelSlug: 'meridian-bosphorus-hotel',
      roomId: 'deluxe-bosphorus',
      rateId: 'deluxe-breakfast-flex',
      checkIn: '2026-09-10',
      checkOut: '2026-09-14',
      adults: '2',
      children: '1',
      rooms: '1',
      amount: '1200',
      currency: 'TND',
      ...overrides,
    }),
  );
}

describe('parseBookingSelection', () => {
  it('parses a fully valid selection', () => {
    expect(parseBookingSelection(params())).toEqual({
      hotelSlug: 'meridian-bosphorus-hotel',
      roomId: 'deluxe-bosphorus',
      rateId: 'deluxe-breakfast-flex',
      checkIn: '2026-09-10',
      checkOut: '2026-09-14',
      adults: 2,
      children: 1,
      rooms: 1,
      agreedPrice: { amount: 1200, currency: 'TND' },
    });
  });

  it('preserves hotel/room/rate identity exactly, without trimming meaningful characters', () => {
    const selection = parseBookingSelection(
      params({ hotelSlug: 'hotel-a', roomId: 'room-b', rateId: 'rate-c' }),
    )!;
    expect(selection.hotelSlug).toBe('hotel-a');
    expect(selection.roomId).toBe('room-b');
    expect(selection.rateId).toBe('rate-c');
  });

  it('preserves adults/children/rooms counts distinctly', () => {
    const selection = parseBookingSelection(params({ adults: '3', children: '2', rooms: '2' }))!;
    expect(selection.adults).toBe(3);
    expect(selection.children).toBe(2);
    expect(selection.rooms).toBe(2);
  });

  it('allows children to be zero', () => {
    const selection = parseBookingSelection(params({ children: '0' }))!;
    expect(selection.children).toBe(0);
  });

  it.each(['hotelSlug', 'roomId', 'rateId', 'checkIn', 'checkOut', 'currency', 'adults', 'rooms', 'amount'])(
    'returns null when %s is missing',
    (key) => {
      const map = convertToParamMap(
        Object.fromEntries(
          Object.entries({
            hotelSlug: 'meridian-bosphorus-hotel',
            roomId: 'deluxe-bosphorus',
            rateId: 'deluxe-breakfast-flex',
            checkIn: '2026-09-10',
            checkOut: '2026-09-14',
            adults: '2',
            children: '1',
            rooms: '1',
            amount: '1200',
            currency: 'TND',
          }).filter(([k]) => k !== key),
        ),
      );
      expect(parseBookingSelection(paramMapToParams(map))).toBeNull();
    },
  );

  it('returns null for a malformed date', () => {
    expect(parseBookingSelection(params({ checkIn: 'not-a-date' }))).toBeNull();
  });

  it('returns null for a non-numeric amount', () => {
    expect(parseBookingSelection(params({ amount: 'free' }))).toBeNull();
  });

  it('returns null for a zero or negative amount', () => {
    expect(parseBookingSelection(params({ amount: '0' }))).toBeNull();
    expect(parseBookingSelection(params({ amount: '-50' }))).toBeNull();
  });

  it('returns null for adults below 1', () => {
    expect(parseBookingSelection(params({ adults: '0' }))).toBeNull();
  });

  it('returns null for a non-numeric adults/children/rooms value', () => {
    expect(parseBookingSelection(params({ adults: 'two' }))).toBeNull();
  });
});
