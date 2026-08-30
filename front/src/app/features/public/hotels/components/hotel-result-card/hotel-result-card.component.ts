import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HotelResult } from '../../models/hotel-result.model';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import { CancellationBadgeComponent } from '../cancellation-badge/cancellation-badge.component';
import { PriceSummaryComponent } from '../price-summary/price-summary.component';
import { AvailabilityMessageComponent } from '../availability-message/availability-message.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { BOARD_TYPE_LABEL } from '../../models/hotel-result.model';

// The card's only navigation targets are the image, the hotel name, and the
// "View rooms" CTA — all three real <a routerLink> anchors pointing at the
// same hotel, never one giant click-catching div. "View hotel" is a
// secondary link to the same destination as the name/image.
@Component({
  selector: 'app-hotel-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RatingBadgeComponent,
    CancellationBadgeComponent,
    PriceSummaryComponent,
    AvailabilityMessageComponent,
    BadgeComponent,
  ],
  template: `
    <article class="card">
      <a class="image" [routerLink]="['/hotels', hotel().slug]" [attr.aria-label]="hotel().name">
        <span class="image-fill" aria-hidden="true"></span>
        @if (hotel().images.length) {
          <span class="image-count">1 / {{ hotel().images.length * 8 }}</span>
        }
      </a>

      <div class="body">
        @if (hotel().badges.includes('SPONSORED')) {
          <app-badge tone="neutral" class="sponsored">Sponsored</app-badge>
        }
        <div class="head">
          <div class="identity">
            <app-rating-badge
              [starRating]="hotel().starRating"
              [guestRating]="hotel().guestRating"
              [guestRatingLabel]="hotel().guestRatingLabel"
              [reviewCount]="hotel().reviewCount"
            />
            <h3 class="name">
              <a [routerLink]="['/hotels', hotel().slug]">{{ hotel().name }}</a>
            </h3>
            <p class="location">
              {{ hotel().area }} · {{ hotel().destination }}
              @if (hotel().distanceNote) {
                · {{ hotel().distanceNote }}
              }
            </p>
          </div>
        </div>

        @if (hotel().amenities.length) {
          <ul class="amenities">
            @for (amenity of hotel().amenities.slice(0, 3); track amenity.id) {
              <li>{{ amenity.label }}</li>
            }
          </ul>
        }

        <div class="room-line">
          <span class="room-name">{{ hotel().bestOffer.roomName }} · {{ occupancyLabel() }}</span>
          <span class="board">{{ boardLabel() }}</span>
        </div>

        <app-cancellation-badge [policy]="hotel().bestOffer.cancellationPolicy" />
        <app-availability-message [signal]="hotel().availability" />
      </div>

      <div class="cta-col">
        <app-price-summary
          [totalPrice]="hotel().bestOffer.totalPrice"
          [pricePerNight]="hotel().bestOffer.pricePerNight"
          [taxesIncluded]="hotel().bestOffer.taxes.included"
          [nights]="nights()"
          [occupancyLabel]="occupancyLabel()"
        />
        <a class="view-rooms" [routerLink]="['/hotels', hotel().slug]">View rooms</a>
        <a class="view-hotel" [routerLink]="['/hotels', hotel().slug]">View hotel</a>
      </div>
    </article>
  `,
  styles: `
    .card {
      display: flex;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      overflow: hidden;
      flex-direction: column;
    }

    .image {
      position: relative;
      display: block;
      aspect-ratio: 16 / 9;
    }

    .image-fill {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--color-teal-100), var(--color-paper-100));
    }

    .image-count {
      position: absolute;
      inset-block-start: 10px;
      inset-inline-start: 10px;
      background: rgba(10, 14, 20, 0.55);
      color: #fff;
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      border-radius: 5px;
      padding: 3px 7px;
    }

    .body {
      padding: var(--space-4) var(--space-5);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sponsored {
      align-self: flex-start;
      background: transparent !important;
      color: var(--color-text-muted) !important;
      border: 1px solid var(--color-border);
    }

    .name {
      margin: 4px 0 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-extrabold);
    }

    .name a {
      color: var(--color-text-primary);
      text-decoration: none;
    }

    .name a:hover {
      text-decoration: underline;
    }

    .location {
      margin: 2px 0 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .amenities {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
      list-style: none;
      margin: 4px 0 0;
      padding: 0;
    }

    .amenities li {
      font-size: 11.5px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      padding: 3px 10px;
    }

    .room-line {
      margin-block-start: 6px;
      padding-block-start: 10px;
      border-block-start: 1px solid var(--color-surface-subtle);
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .room-name {
      font-size: 12.5px;
      font-weight: var(--font-weight-bold);
    }

    .board {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .cta-col {
      padding: var(--space-4) var(--space-5);
      border-block-start: 1px solid var(--color-surface-subtle);
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-2);
    }

    .view-rooms {
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      font-weight: var(--font-weight-bold);
      font-size: 13.5px;
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      border-radius: var(--radius-md);
      padding: 11px;
      text-decoration: none;
    }

    .view-rooms:hover {
      background: var(--color-ink-900);
    }

    .view-hotel {
      font-size: 11.5px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-teal-600);
      text-decoration: none;
    }

    .view-hotel:hover {
      text-decoration: underline;
    }

    @media (min-width: 768px) {
      .card {
        flex-direction: row;
      }
      .image {
        width: 260px;
        aspect-ratio: auto;
        flex-shrink: 0;
      }
      .body {
        flex: 1;
        min-width: 0;
      }
      .cta-col {
        width: 200px;
        flex-shrink: 0;
        border-block-start: none;
        border-inline-start: 1px solid var(--color-surface-subtle);
        justify-content: space-between;
      }
    }
  `,
})
export class HotelResultCardComponent {
  readonly hotel = input.required<HotelResult>();
  readonly nights = input(1);

  protected readonly occupancyLabel = computed(() => {
    const { adults, children } = this.hotel().bestOffer.occupancy;
    const adultsLabel = `${adults} adult${adults === 1 ? '' : 's'}`;
    return children > 0 ? `${adultsLabel}, ${children} child${children === 1 ? '' : 'ren'}` : adultsLabel;
  });

  protected readonly boardLabel = computed(() => BOARD_TYPE_LABEL[this.hotel().bestOffer.boardType]);
}
