// The gateway's three terminal outcomes. Deliberately distinct from a
// frontend "processing" phase (see PaymentStore.processing) — a gateway
// never returns PROCESSING, that's a transient UI state while its
// Observable is still in flight. DECLINED and TECHNICAL_ERROR are kept
// apart everywhere they're branched on: a decline is the card issuer
// refusing the charge; a technical error is our own simulated
// infrastructure failing to reach the gateway at all. Never state one when
// the other happened.
export type PaymentStatus = 'SUCCESS' | 'DECLINED' | 'TECHNICAL_ERROR';

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  SUCCESS: 'Payment successful',
  DECLINED: 'Payment declined',
  TECHNICAL_ERROR: "We couldn't process your payment",
};
