import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HomeContentService } from '../../services/home-content.service';
import { HotelCardComponent } from '../cards/hotel-card/hotel-card.component';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';

@Component({
  selector: 'app-featured-hotels',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HotelCardComponent, SkeletonComponent],
  template: `
    <section class="container section">
      <h2 class="text-editorial-h1">Featured stays</h2>
      <p class="lede">Hand-picked hotels our team has personally reviewed.</p>
      <div class="grid">
        @for (hotel of hotels(); track hotel.id) {
          <app-hotel-card [hotel]="hotel" />
        } @empty {
          @for (i of [1, 2, 3]; track i) {
            <app-skeleton height="280px" />
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
export class FeaturedHotelsComponent {
  private readonly content = inject(HomeContentService);
  protected readonly hotels = toSignal(this.content.featuredHotels(), { initialValue: [] });
}
