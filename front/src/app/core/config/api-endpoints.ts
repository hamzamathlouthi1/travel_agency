// Centralized backend route map. The Angular app only ever talks to the
// Spring Boot API — never directly to MyGo, TunisiaBeds, or the payment
// gateway — so every endpoint below is a path on our own backend.
export const API_ENDPOINTS = {
  auth: {
    login: 'auth/login',
    logout: 'auth/logout',
    refresh: 'auth/refresh',
    me: 'auth/me',
  },
  hotels: {
    search: 'hotels/search',
    detail: (slug: string) => `hotels/${slug}`,
  },
  voyages: {
    search: 'voyages/search',
    detail: (slug: string) => `voyages/${slug}`,
  },
  circuits: {
    search: 'circuits/search',
    detail: (slug: string) => `circuits/${slug}`,
  },
  bookings: {
    base: 'bookings',
    detail: (id: string) => `bookings/${id}`,
  },
  checkout: {
    base: 'checkout',
  },
  payments: {
    base: 'payments',
  },
  b2b: {
    agencyProfile: 'b2b/agency/profile',
    creditLimit: 'b2b/agency/credit-limit',
    statements: 'b2b/agency/statements',
  },
} as const;
