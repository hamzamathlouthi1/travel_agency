import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DropdownComponent } from '../../../shared/ui/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../auth/services/auth.service';

// Renders one of two states depending on AuthService.isAuthenticated():
// sign-in/create-account buttons, or an avatar dropdown with account links.
@Component({
  selector: 'app-account-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DropdownComponent, ButtonComponent],
  template: `
    @if (auth.isAuthenticated()) {
      <app-dropdown [(open)]="open">
        <button dropdownTrigger type="button" class="avatar-trigger" [attr.aria-expanded]="open()">
          <span class="avatar">{{ initials() }}</span>
        </button>
        <div dropdownPanel class="menu">
          <div class="identity">
            <div class="name">{{ auth.currentUser()?.displayName }}</div>
            <div class="email">{{ auth.currentUser()?.email }}</div>
          </div>
          <a routerLink="/account/reservations" class="item">My trips</a>
          <a routerLink="/account" class="item">Profile &amp; settings</a>
          <button type="button" class="item sign-out" (click)="signOut()">Sign out</button>
        </div>
      </app-dropdown>
    } @else {
      <div class="guest-actions">
        <app-button variant="secondary" size="sm" [navLink]="['/login']">Sign in</app-button>
        <app-button variant="primary" size="sm" [navLink]="['/register']">Create account</app-button>
      </div>
    }
  `,
  styles: `
    .avatar-trigger {
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 50%;
      padding: 0;
    }

    .avatar-trigger:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-teal-100);
      color: var(--color-teal-600);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-xs);
    }

    .menu {
      inline-size: 240px;
      overflow: hidden;
    }

    .identity {
      padding: var(--space-3) var(--space-4);
      border-block-end: 1px solid var(--color-border);
    }

    .name {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .email {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .item {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: start;
      background: none;
      border: none;
      padding: var(--space-3) var(--space-4);
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
      text-decoration: none;
    }

    .item:hover {
      background: var(--color-surface-subtle);
    }

    .item:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .item.sign-out {
      color: var(--color-text-muted);
    }

    .guest-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
  `,
})
export class AccountMenuComponent {
  protected readonly auth = inject(AuthService);
  protected readonly open = signal(false);

  protected initials(): string {
    const name = this.auth.currentUser()?.displayName ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  signOut(): void {
    this.auth.logout();
  }
}
