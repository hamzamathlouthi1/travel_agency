import { Money } from '../../../../shared/types/money.model';
import { AvailabilitySignal, BoardType, CancellationPolicy, TaxesInfo } from './hotel-result.model';

// Deliberately absent from RatePlan: any notion of a fixed "the room's
// price". A room can list several of these, differing only in board /
// cancellation / payment timing — the price difference must always be
// explained by what's here, never presented as a bare number.
export type PaymentTiming = 'PAY_NOW' | 'PAY_LATER' | 'PAY_AT_PROPERTY';

export const PAYMENT_TIMING_LABEL: Record<PaymentTiming, string> = {
  PAY_NOW: 'Pay now',
  PAY_LATER: 'Pay later',
  PAY_AT_PROPERTY: 'Pay at the property',
};

export interface RatePlan {
  readonly id: string;
  readonly boardType: BoardType;
  readonly cancellationPolicy: CancellationPolicy;
  /** Optional — not yet surfaced in the approved UI; modeled for the future booking/payment steps. */
  readonly paymentTiming?: PaymentTiming;
  readonly totalPrice: Money;
  readonly pricePerNight: Money;
  readonly taxes: TaxesInfo;
  readonly availability: AvailabilitySignal;
  readonly available: boolean;
}
