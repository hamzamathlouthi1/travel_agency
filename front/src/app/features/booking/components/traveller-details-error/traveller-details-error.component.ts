import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RetryPanelComponent } from '../../../../shared/ui/retry-panel/retry-panel.component';

@Component({
  selector: 'app-traveller-details-error',
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
export class TravellerDetailsErrorComponent {
  readonly retry = output<void>();
}
