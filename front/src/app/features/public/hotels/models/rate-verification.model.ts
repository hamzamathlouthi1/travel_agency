import { Money } from '../../../../shared/types/money.model';

// A normalized frontend simulation of what a future backend recheck will
// eventually do before booking (supplier availability/price can move
// between browse and book). This is NOT MyGo or TunisiaBeds behavior —
// it's purely a frontend contract, deliberately shaped so a real backend
// response can slot into the same union later without UI changes.
export type RateVerificationStatus =
  | 'AVAILABLE_SAME_PRICE'
  | 'AVAILABLE_PRICE_CHANGED'
  | 'SOLD_OUT'
  | 'TEMPORARY_ERROR';

export interface RateVerificationResult {
  readonly status: RateVerificationStatus;
  /** Present only when status is AVAILABLE_PRICE_CHANGED. */
  readonly latestPrice?: Money;
  readonly previousPrice?: Money;
}
