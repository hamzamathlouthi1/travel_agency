import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TravelSearchComponent } from '../../../search/components/travel-search/travel-search.component';

// Search dominates the conversion path — headline stays to one line,
// supporting copy to one sentence, everything else is the search bar.
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TravelSearchComponent],
  template: `
    <section class="hero">
      <div class="container">
        <p class="text-eyebrow eyebrow">International travel, done properly</p>
        <h1 class="headline">Go further, book with confidence.</h1>
        <p class="subcopy">
          Hotels, voyages and circuits across 40+ countries, secured instantly and backed by
          24/7 support.
        </p>
        <div class="search-slot">
          <app-travel-search />
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      background: linear-gradient(
        160deg,
        oklch(30% 0.03 220) 0%,
        oklch(22% 0.03 250) 55%,
        var(--color-ink-950) 100%
      );
      padding-block: var(--space-16) var(--space-20);
    }

    .eyebrow {
      color: var(--color-amber-500);
    }

    .headline {
      font-family: var(--font-family-display);
      font-style: italic;
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-4xl);
      line-height: var(--line-height-tight);
      color: #fff;
      max-width: 18ch;
      margin: var(--space-4) 0 var(--space-3);
    }

    .subcopy {
      font-size: var(--font-size-md);
      line-height: var(--line-height-relaxed);
      color: oklch(88% 0.01 250);
      max-width: 46ch;
      margin: 0 0 var(--space-8);
    }

    .search-slot {
      max-width: 1080px;
    }

    @media (min-width: 768px) {
      .headline {
        font-size: var(--font-size-5xl);
        max-width: 22ch;
      }
    }

    @media (min-width: 1024px) {
      .headline {
        font-size: var(--font-size-6xl);
      }
    }
  `,
})
export class HeroComponent {}
