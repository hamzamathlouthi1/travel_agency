import { Money } from '../../../shared/types/money.model';
import { PaymentMethod } from './payment-method.model';
import { CardDetails } from './card-details.model';

// What PaymentStore hands to PAYMENT_GATEWAY. `card` is present only for the
// duration of this one call — the gateway reads it to decide the outcome
// and must never retain it (see MockPaymentGateway).
export interface PaymentRequest {
  readonly bookingId: string;
  readonly amount: Money;
  readonly method: PaymentMethod;
  readonly card: CardDetails;
}
