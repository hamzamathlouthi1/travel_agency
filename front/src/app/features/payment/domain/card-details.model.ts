// Ephemeral only — a function parameter type, never a property of any
// object that outlives one gateway call. Never assign this to a Booking,
// never put it in a signal that a store retains, never log it, never place
// any of it in a URL. See MockPaymentGateway and PaymentStore.submit for
// the one place a CardDetails value is allowed to exist.
export interface CardDetails {
  readonly holderName: string;
  readonly number: string;
  readonly expiry: string; // MM/YY
  readonly cvv: string;
}
