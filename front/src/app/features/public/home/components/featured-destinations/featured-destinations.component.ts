import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeContentService } from '../../services/home-content.service';
import { DestinationCardComponent } from '../cards/destination-card/destination-card.component';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-featured-destinations',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DestinationCardComponent, SkeletonComponent],
  template: `
    <section class="container section">
      <h2 class="text-editorial-h1">Where next?</h2>
      <p class="lede">Six destinations our travellers keep returning to this season.</p>
      <div class="grid">
        @for (destination of destinations(); track destination.id) {
          <app-destination-card [destination]="destination" />
        } @empty {
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <app-skeleton height="220px" />
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
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-4);
    }

    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
  `,
})
export class FeaturedDestinationsComponent {
  private readonly content = inject(HomeContentService);
  protected readonly destinations = toSignal(this.content.featuredDestinations(), {
    initialValue: [],
  });
}
