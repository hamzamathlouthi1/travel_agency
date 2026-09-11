import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { RateVerificationProvider } from './rate-verification.provider';
import { RateVerificationResult } from '../models/rate-verification.model';
import { HOTEL_DETAILS_MOCK } from '../data/hotel-details.mock';

const SIMULATED_LATENCY_MS = 900;

// Deterministic by design — never random. A small lookup table keyed by
// known mock rate IDs drives every outcome, so the same rate always
// verifies the same way and tests stay reproducible. "demo-price-changed"
// and "demo-sold-out" (see hotel-details.mock.ts) exist specifically to
// make every outcome reachable through ordinary navigation.
const SCRIPTED_OUTCOMES: Record<string, RateVerificationResult['status']> = {
  'demo-price-changed': 'AVAILABLE_PRICE_CHANGED',
  'demo-sold-out': 'SOLD_OUT',
};

@Injectable({ providedIn: 'root' })
export class MockRateVerificationProvider implements RateVerificationProvider {
  verify(rateId: string): Observable<RateVerificationResult> {
    const status = SCRIPTED_OUTCOMES[rateId] ?? 'AVAILABLE_SAME_PRICE';
    const rate = this.findRate(rateId);
    const previousPrice = rate?.totalPrice;

    const result: RateVerificationResult =
      status === 'AVAILABLE_PRICE_CHANGED' && previousPrice
        ? {
            status,
            previousPrice,
            latestPrice: { amount: Math.round(previousPrice.amount * 1.04), currency: previousPrice.currency },
          }
        : { status };

    return of(result).pipe(delay(SIMULATED_LATENCY_MS));
  }

  private findRate(rateId: string) {
    for (const hotel of HOTEL_DETAILS_MOCK) {
      for (const room of hotel.rooms) {
        const rate = room.ratePlans.find((r) => r.id === rateId);
        if (rate) return rate;
      }
    }
    return undefined;
  }
}
