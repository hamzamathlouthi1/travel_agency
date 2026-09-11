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
  { id: 'sidi-bou-said', city: 'Sidi Bou Saïd', tagline: 'Blue doors, sea views & jasmine', imageUrl: '/images/home/sidi-bou-said-street.jpg' },
  { id: 'monastir', city: 'Monastir', tagline: 'History beside the Mediterranean', imageUrl: '/images/home/monastir-coast.jpg' },
  { id: 'lagoon', city: 'Bizerte', tagline: 'Turquoise water & slow days', imageUrl: '/images/home/tunisia-lagoon.jpg' },
  { id: 'cappadocia', city: 'Cappadocia', tagline: 'A sky filled with balloons', imageUrl: '/images/home/cappadocia.png' },
];

export const FEATURED_HOTELS: readonly FeaturedHotel[] = [
  {
    id: 'meridian-bosphorus',
    slug: 'meridian-bosphorus-hotel',
    name: 'Meridian Bosphorus Hotel',
    city: 'Marrakech, Morocco',
    starRating: 5,
    reviewScore: 8.8,
    fromPricePerNight: { amount: 570, currency: 'TND' },
    imageUrl: '/images/hotels/meridian-bosphorus.png',
  },
  {
    id: 'galata-house',
    slug: 'galata-house-istanbul',
    name: 'Galata House Istanbul',
    city: 'Istanbul, Türkiye',
    starRating: 4,
    reviewScore: 8.1,
    fromPricePerNight: { amount: 310, currency: 'TND' },
    imageUrl: '/images/hotels/galata-house.png',
  },
  {
    id: 'sultanahmet-grand',
    slug: 'sultanahmet-grand',
    name: 'Sultanahmet Grand',
    city: 'Rome, Italy',
    starRating: 5,
    reviewScore: 9.2,
    fromPricePerNight: { amount: 990, currency: 'TND' },
    imageUrl: '/images/hotels/sultanahmet-grand.png',
  },
  {
    id: 'pera-residence',
    slug: 'pera-residence',
    name: 'Pera Residence',
    city: 'Beyoglu, Istanbul',
    starRating: 3,
    reviewScore: 7.6,
    fromPricePerNight: { amount: 195, currency: 'TND' },
    imageUrl: '/images/hotels/pera-residence.png',
  },
  {
    id: 'golden-horn-suites',
    slug: 'golden-horn-suites',
    name: 'Golden Horn Suites',
    city: 'Fatih, Istanbul',
    starRating: 4,
    reviewScore: 8.4,
    fromPricePerNight: { amount: 420, currency: 'TND' },
    imageUrl: '/images/hotels/golden-horn-suites.png',
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
    imageUrl: '/images/hotels/meridian-bosphorus.png',
  },
  {
    id: 'cappadocia-escape',
    slug: 'cappadocia-escape',
    name: 'Cappadocia Escape',
    departureCity: 'Tunis',
    durationDays: 6,
    fromPrice: { amount: 2180, currency: 'TND' },
    imageUrl: '/images/home/cappadocia.png',
  },
  {
    id: 'emirates-grand-tour',
    slug: 'emirates-grand-tour',
    name: 'Emirates Grand Tour',
    departureCity: 'Dubai & Abu Dhabi',
    durationDays: 10,
    fromPrice: { amount: 4960, currency: 'TND' },
    imageUrl: '/images/hotels/golden-horn-suites.png',
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
    imageUrl: '/images/home/cappadocia.png',
  },
  {
    id: 'grand-morocco',
    slug: 'grand-morocco',
    name: 'Grand Morocco',
    route: 'Casablanca → Fes → Marrakech',
    durationDays: 9,
    stops: 4,
    fromPrice: { amount: 3760, currency: 'TND' },
    imageUrl: '/images/home/marrakech-riad.png',
  },
  {
    id: 'classical-italy',
    slug: 'classical-italy',
    name: 'Classical Italy',
    route: 'Rome → Florence → Venice',
    durationDays: 14,
    stops: 6,
    fromPrice: { amount: 6240, currency: 'TND' },
    imageUrl: '/images/hotels/sultanahmet-grand.png',
  },
];

export const INSPIRATION_STORIES: readonly InspirationStory[] = [
  {
    id: 'medina-at-dawn',
    kicker: 'Guide',
    title: 'The medina at dawn: a walking route through old Marrakech',
    excerpt:
      "Before the souks open and the heat sets in, the old city belongs to bakers, cats, and the call to prayer.",
    imageUrl: '/images/home/marrakech-riad.png',
  },
  {
    id: 'istanbul-restaurants',
    kicker: 'Notebook',
    title: 'Six restaurants in Istanbul worth crossing the Bosphorus for',
    excerpt: null,
    imageUrl: '/images/hotels/galata-house.png',
  },
  {
    id: 'rome-guide-packs',
    kicker: 'Q&A',
    title: 'What a Rome-based guide packs for every circuit',
    excerpt: null,
    imageUrl: '/images/hotels/sultanahmet-grand.png',
  },
];
