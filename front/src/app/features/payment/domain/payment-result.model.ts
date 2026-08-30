import { PaymentStatus } from './payment-status.model';

export interface PaymentResult {
  readonly status: PaymentStatus;
  // A gateway transaction reference — present only on SUCCESS. Distinct
  // from Booking.reference (the booking locator, assigned at creation).
  readonly gatewayReference: string | null;
  // Present only on DECLINED — a customer-safe reason, never a raw gateway/
  // bank error code.
  readonly declineReason: string | null;
}
