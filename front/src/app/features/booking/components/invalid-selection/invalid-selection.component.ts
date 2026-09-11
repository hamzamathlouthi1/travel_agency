import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { UnavailablePanelComponent } from '../../../../shared/ui/unavailable-panel/unavailable-panel.component';

export type InvalidSelectionReason = 'MALFORMED' | 'STALE';

const COPY: Record<InvalidSelectionReason, { title: string; body: string }> = {
  MALFORMED: {
    title: "This booking link isn't valid",
    body: 'Some details are missing or were changed. Start again from the hotel you want to book.',
  },
  STALE: {
    title: 'This room is no longer available',
    body: "The room or rate you selected has changed since you followed this link. Let's find you another one.",
  },
};

// Shown when the /booking query params fail validation (MALFORMED — see
// booking-selection-url.util.ts) or resolve to a room/rate the hotel no
// longer has (STALE — see TravellerDetailsStore.staleSelection). Distinct
// from TravellerDetailsErrorComponent, which is a genuine fetch failure the
// traveller can retry as-is.
@Component({
  selector: 'app-invalid-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, UnavailablePanelComponent],
  template: `
    <app-unavailable-panel [title]="copy().title" [body]="copy().body">
      <app-button variant="primary" [navLink]="['/hotels']">Search hotels</app-button>
    </app-unavailable-panel>
  `,
})
export class InvalidSelectionComponent {
  readonly reason = input.required<InvalidSelectionReason>();
  protected readonly copy = computed(() => COPY[this.reason()]);
}
