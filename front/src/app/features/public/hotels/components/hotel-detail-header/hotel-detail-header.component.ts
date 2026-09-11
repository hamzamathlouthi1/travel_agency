import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { HotelDetail } from '../../models/hotel-detail.model';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import { IconButtonComponent } from '../../../../../shared/ui/icon-button/icon-button.component';

@Component({
  selector: 'app-hotel-detail-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RatingBadgeComponent, IconButtonComponent],
  template: `
    <div class="header">
      <div class="identity">
        <h1 class="name">{{ hotel().name }}</h1>
        <p class="location">
          {{ hotel().area }} · {{ hotel().destination }}
          @if (hotel().location.distanceNote) {
            · {{ hotel().location.distanceNote }}
          }
        </p>
      </div>
      <div class="right">
        <app-rating-badge
          [starRating]="hotel().starRating"
          [guestRating]="hotel().guestRating"
          [guestRatingLabel]="hotel().guestRatingLabel"
          [reviewCount]="hotel().reviewCount"
        />
        <app-icon-button
          variant="subtle"
          [ariaLabel]="favorited() ? 'Remove from saved hotels' : 'Save this hotel'"
          (click)="toggleFavorite()"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" [attr.fill]="favorited() ? 'var(--color-danger)' : 'none'" [attr.stroke]="favorited() ? 'var(--color-danger)' : 'currentColor'" stroke-width="1.8">
            <path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4.5 6 4.5c2 0 3.6 1 4.9 2.9C12.4 5.4 14 4.5 16 4.5c3.7 0 5.5 3.5 4 7.2C18 16.4 12 21 12 21z" />
          </svg>
        </app-icon-button>
      </div>
    </div>
  `,
  styles: `
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .name {
      font-family: var(--font-family-display);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-3xl);
      color: var(--color-ink-950);
      margin: 0 0 4px;
    }

    .location {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    .right {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-shrink: 0;
    }

    @media (min-width: 768px) {
      .name {
        font-size: var(--font-size-4xl);
      }
    }
  `,
})
export class HotelDetailHeaderComponent {
  readonly hotel = input.required<HotelDetail>();
  readonly favoriteChange = output<boolean>();

  protected readonly favorited = signal(false);

  toggleFavorite(): void {
    this.favorited.update((v) => !v);
    this.favoriteChange.emit(this.favorited());
  }
}
