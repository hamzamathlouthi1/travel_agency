import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { UnavailablePanelComponent } from '../../../../shared/ui/unavailable-panel/unavailable-panel.component';

export type BookingUnavailableReason = 'MISSING' | 'NOT_FOUND' | 'STALE';

const COPY: Record<BookingUnavailableReason, { title: string; body: string }> = {
  MISSING: {
    title: "We can't open this booking",
    body: 'The link is missing some details. Start again from the hotel you want to book.',
  },
  NOT_FOUND: {
    title: "We can't find this booking",
    body: "It may have expired or the link may be incorrect. Start again from the hotel you want to book.",
  },
  STALE: {
    title: 'This room is no longer available',
    body: "The room or rate on this booking has changed since it was created. Let's find you another one.",
  },
};

@Component({
  selector: 'app-booking-unavailable',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, UnavailablePanelComponent],
  template: `
    <app-unavailable-panel [title]="copy().title" [body]="copy().body">
      <app-button variant="primary" [navLink]="['/hotels']">Search hotels</app-button>
    </app-unavailable-panel>
  `,
})
export class BookingUnavailableComponent {
  readonly reason = input.required<BookingUnavailableReason>();
  protected readonly copy = computed(() => COPY[this.reason()]);
}
