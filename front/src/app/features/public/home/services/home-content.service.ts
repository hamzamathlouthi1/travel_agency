import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  FEATURED_CIRCUITS,
  FEATURED_DESTINATIONS,
  FEATURED_HOTELS,
  FEATURED_VOYAGES,
  INSPIRATION_STORIES,
} from '../data/home.mock';
import {
  FeaturedCircuit,
  FeaturedDestination,
  FeaturedHotel,
  FeaturedVoyage,
  InspirationStory,
} from '../models/featured-items';

// Presentation components depend on this service, never on the mock data
// module directly — replacing the method bodies with HttpClient calls to
// the Spring Boot API later won't require touching any component.
@Injectable({ providedIn: 'root' })
export class HomeContentService {
  featuredDestinations(): Observable<readonly FeaturedDestination[]> {
    return of(FEATURED_DESTINATIONS);
  }

  featuredHotels(): Observable<readonly FeaturedHotel[]> {
    return of(FEATURED_HOTELS);
  }

  featuredVoyages(): Observable<readonly FeaturedVoyage[]> {
    return of(FEATURED_VOYAGES);
  }

  featuredCircuits(): Observable<readonly FeaturedCircuit[]> {
    return of(FEATURED_CIRCUITS);
  }

  inspirationStories(): Observable<readonly InspirationStory[]> {
    return of(INSPIRATION_STORIES);
  }
}
