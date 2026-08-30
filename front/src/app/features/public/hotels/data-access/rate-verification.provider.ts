import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { RateVerificationResult } from '../models/rate-verification.model';

// Invoked right before the traveller continues toward booking. Never
// silently substitutes a changed price — the caller decides what to do
// with each RateVerificationResult (see hotel-detail.store.ts).
export interface RateVerificationProvider {
  verify(rateId: string): Observable<RateVerificationResult>;
}

export const RATE_VERIFICATION_PROVIDER = new InjectionToken<RateVerificationProvider>(
  'RATE_VERIFICATION_PROVIDER',
);
