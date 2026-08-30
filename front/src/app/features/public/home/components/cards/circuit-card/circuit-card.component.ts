import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../../../../shared/ui/card/card.component';
import { MoneyPipe } from '../../../../../../shared/pipes/money.pipe';
import { FeaturedCircuit } from '../../../models/featured-items';

@Component({
  selector: 'app-circuit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, MoneyPipe],
  template: `
    <app-card interactive>
      <a [routerLink]="['/circuits', circuit().slug]" class="link">
        <div class="image" aria-hidden="true"></div>
        <div class="body">
          <span class="eyebrow text-eyebrow">
            Circuit · {{ circuit().durationDays }} days · {{ circuit().stops }} stops
          </span>
          <span class="name text-editorial-h2">{{ circuit().name }}</span>
          <span class="route">{{ circuit().route }}</span>
          <div class="price-row">
            <span class="price-label">From</span>
            <span class="price">{{ circuit().fromPrice | money }}</span>
          </div>
        </div>
      </a>
    </app-card>
  `,
  styles: `
    .link {
      display: block;
      color: inherit;
      text-decoration: none;
    }
    .image {
      aspect-ratio: 16 / 9;
      background: linear-gradient(135deg, var(--color-teal-100), var(--color-paper-100));
    }
    .body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .name {
      font-size: var(--font-size-lg);
    }
    .route {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-block-start: var(--space-2);
    }
    .price-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
    .price {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
    }
  `,
})
export class CircuitCardComponent {
  readonly circuit = input.required<FeaturedCircuit>();
}
