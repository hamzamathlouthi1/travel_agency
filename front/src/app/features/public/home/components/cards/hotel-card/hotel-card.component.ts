import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../../../../shared/ui/card/card.component';
import { MoneyPipe } from '../../../../../../shared/pipes/money.pipe';
import { FeaturedHotel } from '../../../models/featured-items';

@Component({
  selector: 'app-hotel-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, MoneyPipe],
  template: `
    <app-card interactive>
      <a [routerLink]="['/hotels', hotel().slug]" class="link">
        <img class="image" [src]="hotel().imageUrl" [alt]="hotel().name + ' in ' + hotel().city" loading="lazy" />
        <div class="body">
          <div class="row">
            <span class="name text-editorial-h2">{{ hotel().name }}</span>
            <span class="score">{{ hotel().reviewScore }}</span>
          </div>
          <span class="city">{{ hotel().city }}</span>
          <div class="price-row">
            <span class="price-label">From</span>
            <span class="price">
              {{ hotel().fromPricePerNight | money }}<span class="unit">/night</span>
            </span>
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
      aspect-ratio: 16 / 10;
      width: 100%;
      object-fit: cover;
      display: block;
    }

    .body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-2);
    }

    .name {
      font-size: var(--font-size-lg);
      min-width: 0;
    }

    .score {
      flex-shrink: 0;
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-xs);
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      border-radius: var(--radius-sm);
      padding: 3px 7px;
    }

    .city {
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
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
    }

    .unit {
      font-weight: var(--font-weight-regular);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  `,
})
export class HotelCardComponent {
  readonly hotel = input.required<FeaturedHotel>();
}
