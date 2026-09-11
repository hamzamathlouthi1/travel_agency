import { Params } from '@angular/router';
import { BookingSelection } from '../domain/booking-selection.model';

function toPositiveInt(value: string | undefined, min: number): number | null {
  const parsed = value === undefined ? NaN : Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= min ? parsed : null;
}

function toPositiveAmount(value: string | undefined): number | null {
  const parsed = value === undefined ? NaN : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function isIsoDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// The traveller details step trusts nothing from the URL beyond "well
// formed" — a missing, mistyped, or hand-edited param fails closed to the
// invalid-selection state (see TravellerDetailsStore.invalidSelection),
// never to a booking created against guessed defaults. Mirrors the
// hotel-search-url.util.ts convention: this is the one place that knows
// how /booking query params map to a typed selection.
export function parseBookingSelection(params: Params): BookingSelection | null {
  const hotelSlug = (params['hotelSlug'] as string | undefined)?.trim();
  const roomId = (params['roomId'] as string | undefined)?.trim();
  const rateId = (params['rateId'] as string | undefined)?.trim();
  const checkIn = params['checkIn'] as string | undefined;
  const checkOut = params['checkOut'] as string | undefined;
  const currency = (params['currency'] as string | undefined)?.trim();
  const adults = toPositiveInt(params['adults'], 1);
  const children = toPositiveInt(params['children'], 0);
  const rooms = toPositiveInt(params['rooms'], 1);
  const amount = toPositiveAmount(params['amount']);

  if (
    !hotelSlug ||
    !roomId ||
    !rateId ||
    !isIsoDate(checkIn) ||
    !isIsoDate(checkOut) ||
    !currency ||
    adults === null ||
    children === null ||
    rooms === null ||
    amount === null
  ) {
    return null;
  }

  return {
    hotelSlug,
    roomId,
    rateId,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    agreedPrice: { amount, currency },
  };
}
