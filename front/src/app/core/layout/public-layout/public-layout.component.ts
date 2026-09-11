import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

// Shell for every /,  /hotels, /voyages, /circuits, /offers... route:
// skip link -> header -> routed page content -> footer.
@Component({
  selector: 'app-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PublicHeaderComponent, PublicFooterComponent],
  template: `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <app-public-header />
    <main id="main-content">
      <router-outlet />
    </main>
    <app-public-footer />
  `,
})
export class PublicLayoutComponent {}
