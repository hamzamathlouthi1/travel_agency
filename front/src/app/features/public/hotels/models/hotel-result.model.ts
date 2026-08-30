import { Money } from '../../../../shared/types/money.model';

// Normalized, supplier-agnostic hotel result. Whatever answers a search —
// local catalogue, or a future external inventory partner behind the Spring
// Boot API — must arrive already shaped like this. No supplier-specific
// field ever reaches this model or anything downstream of it.

export interface HotelImage {
  readonly id: string;
  readonly alt: string;
}

export type AmenityId =
  | 'wifi'
  | 'pool'
  | 'parking'
  | 'spa'
  | 'airport-shuttle'
  | 'air-conditioning'
  | 'family-rooms'
  | 'breakfast';

export interface Amenity {
  readonly id: AmenityId;
  readonly label: string;
}

export type BoardType = 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';

export const BOARD_TYPE_LABEL: Record<BoardType, string> = {
  ROOM_ONLY: 'Room only',
  BREAKFAST: 'Breakfast included',
  HALF_BOARD: 'Half board',
  FULL_BOARD: 'Full board',
  ALL_INCLUSIVE: 'All inclusive',
};

export type CancellationType = 'FREE_CANCELLATION' | 'PARTIALLY_REFUNDABLE' | 'NON_REFUNDABLE';

export interface CancellationPolicy {
  readonly type: CancellationType;
  /** ISO date. Only meaningful when type is FREE_CANCELLATION. */
  readonly freeUntil?: string;
}

export interface TaxesInfo {
  readonly included: boolean;
}

export type AvailabilitySignal =
  | { readonly kind: 'LOW_AVAILABILITY'; readonly roomsLeft: number }
  | { readonly kind: 'POPULAR' }
  | null;

export interface HotelOffer {
  readonly id: string;
  readonly roomName: string;
  readonly boardType: BoardType;
  readonly occupancy: { readonly adults: number; readonly children: number };
  readonly cancellationPolicy: CancellationPolicy;
  readonly totalPrice: Money;
  readonly pricePerNight: Money;
  readonly taxes: TaxesInfo;
}

export type HotelBadge = 'SPONSORED' | 'FEATURED';

export interface HotelResult {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly destination: string;
  readonly area: string;
  readonly distanceNote: string | null;
  readonly starRating: number;
  readonly guestRating: number | null;
  readonly guestRatingLabel: string | null;
  readonly reviewCount: number;
  readonly images: readonly HotelImage[];
  readonly amenities: readonly Amenity[];
  readonly bestOffer: HotelOffer;
  readonly availability: AvailabilitySignal;
  readonly badges: readonly HotelBadge[];
}
