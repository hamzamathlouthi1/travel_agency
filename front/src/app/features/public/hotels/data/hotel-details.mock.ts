import { Amenity } from '../models/hotel-result.model';
import { HotelDetail } from '../models/hotel-detail.model';
import { HotelRoom } from '../models/room.model';
import { RatePlan } from '../models/rate-plan.model';
import { HOTEL_FIXTURES } from './hotels.mock';

// Temporary in-memory hotel-detail inventory. Replaced by a Spring
// Boot-backed HotelDetailProvider once the endpoint exists — see
// hotel-detail.provider.ts. Rate IDs prefixed `demo-` are wired to specific
// MockRateVerificationProvider outcomes so every verification state is
// reachable through ordinary navigation, not a debug control.

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

function money(amount: number, currency = 'TND') {
  return { amount, currency };
}

// ---- Meridian Bosphorus Hotel — the hand-authored reference hotel, matching the approved design exactly ----

const MERIDIAN_ROOMS: readonly HotelRoom[] = [
  {
    id: 'deluxe-bosphorus',
    name: 'Deluxe Bosphorus Room',
    description: 'A calm, light-filled room with a partial Bosphorus view, five minutes from Taksim Square.',
    occupancy: { maxAdults: 2, maxChildren: 1 },
    beds: [{ type: 'King bed', count: 1 }],
    sizeSquareMeters: 28,
    view: 'Bosphorus view',
    amenities: [AMENITIES['wifi'], AMENITIES['ac']],
    images: [{ id: 'deluxe-1', src: '/images/hotels/meridian-bosphorus.png', alt: 'Deluxe Bosphorus Room with king bed and Bosphorus view' }],
    ratePlans: [
      {
        id: 'deluxe-breakfast-flex',
        boardType: 'BREAKFAST',
        cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-08' },
        paymentTiming: 'PAY_LATER',
        totalPrice: money(3420),
        pricePerNight: money(570),
        taxes: { included: true },
        availability: { kind: 'LOW_AVAILABILITY', roomsLeft: 2 },
        available: true,
      },
      {
        id: 'demo-price-changed',
        boardType: 'BREAKFAST',
        cancellationPolicy: { type: 'NON_REFUNDABLE' },
        paymentTiming: 'PAY_NOW',
        totalPrice: money(3050),
        pricePerNight: money(508),
        taxes: { included: true },
        availability: null,
        available: true,
      },
    ] satisfies readonly RatePlan[],
  },
  {
    id: 'standard-twin',
    name: 'Standard Room, Two Twin Beds',
    description: 'A quiet city-facing room, ideal for two travellers who prefer separate beds.',
    occupancy: { maxAdults: 2, maxChildren: 0 },
    beds: [{ type: 'Twin bed', count: 2 }],
    sizeSquareMeters: 22,
    view: 'City view',
    amenities: [AMENITIES['wifi']],
    images: [{ id: 'standard-1', src: '/images/hotels/meridian-bosphorus.png', alt: 'Standard Room with two twin beds and city view' }],
    ratePlans: [
      {
        id: 'standard-room-only',
        boardType: 'ROOM_ONLY',
        cancellationPolicy: { type: 'FREE_CANCELLATION', freeUntil: '2026-10-10' },
        paymentTiming: 'PAY_LATER',
        totalPrice: money(1860),
        pricePerNight: money(310),
        taxes: { included: true },
        availability: null,
        available: true,
      },
    ] satisfies readonly RatePlan[],
  },
  {
    id: 'classic-city',
    name: 'Classic City Room',
    description: 'A compact, efficient room facing the inner courtyard — Meridian’s best value.',
    occupancy: { maxAdults: 2, maxChildren: 0 },
    beds: [{ type: 'Double bed', count: 1 }],
    sizeSquareMeters: 18,
    view: 'Courtyard view',
    amenities: [AMENITIES['wifi'], AMENITIES['ac']],
    images: [{ id: 'classic-1', src: '/images/hotels/meridian-bosphorus.png', alt: 'Classic City Room with double bed' }],
    ratePlans: [
      {
        id: 'demo-sold-out',
        boardType: 'ROOM_ONLY',
        cancellationPolicy: { type: 'NON_REFUNDABLE' },
        totalPrice: money(1420),
        pricePerNight: money(237),
        taxes: { included: false },
        availability: null,
        available: false,
      },
    ] satisfies readonly RatePlan[],
  },
  {
    id: 'family-suite',
    name: 'Family Suite',
    description: 'A two-room suite with a separate lounge area, sized for families travelling together.',
    occupancy: { maxAdults: 2, maxChildren: 2 },
    beds: [
      { type: 'King bed', count: 1 },
      { type: 'Sofa bed', count: 1 },
    ],
    sizeSquareMeters: 42,
    view: 'Bosphorus view',
    amenities: [AMENITIES['wifi'], AMENITIES['family'], AMENITIES['ac']],
    images: [{ id: 'suite-1', src: '/images/hotels/meridian-bosphorus.png', alt: 'Family Suite with separate lounge area' }],
    ratePlans: [
      {
        id: 'suite-halfboard',
        boardType: 'HALF_BOARD',
        cancellationPolicy: { type: 'PARTIALLY_REFUNDABLE' },
        paymentTiming: 'PAY_LATER',
        totalPrice: money(5280),
        pricePerNight: money(880),
        taxes: { included: true },
        availability: { kind: 'POPULAR' },
        available: true,
      },
    ] satisfies readonly RatePlan[],
  },
];

