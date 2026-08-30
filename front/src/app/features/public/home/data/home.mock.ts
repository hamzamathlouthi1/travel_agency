import {
  FeaturedCircuit,
  FeaturedDestination,
  FeaturedHotel,
  FeaturedVoyage,
  InspirationStory,
} from '../models/featured-items';

// Temporary in-memory homepage content. Replaced by Spring Boot-backed
// endpoints once they exist — components consume these through
// HomeContentService, so swapping the source later won't touch templates.
export const FEATURED_DESTINATIONS: readonly FeaturedDestination[] = [
  { id: 'istanbul', city: 'Istanbul', tagline: 'Where two continents meet' },
  { id: 'dubai', city: 'Dubai', tagline: 'Desert skyline, modern luxury' },
  { id: 'marrakech', city: 'Marrakech', tagline: 'Medinas, spice, and light' },
  { id: 'paris', city: 'Paris', tagline: 'Classic, timeless, endlessly walkable' },
  { id: 'antalya', city: 'Antalya', tagline: 'Turquoise coast, all-inclusive ease' },
  { id: 'rome', city: 'Rome', tagline: 'Three thousand years, one city' },
];

export const FEATURED_HOTELS: readonly FeaturedHotel[] = [
  {
    id: 'riad-kniza',
    slug: 'riad-kniza-marrakech',
    name: 'Riad Kniza & Spa',
    city: 'Marrakech, Morocco',
    starRating: 4,
    reviewScore: 4.6,
    fromPricePerNight: { amount: 310, currency: 'TND' },
  },
  {
    id: 'hotel-nomad',
    slug: 'hotel-nomad-istanbul',
    name: 'Hotel Nomad',
    city: 'Istanbul, Türkiye',
    starRating: 4,
    reviewScore: 4.4,
    fromPricePerNight: { amount: 214, currency: 'TND' },
  },
  {
    id: 'villa-sabina',
    slug: 'villa-sabina-rome',
    name: 'Villa Sabina',
    city: 'Rome, Italy',
    starRating: 5,
    reviewScore: 4.8,
    fromPricePerNight: { amount: 388, currency: 'TND' },
  },
];

export const FEATURED_VOYAGES: readonly FeaturedVoyage[] = [
  {
    id: 'andalusia-coast',
    slug: 'andalusia-and-the-coast',
    name: 'Andalusia & the Coast',
    departureCity: 'Madrid',
    durationDays: 8,
    fromPrice: { amount: 3420, currency: 'TND' },
  },
  {
    id: 'cappadocia-escape',
    slug: 'cappadocia-escape',
    name: 'Cappadocia Escape',
    departureCity: 'Tunis',
    durationDays: 6,
    fromPrice: { amount: 2180, currency: 'TND' },
  },
  {
    id: 'emirates-grand-tour',
    slug: 'emirates-grand-tour',
    name: 'Emirates Grand Tour',
    departureCity: 'Dubai & Abu Dhabi',
    durationDays: 10,
    fromPrice: { amount: 4960, currency: 'TND' },
  },
];

export const FEATURED_CIRCUITS: readonly FeaturedCircuit[] = [
  {
    id: 'silk-road-highlights',
    slug: 'silk-road-highlights',
    name: 'Silk Road Highlights',
    route: 'Samarkand → Bukhara → Khiva',
    durationDays: 12,
    stops: 5,
    fromPrice: { amount: 5180, currency: 'TND' },
  },
  {
    id: 'grand-morocco',
    slug: 'grand-morocco',
    name: 'Grand Morocco',
    route: 'Casablanca → Fes → Marrakech',
    durationDays: 9,
    stops: 4,
    fromPrice: { amount: 3760, currency: 'TND' },
  },
  {
    id: 'classical-italy',
    slug: 'classical-italy',
    name: 'Classical Italy',
    route: 'Rome → Florence → Venice',
    durationDays: 14,
    stops: 6,
    fromPrice: { amount: 6240, currency: 'TND' },
  },
];

export const INSPIRATION_STORIES: readonly InspirationStory[] = [
  {
    id: 'medina-at-dawn',
    kicker: 'Guide',
    title: 'The medina at dawn: a walking route through old Marrakech',
    excerpt:
      "Before the souks open and the heat sets in, the old city belongs to bakers, cats, and the call to prayer.",
  },
  {
    id: 'istanbul-restaurants',
    kicker: 'Notebook',
    title: 'Six restaurants in Istanbul worth crossing the Bosphorus for',
    excerpt: null,
  },
  {
    id: 'rome-guide-packs',
    kicker: 'Q&A',
    title: 'What a Rome-based guide packs for every circuit',
    excerpt: null,
  },
];
