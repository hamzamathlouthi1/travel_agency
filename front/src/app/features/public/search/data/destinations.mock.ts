import { Destination } from '../models/destination';

// Temporary in-memory catalog. Replaced by a Spring Boot-backed
// DestinationProvider once the endpoint exists — see destination-provider.ts.
export const MOCK_DESTINATIONS: readonly Destination[] = [
  { id: 'istanbul-tr', city: 'Istanbul', country: 'Türkiye' },
  { id: 'dubai-ae', city: 'Dubai', country: 'UAE' },
  { id: 'marrakech-ma', city: 'Marrakech', country: 'Morocco' },
  { id: 'antalya-tr', city: 'Antalya', country: 'Türkiye' },
  { id: 'rome-it', city: 'Rome', country: 'Italy' },
  { id: 'paris-fr', city: 'Paris', country: 'France' },
  { id: 'cairo-eg', city: 'Cairo', country: 'Egypt' },
  { id: 'barcelona-es', city: 'Barcelona', country: 'Spain' },
];

export const MOCK_POPULAR_DESTINATION_IDS: readonly string[] = [
  'istanbul-tr',
  'dubai-ae',
  'marrakech-ma',
  'rome-it',
];

export const MOCK_RECENT_DESTINATION_IDS: readonly string[] = ['marrakech-ma', 'rome-it'];
