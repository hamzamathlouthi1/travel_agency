import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvailabilitySignal } from '../../models/hotel-result.model';

// Renders nothing when `signal` is null — availability urgency only ever
// appears when the backend actually returns one; it is never fabricated
// client-side.
@Component({
  selector: 'app-availability-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (signal(); as s) {
      <div class="row" [class.low]="s.kind === 'LOW_AVAILABILITY'">
        <span class="dot" aria-hidden="true"></span>
        @if (s.kind === 'LOW_AVAILABILITY') {
          <span>Only {{ s.roomsLeft }} room{{ s.roomsLeft === 1 ? '' : 's' }} left at this price</span>
        } @else {
          <span>Popular for your dates</span>
        }
      </div>
    }
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: var(--font-weight-bold);
      color: var(--color-teal-600);
    }

    .row.low {
      color: color-mix(in srgb, var(--color-amber-600) 65%, black);
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
  `,
})
export class AvailabilityMessageComponent {
  readonly signal = input<AvailabilitySignal>(null);
}
