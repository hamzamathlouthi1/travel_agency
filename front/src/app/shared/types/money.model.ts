// Money is always an { amount, currency } pair — never a formatted string
// or a bare number — so a component can never accidentally hardcode a
// currency symbol or assume TND. Formatting happens once, centrally, in
// shared/utils/currency.util.ts.
export interface Money {
  readonly amount: number;
  readonly currency: string;
}
