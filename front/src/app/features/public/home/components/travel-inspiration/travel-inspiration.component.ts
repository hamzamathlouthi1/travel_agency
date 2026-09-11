import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeContentService } from '../../services/home-content.service';

// Where the editorial/serif identity is strongest — long-form headlines,
// generous line-height, minimal chrome.
@Component({
  selector: 'app-travel-inspiration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section">
      <h2 class="text-editorial-h1">Field notes</h2>
      <p class="lede">Stories from the places we book, written by people who've been there.</p>
      <div class="grid">
        @for (story of stories(); track story.id; let first = $first) {
          <article class="story" [class.lead]="first">
            <img class="image" [class.tall]="first" [src]="story.imageUrl" [alt]="story.title" loading="lazy" />
            <p class="text-eyebrow kicker">{{ story.kicker }}</p>
            <h3 class="story-title">{{ story.title }}</h3>
            @if (story.excerpt) {
              <p class="excerpt">{{ story.excerpt }}</p>
            }
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    .section {
      padding-block-end: var(--space-16);
    }

    .lede {
      font-size: var(--font-size-md);
      color: var(--color-text-muted);
      margin: var(--space-2) 0 var(--space-8);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
    }

    .image {
      aspect-ratio: 16 / 10;
      border-radius: var(--radius-md);
      width: 100%;
      object-fit: cover;
      display: block;
      margin-block-end: var(--space-4);
    }

    .image.tall {
      aspect-ratio: 4 / 3;
    }

    .kicker {
      margin: 0 0 var(--space-2);
    }

    .story-title {
      font-family: var(--font-family-display);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-xl);
      line-height: var(--line-height-tight);
      margin: 0 0 var(--space-2);
    }

    .story.lead .story-title {
      font-size: var(--font-size-2xl);
    }

    .excerpt {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    @media (min-width: 1024px) {
      .grid {
        grid-template-columns: 1.3fr 1fr 1fr;
      }
    }
  `,
})
export class TravelInspirationComponent {
  private readonly content = inject(HomeContentService);
  protected readonly stories = toSignal(this.content.inspirationStories(), { initialValue: [] });
}
