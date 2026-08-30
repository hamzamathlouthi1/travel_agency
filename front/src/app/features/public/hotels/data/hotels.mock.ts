import { Amenity, AvailabilitySignal, BoardType, CancellationPolicy, HotelBadge } from '../models/hotel-result.model';

// Temporary in-memory hotel inventory. Replaced by a Spring Boot-backed
// HotelSearchProvider once the endpoint exists — see hotel-search.provider.ts.
// bestOffer pricing is computed per-request (it depends on nights and party
// size), so a fixture stores a nightly rate rather than a fixed total.
export interface HotelFixture {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly destination: string;
  readonly area: string;
  readonly distanceNote: string | null;
  readonly starRating: number;
  readonly guestRating: number | null;
  readonly reviewCount: number;
  readonly amenities: readonly Amenity[];
  readonly roomName: string;
  readonly boardType: BoardType;
  readonly cancellationPolicy: CancellationPolicy;
  readonly nightlyRate: { readonly amount: number; readonly currency: string };
  readonly taxesIncluded: boolean;
  readonly availability: AvailabilitySignal;
  readonly badges: readonly HotelBadge[];
}

const AMENITIES: Record<string, Amenity> = {
  wifi: { id: 'wifi', label: 'Free Wi-Fi' },
  pool: { id: 'pool', label: 'Pool' },
  parking: { id: 'parking', label: 'Parking' },
  spa: { id: 'spa', label: 'Spa' },
  shuttle: { id: 'airport-shuttle', label: 'Airport shuttle' },
  ac: { id: 'air-conditioning', label: 'Air conditioning' },
  family: { id: 'family-rooms', label: 'Family rooms' },
  breakfast: { id: 'breakfast', label: 'Breakfast available' },
};

export const HOTEL_FIXTURES: readonly HotelFixture[] = [
  {
    id: 'meridian-bosphorus',
    slug: 'meridian-bosphorus-hotel',
    name: 'Meridian Bosphorus Hotel',
    destination: 'Istanbul',
    area: 'Beyoğlu',
    distanceNote: '350 m from Taksim Square',
    starRating: 5,
    guestRating: 8.8,
    reviewCount: 1284,
    amenities: [AMENITIES['wifi'], AMENITIES['pool'], AMENITIES['shuttle']],
    roomName: 'Deluxe Bosphorus Room',
    boardType: 'BREAKFAST',
    cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-08' },
    nightlyRate: { amount: 570, currency: 'TND' },
    taxesIncluded: true,
    availability: { kind: 'LOW_AVAILABILITY', roomsLeft: 2 },
    badges: [],
  },
  {
    id: 'galata-house',
    slug: 'galata-house-istanbul',
    name: 'Galata House Istanbul',
    destination: 'Istanbul',
    area: 'Beyoğlu',
    distanceNote: '900 m from Galata Tower',
    starRating: 4,
    guestRating: 8.1,
    reviewCount: 642,
    amenities: [AMENITIES['wifi'], AMENITIES['ac']],
    roomName: 'Standard Room',
    boardType: 'ROOM_ONLY',
    cancellationPolicy: { type: 'NON_REFUNDABLE' },
    nightlyRate: { amount: 310, currency: 'TND' },
    taxesIncluded: true,
    availability: null,
    badges: [],
  },
  {
    id: 'sultanahmet-grand',
    slug: 'sultanahmet-grand',
    name: 'Sultanahmet Grand',
    destination: 'Istanbul',
    area: 'Sultanahmet',
    distanceNote: '200 m from Hagia Sophia',
    starRating: 5,
    guestRating: 9.2,
    reviewCount: 2010,
    amenities: [AMENITIES['spa'], AMENITIES['wifi'], AMENITIES['family']],
    roomName: 'Ottoman Suite',
    boardType: 'HALF_BOARD',
    cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-05' },
    nightlyRate: { amount: 990, currency: 'TND' },
    taxesIncluded: true,
    availability: null,
    badges: ['SPONSORED'],
  },
  {
    id: 'pera-residence',
    slug: 'pera-residence',
    name: 'Pera Residence',
    destination: 'Istanbul',
    area: 'Beyoğlu',
    distanceNote: '600 m from Istiklal Avenue',
    starRating: 3,
    guestRating: 7.6,
    reviewCount: 318,
    amenities: [AMENITIES['wifi'], AMENITIES['parking']],
    roomName: 'Classic Room',
    boardType: 'ROOM_ONLY',
    cancellationPolicy: { type: 'PARTIALLY_REFUNDABLE' },
    nightlyRate: { amount: 195, currency: 'TND' },
    taxesIncluded: false,
    availability: null,
    badges: [],
  },
  {
    id: 'golden-horn-suites',
    slug: 'golden-horn-suites',
    name: 'Golden Horn Suites',
    destination: 'Istanbul',
    area: 'Fatih',
    distanceNote: '1.1 km from Süleymaniye Mosque',
    starRating: 4,
    guestRating: 8.4,
    reviewCount: 894,
    amenities: [AMENITIES['wifi'], AMENITIES['breakfast'], AMENITIES['family']],
    roomName: 'Family Suite',
    boardType: 'BREAKFAST',
    cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-10' },
    nightlyRate: { amount: 420, currency: 'TND' },
    taxesIncluded: true,
    availability: { kind: 'POPULAR' },
    badges: [],
  },
  {
    id: 'taksim-heritage',
    slug: 'taksim-heritage-hotel',
    name: 'Taksim Heritage Hotel',
    destination: 'Istanbul',
    area: 'Taksim',
    distanceNote: '150 m from Taksim Square',
    starRating: 4,
    guestRating: 8.6,
    reviewCount: 1052,
    amenities: [AMENITIES['wifi'], AMENITIES['pool'], AMENITIES['spa']],
    roomName: 'Executive Room',
    boardType: 'BREAKFAST',
    cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-09' },
    nightlyRate: { amount: 480, currency: 'TND' },
    taxesIncluded: true,
    availability: null,
    badges: [],
  },
  {
    id: 'bosphorus-garden',
    slug: 'bosphorus-garden',
    name: 'Bosphorus Garden',
    destination: 'Istanbul',
    area: 'Kadıköy',
    distanceNote: '400 m from Moda seafront',
    starRating: 3,
    guestRating: 7.9,
    reviewCount: 501,
    amenities: [AMENITIES['wifi'], AMENITIES['ac']],
    roomName: 'Garden View Room',
    boardType: 'ALL_INCLUSIVE',
    cancellationPolicy: { type: 'NON_REFUNDABLE' },
    nightlyRate: { amount: 265, currency: 'TND' },
    taxesIncluded: true,
    availability: { kind: 'LOW_AVAILABILITY', roomsLeft: 1 },
    badges: [],
  },
  {
    id: 'karakoy-urban-stay',
    slug: 'karakoy-urban-stay',
    name: 'Karaköy Urban Stay',
    destination: 'Istanbul',
    area: 'Karaköy',
    distanceNote: '300 m from Karaköy ferry terminal',
    starRating: 2,
    guestRating: 7.2,
    reviewCount: 214,
    amenities: [AMENITIES['wifi']],
    roomName: 'Compact Room',
    boardType: 'ROOM_ONLY',
    cancellationPolicy: { type: 'PARTIALLY_REFUNDABLE' },
    nightlyRate: { amount: 150, currency: 'TND' },
    taxesIncluded: false,
    availability: null,
    badges: [],
  },
];
