import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HotelLocation } from '../../models/hotel-detail.model';

// Future-ready structure only — no map dependency until the product
// actually needs one.
@Component({
  selector: 'app-hotel-location',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2 class="title">Location</h2>
      <div class="placeholder" role="img" aria-label="Map placeholder — not yet available">
        <span>Map view — future release</span>
      </div>
      <p class="note">
        {{ location().area }}, {{ location().destination }}
        @if (location().distanceNote) {
          · {{ location().distanceNote }}
        }
      </p>
    </section>
  `,
  styles: `
    .title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
      margin: 0 0 var(--space-3);
    }

    .placeholder {
      height: 200px;
      border-radius: var(--radius-md);
      background: var(--color-paper-100);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }

    .note {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: var(--space-2) 0 0;
    }
  `,
})
export class HotelLocationComponent {
  readonly location = input.required<HotelLocation>();
}
