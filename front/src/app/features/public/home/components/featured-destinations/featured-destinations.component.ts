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
      <div class="section-head"><div><h2>Popular Destinations</h2><p class="lede">Explore the places our travellers love most.</p></div><a href="/hotels">View all destinations →</a></div>
      <div class="grid">
        @for (destination of destinations(); track destination.id) {
          <app-destination-card [destination]="destination" />
        } @empty {
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <app-skeleton height="300px" />
          }
        }
      </div>
    </section>
  `,
  styles: `
    .section {
      padding-block: 48px var(--space-16);
    }

    .lede {
      font-size: var(--font-size-md);
      color: var(--color-text-muted);
      margin: 5px 0 0;
    }
    .section-head { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
    h2 { margin: 0; color: #092f50; font-size: 28px; letter-spacing: -.04em; }
    .section-head a { padding: 9px 15px; border: 1px solid #cbddeb; border-radius: 999px; color: #0b629f; font-size: 11px; font-weight: 700; text-decoration: none; }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-4);
    }

    @media (min-width: 768px) {
      .grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
    @media (max-width: 600px) { .section-head { align-items: start; } .section-head a { display: none; } }
  `,
})
export class FeaturedDestinationsComponent {
  private readonly content = inject(HomeContentService);
  protected readonly destinations = toSignal(this.content.featuredDestinations(), {
    initialValue: [],
  });
}
