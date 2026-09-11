import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeContentService } from '../../services/home-content.service';
import { CircuitCardComponent } from '../cards/circuit-card/circuit-card.component';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-featured-circuits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CircuitCardComponent, SkeletonComponent],
  template: `
    <section class="container section">
      <h2 class="text-editorial-h1">Circuits</h2>
      <p class="lede">Multi-city itineraries, planned end to end.</p>
      <div class="grid">
        @for (circuit of circuits(); track circuit.id) {
          <app-circuit-card [circuit]="circuit" />
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
export class FeaturedCircuitsComponent {
  private readonly content = inject(HomeContentService);
  protected readonly circuits = toSignal(this.content.featuredCircuits(), { initialValue: [] });
}
