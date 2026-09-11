import { Amenity, HotelImage } from './hotel-result.model';
import { RatePlan } from './rate-plan.model';

export interface Occupancy {
  readonly maxAdults: number;
  readonly maxChildren: number;
}

export interface BedConfiguration {
  readonly type: string; // e.g. "King bed", "Twin bed"
  readonly count: number;
}

// A room is never priced once — it always carries the full set of bookable
// rate plans beneath it (see rate-plan.model.ts). A room with zero
// AVAILABLE rate plans is still shown (its rates render sold-out), never
// silently hidden.
export interface HotelRoom {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly occupancy: Occupancy;
  readonly beds: readonly BedConfiguration[];
  readonly sizeSquareMeters: number | null;
  readonly view: string | null;
  readonly amenities: readonly Amenity[];
  readonly images: readonly HotelImage[];
  readonly ratePlans: readonly RatePlan[];
}
