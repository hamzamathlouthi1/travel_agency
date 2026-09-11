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
          <a routerLink="/" class="brand" aria-label="Meridian home">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32"><path d="M16 3 28 16 16 29 4 16 16 3Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m16 8 4 8-4 8-4-8 4-8Z" fill="currentColor"/></svg>
            </span>
            <span class="brand-copy">Wanderly<small>TRAVEL THE WORLD</small></span>
          </a>
          <nav class="nav" aria-label="Primary">
            <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="active">Home</a>
            <a routerLink="/hotels" routerLinkActive="active">Destinations</a>
            <a routerLink="/voyages" routerLinkActive="active">Tours</a>
            <a routerLink="/circuits" routerLinkActive="active">Flights</a>
            <a routerLink="/hotels" routerLinkActive="active">Hotels</a>
            <a routerLink="/offers" routerLinkActive="active">About Us</a>
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

          <a href="tel:+2165678900" class="professional">Need Help?<strong>+1 234 567 8900</strong></a>

          <span class="divider" aria-hidden="true"></span>

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
      background: color-mix(in srgb, var(--color-surface) 94%, transparent);
      border-block-end: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
      backdrop-filter: blur(14px);
      transition: box-shadow var(--transition-base), background var(--transition-base);
    }

    .header.scrolled {
      box-shadow: var(--shadow-md);
    }

    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 72px;
      padding-block: var(--space-3);
      transition: padding-block var(--transition-base);
    }

    .header.scrolled .bar {
      padding-block: var(--space-3);
    }

    .left {
      display: flex;
      align-items: center;
      gap: var(--space-12);
      min-width: 0;
    }

    .brand {
      font-family: var(--font-family-display);
      font-weight: var(--font-weight-extrabold);
      letter-spacing: 0.02em;
      font-size: var(--font-size-lg);
      color: #0a3154;
      text-decoration: none;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .brand:hover { text-decoration: none; }
    .brand-mark { display: grid; place-items: center; width: 32px; height: 32px; color: #1388dd; animation: compass-pulse 4s ease-in-out infinite; }
    .brand-mark svg { width: 100%; height: 100%; }
    .brand-copy { display: grid; font-style: italic; line-height: .9; }
    .brand-copy small { margin-top: 6px; font-family: var(--font-family-base); font-size: 7px; font-style: normal; font-weight: 700; letter-spacing: .12em; color: #6f879b; }
    @keyframes compass-pulse { 50% { transform: rotate(8deg) scale(1.05); } }

    .nav {
      display: none;
      gap: var(--space-6);
    }

    .nav a {
      font-size: 12px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-muted);
      text-decoration: none;
      position: relative;
      padding-block: var(--space-3);
    }

    .nav a.active {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-bold);
    }

    .nav a::after {
      content: '';
      position: absolute;
      inset: auto 0 4px;
      height: 2px;
      border-radius: 2px;
      background: #1186df;
      transform: scaleX(0);
      transition: transform var(--transition-fast);
    }

    .nav a:hover::after, .nav a.active::after { transform: scaleX(1); }

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
      font-weight: var(--font-weight-semibold);
      color: var(--color-teal-600);
      text-decoration: none;
      white-space: nowrap;
      padding-left: 44px;
      position: relative;
    }

    .professional::before { content: '☎'; position: absolute; left: 0; top: 50%; translate: 0 -50%; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: #e7f5ff; color: #0873d1; font-size: 16px; }
    .professional strong { display: block; color: #0a3154; font-size: 11px; }

    .professional:hover {
      text-decoration: underline;
    }

    .divider {
      display: none;
      inline-size: 1px;
      block-size: 24px;
      background: var(--color-border);
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
      .divider {
        display: inline-block;
      }
      .menu-toggle {
        display: none;
      }
    }

    @media (max-width: 479px) {
      .bar { min-height: 68px; }
      .brand { font-size: var(--font-size-md); }
      .brand-mark { width: 28px; height: 28px; }
      .right { gap: var(--space-2); }
    }
    @media (prefers-reduced-motion: reduce) { .brand-mark { animation: none; } }
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
