import { Amenity, HotelImage } from './hotel-result.model';
import { HotelRoom } from './room.model';

export interface HotelLocation {
  readonly area: string;
  readonly destination: string;
  readonly distanceNote: string | null;
}

export interface HotelPolicies {
  readonly checkInFrom: string; // e.g. "14:00"
  readonly checkOutUntil: string; // e.g. "12:00"
  readonly childrenPolicy: string | null;
}

// The full, normalized hotel detail payload — supplier-agnostic, same
// spirit as HotelResult (hotel-result.model.ts) but with everything the
// detail page needs that the results card doesn't: description, full
// amenity list, location context, policies, and every room with its rate
// plans.
export interface HotelDetail {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly destination: string;
  readonly area: string;
  readonly starRating: number;
  readonly guestRating: number | null;
  readonly guestRatingLabel: string | null;
  readonly reviewCount: number;
  readonly description: string;
  readonly images: readonly HotelImage[];
  readonly amenities: readonly Amenity[];
  readonly location: HotelLocation;
  readonly policies: HotelPolicies;
  readonly rooms: readonly HotelRoom[];
}
