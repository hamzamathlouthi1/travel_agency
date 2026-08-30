import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Destination } from '../models/destination';

// Search components depend on this token, never on a concrete provider —
// swap DESTINATION_PROVIDER's `useClass` for an HTTP-backed implementation
// once the Spring Boot endpoint exists and nothing in the UI layer changes.
export interface DestinationProvider {
  popular(): Observable<readonly Destination[]>;
  recent(): Observable<readonly Destination[]>;
  search(query: string): Observable<readonly Destination[]>;
}

export const DESTINATION_PROVIDER = new InjectionToken<DestinationProvider>('DESTINATION_PROVIDER');
