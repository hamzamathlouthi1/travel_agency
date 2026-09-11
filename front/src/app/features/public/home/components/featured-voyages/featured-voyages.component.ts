import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeContentService } from '../../services/home-content.service';
import { VoyageCardComponent } from '../cards/voyage-card/voyage-card.component';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-featured-voyages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VoyageCardComponent, SkeletonComponent],
  template: `
    <section class="container section">
      <h2 class="text-editorial-h1">Voyages &amp; packages</h2>
      <p class="lede">Flight, stay and transfers bundled into one fare.</p>
      <div class="grid">
        @for (voyage of voyages(); track voyage.id) {
          <app-voyage-card [voyage]="voyage" />
        } @empty {
          @for (i of [1, 2, 3]; track i) {
            <app-skeleton height="240px" />
          }
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
      margin: var(--space-2) 0 var(--space-6);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }
    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
})
export class FeaturedVoyagesComponent {
  private readonly content = inject(HomeContentService);
  protected readonly voyages = toSignal(this.content.featuredVoyages(), { initialValue: [] });
}