const MERIDIAN_DETAIL: HotelDetail = {
  id: 'meridian-bosphorus',
  slug: 'meridian-bosphorus-hotel',
  name: 'Meridian Bosphorus Hotel',
  destination: 'Istanbul',
  area: 'Beyoğlu',
  starRating: 5,
  guestRating: 8.8,
  guestRatingLabel: 'Excellent',
  reviewCount: 1284,
  description:
    'A restored 19th-century residence steps from Taksim Square, pairing Bosphorus views with quiet, contemporary interiors. Five minutes on foot from the Istiklal Avenue tram.',
  images: [
    { id: 'meridian-1', src: '/images/hotels/meridian-bosphorus.png', alt: 'Meridian Bosphorus Hotel exterior at dusk' },
    { id: 'meridian-2', src: '/images/hotels/hotel-lobby-v2.png', alt: 'Lobby lounge with Bosphorus-facing windows' },
    { id: 'meridian-3', src: '/images/hotels/hotel-rooftop-v2.png', alt: 'Rooftop terrace overlooking the Bosphorus' },
    { id: 'meridian-4', src: '/images/hotels/hotel-room-v2.png', alt: 'Deluxe Bosphorus Room interior' },
    { id: 'meridian-5', src: '/images/hotels/pera-residence.png', alt: 'Quiet hotel lounge and relaxation area' },
  ],
  amenities: [
    AMENITIES['wifi'],
    AMENITIES['pool'],
    AMENITIES['shuttle'],
    AMENITIES['ac'],
    AMENITIES['spa'],
    AMENITIES['breakfast'],
    AMENITIES['family'],
    AMENITIES['parking'],
  ],
  location: {
    area: 'Beyoğlu',
    destination: 'Istanbul',
    distanceNote: '350 m from Taksim Square · 1.2 km from Istiklal Avenue',
  },
  policies: {
    checkInFrom: '14:00',
    checkOutUntil: '12:00',
    childrenPolicy: 'Children of all ages are welcome. Cribs available on request.',
  },
  rooms: MERIDIAN_ROOMS,
};

// ---- Remaining hotels — generated from the results fixtures so every result card leads to a working detail page ----

