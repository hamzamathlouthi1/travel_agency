import { Pipe, PipeTransform, inject } from '@angular/core';
import { APP_CONFIG } from '../../core/config/app-config';
import { Money } from '../types/money.model';
import { formatMoney } from '../utils/currency.util';

// {{ price | money }} — the only place a template should turn a Money value
// into a display string. Locale comes from APP_CONFIG so it moves with the
// language selector once that's wired to real i18n.
@Pipe({ name: 'money', pure: true })
export class MoneyPipe implements PipeTransform {
  private readonly config = inject(APP_CONFIG);

  transform(value: Money): string {
    return formatMoney(value, this.config.defaultLocale);
  }
}
