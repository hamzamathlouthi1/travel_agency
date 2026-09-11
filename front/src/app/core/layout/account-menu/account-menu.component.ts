import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DropdownComponent } from '../../../shared/ui/dropdown/dropdown.component';
import { AuthService } from '../../auth/services/auth.service';

// Renders one of two states depending on AuthService.isAuthenticated():
// sign-in/create-account buttons, or an avatar dropdown with account links.
@Component({
  selector: 'app-account-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DropdownComponent],
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
        <a routerLink="/login" class="auth-button login">Login</a>
        <a routerLink="/register" class="auth-button register">
          Register
          <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8h9M9 4.5 12.5 8 9 11.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
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
      gap: var(--space-3);
    }

    .auth-button {
      min-height: 40px;
      padding: 0 var(--space-4);
      border: 1px solid transparent;
      border-radius: var(--radius-pill);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      color: var(--color-ink-950);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      line-height: 1;
      text-decoration: none;
      transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .auth-button:hover { text-decoration: none; transform: translateY(-1px); }

    .login {
      background: transparent;
      border-color: var(--color-border-strong);
    }

    .login:hover {
      background: var(--color-surface-subtle);
      border-color: var(--color-ink-500);
    }

    .register {
      padding-inline: var(--space-5);
      background: var(--color-amber-500);
      box-shadow: 0 5px 14px color-mix(in srgb, var(--color-amber-600) 24%, transparent);
    }

    .register:hover {
      background: var(--color-amber-400);
      box-shadow: 0 7px 18px color-mix(in srgb, var(--color-amber-600) 32%, transparent);
    }

    @media (max-width: 479px) {
      .guest-actions { gap: var(--space-2); }
      .auth-button { min-height: 36px; padding-inline: var(--space-3); }
      .register { padding-inline: var(--space-3); }
      .register svg { display: none; }
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
