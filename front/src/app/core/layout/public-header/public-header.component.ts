import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DropdownComponent } from '../../../shared/ui/dropdown/dropdown.component';
import { IconButtonComponent } from '../../../shared/ui/icon-button/icon-button.component';
import { AccountMenuComponent } from '../account-menu/account-menu.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';

const SCROLL_COMPRESS_THRESHOLD = 24;

// Global public header. Desktop shows full nav + language/currency +
// account + B2B access; mobile collapses nav into a hamburger that opens
// the bottom-sheet MobileNavigationComponent. `window:scroll` is listened
// through Angular's DomEventsPlugin (resolved via the injected DOCUMENT),
// which is SSR-safe — the listener is simply never invoked during render.
@Component({
  selector: 'app-public-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    DropdownComponent,
    IconButtonComponent,
    AccountMenuComponent,
    MobileNavigationComponent,
  ],
  template: `
    <header class="header" [class.scrolled]="scrolled()">
      <div class="container bar">
        <div class="left">
          <a routerLink="/" class="brand">Meridian</a>
          <nav class="nav" aria-label="Primary">
            <a routerLink="/hotels" routerLinkActive="active">Hotels</a>
            <a routerLink="/voyages" routerLinkActive="active">Voyages</a>
            <a routerLink="/circuits" routerLinkActive="active">Circuits</a>
            <a routerLink="/offers" routerLinkActive="active">Offers</a>
          </nav>
        </div>

        <div class="right">
          <app-dropdown [(open)]="localeOpen" class="locale">
            <button dropdownTrigger type="button" class="locale-trigger" [attr.aria-expanded]="localeOpen()">
              EN / TND
            </button>
            <div dropdownPanel class="locale-panel">
              <p class="section-label">Language</p>
              <button type="button" class="locale-option">English</button>
              <button type="button" class="locale-option">Fran&ccedil;ais</button>
              <p class="section-label">Currency</p>
              <button type="button" class="locale-option">TND &mdash; Tunisian Dinar</button>
              <button type="button" class="locale-option">EUR &mdash; Euro</button>
            </div>
          </app-dropdown>

          <a routerLink="/b2b/login" class="professional">For travel professionals</a>

          <app-account-menu />

          <app-icon-button
            class="menu-toggle"
            ariaLabel="Open menu"
            [ariaExpanded]="mobileNavOpen()"
            (click)="mobileNavOpen.set(true)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" fill="none" />
            </svg>
          </app-icon-button>
        </div>
      </div>
    </header>

    <app-mobile-navigation [open]="mobileNavOpen()" (requestClose)="mobileNavOpen.set(false)" />
  `,
  styles: `
    .header {
      position: sticky;
      inset-block-start: 0;
      z-index: var(--z-sticky);
      background: var(--color-surface);
      border-block-end: 1px solid var(--color-border);
      transition: box-shadow var(--transition-base);
    }

    .header.scrolled {
      box-shadow: var(--shadow-md);
    }

    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-block: var(--space-5);
      transition: padding-block var(--transition-base);
    }

    .header.scrolled .bar {
      padding-block: var(--space-3);
    }

    .left {
      display: flex;
      align-items: center;
      gap: var(--space-10);
      min-width: 0;
    }

    .brand {
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: 0.02em;
      font-size: var(--font-size-lg);
      color: var(--color-ink-950);
      text-decoration: none;
      flex-shrink: 0;
    }

    .nav {
      display: none;
      gap: var(--space-7);
    }

    .nav a {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-muted);
      text-decoration: none;
      padding-block: var(--space-1);
      border-block-end: 2px solid transparent;
    }

    .nav a.active {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-bold);
    }

    .nav a:hover {
      color: var(--color-text-primary);
    }

    .right {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .locale-trigger {
      background: none;
      border: none;
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: var(--space-2);
      display: none;
    }

    .locale-panel {
      inline-size: 220px;
      padding: var(--space-2);
    }

    .section-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin: var(--space-3) var(--space-2) var(--space-1);
    }

    .locale-option {
      display: block;
      width: 100%;
      text-align: start;
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      padding: var(--space-2);
      font-size: var(--font-size-sm);
      cursor: pointer;
    }

    .locale-option:hover {
      background: var(--color-surface-subtle);
    }

    .professional {
      display: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
      color: var(--color-teal-600);
      text-decoration: none;
      white-space: nowrap;
    }

    .menu-toggle {
      display: inline-flex;
    }

    @media (min-width: 1024px) {
      .nav {
        display: flex;
      }
      .locale-trigger {
        display: inline-flex;
      }
      .professional {
        display: inline-block;
      }
      .menu-toggle {
        display: none;
      }
    }
  `,
})
export class PublicHeaderComponent {
  protected readonly scrolled = signal(false);
  protected readonly localeOpen = signal(false);
  protected readonly mobileNavOpen = signal(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled.set(window.scrollY > SCROLL_COMPRESS_THRESHOLD);
  }
}
