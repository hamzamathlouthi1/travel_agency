import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { Destination } from '../models/destination';
import { DestinationProvider } from './destination-provider';
import {
  MOCK_DESTINATIONS,
  MOCK_POPULAR_DESTINATION_IDS,
  MOCK_RECENT_DESTINATION_IDS,
} from '../data/destinations.mock';

const SIMULATED_LATENCY_MS = 180;

@Injectable({ providedIn: 'root' })
export class MockDestinationProviderService implements DestinationProvider {
  popular(): Observable<readonly Destination[]> {
    return this.byIds(MOCK_POPULAR_DESTINATION_IDS);
  }

  recent(): Observable<readonly Destination[]> {
    return this.byIds(MOCK_RECENT_DESTINATION_IDS);
  }

  search(query: string): Observable<readonly Destination[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return of(MOCK_DESTINATIONS).pipe(delay(SIMULATED_LATENCY_MS));
    }
    return of(MOCK_DESTINATIONS).pipe(
      delay(SIMULATED_LATENCY_MS),
      map((destinations) =>
        destinations.filter((d) => `${d.city} ${d.country}`.toLowerCase().includes(normalized)),
      ),
    );
  }

  private byIds(ids: readonly string[]): Observable<readonly Destination[]> {
    const byId = new Map(MOCK_DESTINATIONS.map((d) => [d.id, d]));
    return of(ids.map((id) => byId.get(id)).filter((d): d is Destination => !!d));
  }
}
