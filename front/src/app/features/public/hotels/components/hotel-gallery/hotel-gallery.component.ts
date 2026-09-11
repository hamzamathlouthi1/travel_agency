import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HotelImage } from '../../models/hotel-result.model';

// One markup, two presentations via CSS only (no carousel dependency):
// a fixed grid on desktop, a native horizontal scroll-snap strip on mobile
// — both render the same DOM so SSR output matches either viewport.
@Component({
  selector: 'app-hotel-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gallery" role="group" [attr.aria-label]="'Photos of ' + hotelName()">
      @for (image of images(); track image.id; let i = $index) {
        <div class="frame" [class.hero]="i === 0" [attr.data-index]="i">
          <img class="fill" [src]="image.src ?? ''" [alt]="image.alt" [loading]="i === 0 ? 'eager' : 'lazy'" />
          @if (i === 0) {
            <span class="count">1 / {{ images().length }}</span>
          }
          @if (i === lastVisibleDesktopIndex() && images().length > maxDesktopTiles) {
            <span class="more">+{{ images().length - maxDesktopTiles }} photos</span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .gallery {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      border-radius: var(--radius-lg);
    }

    .frame {
      position: relative;
      flex: 0 0 82%;
      aspect-ratio: 4 / 3;
      scroll-snap-align: start;
      overflow: hidden;
      border-radius: var(--radius-md);
    }

    .fill {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 500ms cubic-bezier(.2,.75,.2,1);
    }

    .frame:hover .fill { transform: scale(1.035); }

    .tone-0 {
      background: linear-gradient(135deg, var(--color-teal-100), var(--color-paper-100));
    }
    .tone-1 {
      background: linear-gradient(135deg, var(--color-amber-100), var(--color-paper-100));
    }
    .tone-2 {
      background: linear-gradient(135deg, var(--color-paper-100), var(--color-teal-100));
    }

    .count {
      position: absolute;
      inset-block-end: 10px;
      inset-inline-end: 10px;
      background: rgba(10, 14, 20, 0.6);
      color: #fff;
      font-size: 11px;
      font-weight: var(--font-weight-bold);
      border-radius: 5px;
      padding: 3px 8px;
    }

    .more {
      position: absolute;
      inset: 0;
      background: rgba(10, 14, 20, 0.55);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-bold);
      font-size: 13px;
    }

    @media (min-width: 1024px) {
      .gallery {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        height: 440px;
        overflow: visible;
      }

      .frame {
        flex: none;
        aspect-ratio: auto;
        border-radius: 0;
      }

      .frame.hero {
        grid-row: 1 / 3;
      }

      .frame:nth-child(-n + 5):not(.hero) {
        display: block;
      }

      .frame:nth-child(n + 6) {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) { .fill { transition: none; } }
  `,
})
export class HotelGalleryComponent {
  readonly images = input.required<readonly HotelImage[]>();
  readonly hotelName = input('this hotel');

  protected readonly maxDesktopTiles = 5;

  protected lastVisibleDesktopIndex(): number {
    return Math.min(this.maxDesktopTiles, this.images().length) - 1;
  }
}
