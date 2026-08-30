import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Amenity } from '../../models/hotel-result.model';

const COLLAPSED_COUNT = 6;

@Component({
  selector: 'app-hotel-amenities',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2 class="title">Amenities</h2>
      <ul class="grid">
        @for (amenity of visible(); track amenity.id) {
          <li>{{ amenity.label }}</li>
        }
      </ul>
      @if (amenities().length > COLLAPSED_COUNT) {
        <button type="button" class="toggle" (click)="expanded.set(!expanded())">
          {{ expanded() ? 'Show fewer amenities' : 'Show all ' + amenities().length + ' amenities' }}
        </button>
      }
    </section>
  `,
  styles: `
    .title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
      margin: 0 0 var(--space-3);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-2) var(--space-6);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .grid li {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      padding-inline-start: var(--space-6);
      position: relative;
    }

    .grid li::before {
      content: '';
      position: absolute;
      inset-inline-start: 0;
      inset-block-start: 7px;
      width: 8px;
      height: 8px;
      border-radius: 2px;
      background: var(--color-teal-500);
    }

    .toggle {
      margin-block-start: var(--space-3);
      background: none;
      border: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-ink-950);
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
      min-height: 44px;
    }

    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `,
})
export class HotelAmenitiesComponent {
  readonly amenities = input.required<readonly Amenity[]>();

  protected readonly COLLAPSED_COUNT = COLLAPSED_COUNT;
  protected readonly expanded = signal(false);

  protected readonly visible = computed(() =>
    this.expanded() ? this.amenities() : this.amenities().slice(0, COLLAPSED_COUNT),
  );
}