function generatedDetail(fixtureId: string): HotelDetail | null {
  const fixture = HOTEL_FIXTURES.find((f) => f.id === fixtureId);
  if (!fixture) return null;

  const primaryRate: RatePlan = {
    id: `${fixture.id}-primary`,
    boardType: fixture.boardType,
    cancellationPolicy: fixture.cancellationPolicy,
    paymentTiming: 'PAY_LATER',
    totalPrice: money(fixture.nightlyRate.amount * 6, fixture.nightlyRate.currency),
    pricePerNight: fixture.nightlyRate,
    taxes: { included: fixture.taxesIncluded },
    availability: fixture.availability,
    available: true,
  };

  const alternateRate: RatePlan = {
    id: `${fixture.id}-alternate`,
    boardType: 'ROOM_ONLY',
    cancellationPolicy: { type: 'NON_REFUNDABLE' },
    paymentTiming: 'PAY_NOW',
    totalPrice: money(Math.round(fixture.nightlyRate.amount * 6 * 0.88), fixture.nightlyRate.currency),
    pricePerNight: money(Math.round(fixture.nightlyRate.amount * 0.88), fixture.nightlyRate.currency),
    taxes: { included: fixture.taxesIncluded },
    availability: null,
    available: true,
  };

  const room: HotelRoom = {
    id: `${fixture.id}-room`,
    name: fixture.roomName,
    description: `A comfortable room at ${fixture.name}, ${fixture.area}.`,
    occupancy: { maxAdults: 2, maxChildren: 1 },
    beds: [{ type: 'Double bed', count: 1 }],
    sizeSquareMeters: 24,
    view: null,
    amenities: fixture.amenities,
    images: [{ id: `${fixture.id}-room-1`, src: '/images/hotels/hotel-room-v2.png', alt: `${fixture.roomName} at ${fixture.name}` }],
    ratePlans: [primaryRate, alternateRate],
  };

  return {
    id: fixture.id,
    slug: fixture.slug,
    name: fixture.name,
    destination: fixture.destination,
    area: fixture.area,
    starRating: fixture.starRating,
    guestRating: fixture.guestRating,
    guestRatingLabel:
      fixture.guestRating === null
        ? null
        : fixture.guestRating >= 9
          ? 'Exceptional'
          : fixture.guestRating >= 8
            ? 'Excellent'
            : fixture.guestRating >= 7
              ? 'Very good'
              : 'Good',
    reviewCount: fixture.reviewCount,
    description: `A well-regarded stay in ${fixture.area}, ${fixture.destination}, ${fixture.distanceNote ?? 'close to the city’s main sights'}.`,
    images: [
      { id: `${fixture.id}-hero`, src: fixture.imageUrl ?? '/images/hotels/meridian-bosphorus.png', alt: `${fixture.name} exterior` },
      { id: `${fixture.id}-lobby`, src: '/images/hotels/hotel-lobby-v2.png', alt: `Lobby at ${fixture.name}` },
      { id: `${fixture.id}-room`, src: '/images/hotels/hotel-room-v2.png', alt: `${fixture.roomName} at ${fixture.name}` },
      { id: `${fixture.id}-roof`, src: '/images/hotels/hotel-rooftop-v2.png', alt: `Rooftop terrace at ${fixture.name}` },
      { id: `${fixture.id}-detail`, src: fixture.imageUrl ?? '/images/hotels/galata-house.png', alt: `Architecture and atmosphere at ${fixture.name}` },
    ],
    amenities: fixture.amenities,
    location: {
      area: fixture.area,
      destination: fixture.destination,
      distanceNote: fixture.distanceNote,
    },
    policies: {
      checkInFrom: '14:00',
      checkOutUntil: '12:00',
      childrenPolicy: null,
    },
    rooms: [room],
  };
}

export const HOTEL_DETAILS_MOCK: readonly HotelDetail[] = [
  MERIDIAN_DETAIL,
  ...HOTEL_FIXTURES.filter((f) => f.id !== 'meridian-bosphorus')
    .map((f) => generatedDetail(f.id))
    .filter((d): d is HotelDetail => d !== null),
];
