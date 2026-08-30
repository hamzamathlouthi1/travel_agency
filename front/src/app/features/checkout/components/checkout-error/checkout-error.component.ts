import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RetryPanelComponent } from '../../../../shared/ui/retry-panel/retry-panel.component';

@Component({
  selector: 'app-checkout-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RetryPanelComponent],
  template: `
    <app-retry-panel
      title="We couldn't load your booking"
      body="Something went wrong on our side."
      (retry)="retry.emit()"
    />
  `,
})
export class CheckoutErrorComponent {
  readonly retry = output<void>();
}
