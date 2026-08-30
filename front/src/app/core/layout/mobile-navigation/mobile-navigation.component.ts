import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DrawerComponent } from '../../../shared/ui/drawer/drawer.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../auth/services/auth.service';

// Bottom-sheet mobile nav, per the approved design — not a slide-in side
// panel — so primary actions stay reachable one-handed.
@Component({
  selector: 'app-mobile-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DrawerComponent, RouterLink, ButtonComponent],
  template: `
    <app-drawer [open]="open()" edge="block-end" label="Menu" (requestClose)="requestClose.emit()">
      <nav class="links">
        <a routerLink="/hotels" class="link" (click)="requestClose.emit()">Hotels</a>
        <a routerLink="/voyages" class="link" (click)="requestClose.emit()">Voyages</a>
        <a routerLink="/circuits" class="link" (click)="requestClose.emit()">Circuits</a>
        <a routerLink="/offers" class="link" (click)="requestClose.emit()">Offers</a>
        <a routerLink="/b2b/login" class="link professional" (click)="requestClose.emit()">
          For travel professionals
        </a>
      </nav>

      @if (auth.isAuthenticated()) {
        <div class="account-links">
          <a routerLink="/account/reservations" class="link" (click)="requestClose.emit()">My trips</a>
          <a routerLink="/account" class="link" (click)="requestClose.emit()">Profile &amp; settings</a>
        </div>
      } @else {
        <div class="auth-actions">
          <app-button variant="secondary" fullWidth [navLink]="['/login']" (click)="requestClose.emit()">
            Sign in
          </app-button>
          <app-button variant="primary" fullWidth [navLink]="['/register']" (click)="requestClose.emit()">
            Create account
          </app-button>
        </div>
      }

      <div class="locale-row">
        <span>EN &middot; English</span>
        <span>TND</span>
      </div>
    </app-drawer>
  `,
  styles: `
    .links {
      display: flex;
      flex-direction: column;
    }

    .link {
      padding: var(--space-3) var(--space-1);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-md);
      color: var(--color-text-primary);
      text-decoration: none;
      border-block-end: 1px solid var(--color-border);
      min-height: 44px;
      display: flex;
      align-items: center;
    }

    .link.professional {
      color: var(--color-teal-600);
      font-size: var(--font-size-sm);
      border-block-end: none;
    }

    .account-links {
      margin-block-start: var(--space-2);
    }

    .auth-actions {
      display: flex;
      gap: var(--space-3);
      margin-block-start: var(--space-4);
    }

    .locale-row {
      display: flex;
      gap: var(--space-4);
      margin-block-start: var(--space-4);
      padding-block-start: var(--space-4);
      border-block-start: 1px solid var(--color-border);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-muted);
    }
  `,
})
export class MobileNavigationComponent {
  protected readonly auth = inject(AuthService);
  readonly open = input(false);
  readonly requestClose = output<void>();
}
