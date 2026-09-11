import { Money } from '../types/money.model';

// Single formatting entry point so no feature hand-rolls its own currency
// string. TND is today's default but never assumed elsewhere in the app.
export function formatMoney(money: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    currencyDisplay: 'symbol',
  }).format(money.amount);
}
