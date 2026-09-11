// Card is the only method Meridian accepts today. Typed as a union (not a
// bare string) so a second method — e.g. wallet — is a type-checked
// addition everywhere it's branched on, not a silent string comparison.
export type PaymentMethod = 'CARD';

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CARD: 'Credit or debit card',
};
