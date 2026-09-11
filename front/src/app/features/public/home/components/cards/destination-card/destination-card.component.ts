import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeaturedDestination } from '../../../models/featured-items';

@Component({
  selector: 'app-destination-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="card" routerLink="/hotels">
      <span class="badge">Popular</span>
      <img class="image" [src]="destination().imageUrl" [alt]="destination().city" loading="lazy" />
      <div class="overlay"></div>
      <div class="content">
        <span class="city text-editorial-h2">{{ destination().city }}</span>
        <span class="tagline">{{ destination().tagline }}</span>
      </div>
    </a>
  `,
  styles: `
    .card {
      position: relative;
      display: block;
      aspect-ratio: 3 / 4;
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 8px 25px rgba(17,70,109,.12);
      transition: transform .25s ease, box-shadow .25s ease;
    }
    .card:hover { transform: translateY(-7px); box-shadow: 0 18px 38px rgba(17,70,109,.2); }
    .badge { position: absolute; z-index: 2; top: 12px; left: 12px; padding: 5px 9px; border-radius: 999px; background: rgba(255,255,255,.92); color: #0873d1; font-size: 9px; font-weight: 800; }

    .image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-slow);
    }

    .card:hover .image {
      transform: scale(1.07);
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(10, 14, 20, 0.72), transparent 55%);
    }

    .content {
      position: absolute;
      inset-block-end: 0;
      inset-inline: 0;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .city {
      color: #fff;
      font-family: var(--font-family-base);
      font-size: 18px;
      font-weight: 800;
    }

    .tagline {
      font-size: var(--font-size-xs);
      color: oklch(90% 0.01 250);
    }

    @media (prefers-reduced-motion: reduce) {
      .image {
        transition: none;
      }
    }
  `,
})
export class DestinationCardComponent {
  readonly destination = input.required<FeaturedDestination>();
}
