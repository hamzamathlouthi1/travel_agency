import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

// Structural stand-in for a route boundary that has no real page yet.
// Route `data.title` supplies the label. Delete usages of this component as
// each feature's real page is implemented — it carries no visual design.
@Component({
  selector: 'app-route-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="route-placeholder">
      <p class="text-caption">Foundation scaffold — page not yet implemented</p>
      <h1 class="text-h2">{{ title() }}</h1>
    </section>
  `,
  styles: `
    .route-placeholder {
      padding: var(--space-8) var(--space-4);
    }
  `,
})
export class RoutePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly title = toSignal(
    this.route.data.pipe(map((data) => (data['title'] as string) ?? 'Untitled route')),
    { initialValue: 'Untitled route' },
  );
}
