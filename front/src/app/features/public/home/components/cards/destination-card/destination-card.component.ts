import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeaturedDestination } from '../../../models/featured-items';

@Component({
  selector: 'app-destination-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <a class="card" routerLink="/hotels">
      <div class="image" aria-hidden="true"></div>
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
      aspect-ratio: 4 / 3;
      border-radius: var(--radius-md);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
    }

    .image {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--color-teal-100), var(--color-paper-100));
      transition: transform var(--transition-slow);
    }

    .card:hover .image {
      transform: scale(1.04);
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
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .city {
      color: #fff;
      font-size: var(--font-size-2xl);
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
