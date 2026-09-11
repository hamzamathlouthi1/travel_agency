import { Money } from '../../../shared/types/money.model';

// What HotelDetailStore.proceedToBooking() hands off to the traveller
// details step, reconstructed from URL query params (see
// data-access/booking-selection-url.util.ts) — never carried via router
// state, so a reload or a shared link lands on the same step correctly.
// agreedPrice is the price already confirmed during rate verification;
// the traveller details step trusts it rather than re-deriving a total.
export interface BookingSelection {
  readonly hotelSlug: string;
  readonly roomId: string;
  readonly rateId: string;
  readonly checkIn: string;
  readonly checkOut: string;
  readonly adults: number;
  readonly children: number;
  readonly rooms: number;
  readonly agreedPrice: Money;
}
