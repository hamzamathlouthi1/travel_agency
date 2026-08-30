import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

// Hotel star category and guest rating are different concepts and must
// never merge into one scale — this renders both, visually distinct, with
// an accessible text equivalent to the star glyphs (screen readers don't
// reliably announce repeated ★ characters as a count).
@Component({
  selector: 'app-rating-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <span class="stars" aria-hidden="true">{{ starGlyphs() }}</span>
      <span class="visually-hidden">{{ starRating() }}-star hotel</span>

      @if (guestRating() !== null) {
        <div class="guest">
          <span class="score">{{ guestRating() }}</span>
          <div class="guest-text">
            <span class="label">{{ guestRatingLabel() }}</span>
            <span class="reviews">{{ reviewCount() | number }} reviews</span>
          </div>
        </div>
      }
    </div>
  `,
  imports: [DecimalPipe],
  styles: `
    .wrap {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .stars {
      color: var(--color-amber-600);
      font-size: 12px;
      letter-spacing: 1px;
    }

    .guest {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .score {
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-sm);
      border-radius: var(--radius-sm);
      padding: 3px 7px;
    }

    .guest-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .label {
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      color: var(--color-text-secondary);
    }

    .reviews {
      font-size: 10.5px;
      color: var(--color-text-muted);
    }
  `,
})
export class RatingBadgeComponent {
  readonly starRating = input.required<number>();
  readonly guestRating = input<number | null>(null);
  readonly guestRatingLabel = input<string | null>(null);
  readonly reviewCount = input(0);

  protected starGlyphs(): string {
    return '★'.repeat(Math.round(this.starRating()));
  }
}
