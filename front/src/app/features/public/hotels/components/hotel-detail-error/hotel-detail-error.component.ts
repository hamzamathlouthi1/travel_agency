import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { RetryPanelComponent } from '../../../../../shared/ui/retry-panel/retry-panel.component';

@Component({
  selector: 'app-hotel-detail-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, RetryPanelComponent],
  template: `
    <app-retry-panel
      title="We couldn't load this hotel"
      body="Something went wrong on our side."
      (retry)="retry.emit()"
    >
      <app-button variant="secondary" [navLink]="['/hotels']">Back to results</app-button>
    </app-retry-panel>
  `,
})
export class HotelDetailErrorComponent {
  readonly retry = output<void>();
}
