import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container top">
        <div class="brand-col">
          <div class="brand">Meridian</div>
          <p class="tagline">
            Hotels, voyages and circuits booked with confidence, in your language and currency.
          </p>
          <div class="social" aria-label="Social links">
            <span class="social-dot" aria-hidden="true"></span>
            <span class="social-dot" aria-hidden="true"></span>
            <span class="social-dot" aria-hidden="true"></span>
          </div>
        </div>

        <div class="col">
          <p class="col-title">Travel</p>
          <a routerLink="/hotels">Hotels</a>
          <a routerLink="/voyages">Voyages</a>
          <a routerLink="/circuits">Circuits</a>
          <a routerLink="/offers">Offers</a>
        </div>

        <div class="col">
          <p class="col-title">Destinations</p>
          <a routerLink="/hotels">Istanbul</a>
          <a routerLink="/hotels">Dubai</a>
          <a routerLink="/hotels">Marrakech</a>
          <a routerLink="/hotels">Paris</a>
        </div>

        <div class="col">
          <p class="col-title">Support</p>
          <a routerLink="/">Help center</a>
          <a routerLink="/">Cancellation policy</a>
          <a routerLink="/">Contact us</a>
        </div>

        <div class="col">
          <p class="col-title">Company &amp; legal</p>
          <a routerLink="/">About</a>
          <a routerLink="/">Privacy policy</a>
          <a routerLink="/">Terms of service</a>
        </div>

        <div class="col">
          <p class="col-title">For professionals</p>
          <a routerLink="/b2b/login" class="pro-link">Meridian for Travel Professionals &rarr;</a>
        </div>
      </div>

      <div class="container bottom">
        <span>&copy; {{ year }} Meridian Travel. All rights reserved.</span>
        <span class="locale">English (US) &middot; TND</span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: linear-gradient(135deg, #052d51, #0873d1);
      color: var(--color-paper-100);
    }

    .top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      padding-block: var(--space-12) var(--space-8);
      border-block-end: 1px solid rgba(255, 255, 255, 0.12);
    }

    .brand {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-lg);
      color: #fff;
      margin-block-end: var(--space-2);
    }

    .tagline {
      font-size: var(--font-size-sm);
      color: oklch(75% 0.01 255);
      line-height: var(--line-height-relaxed);
      max-width: 26ch;
      margin: 0 0 var(--space-4);
    }

    .social {
      display: flex;
      gap: var(--space-2);
    }

    .social-dot {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }

    .col-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: oklch(70% 0.01 255);
      margin: 0 0 var(--space-3);
    }

    .col {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .col a {
      font-size: var(--font-size-sm);
      color: oklch(85% 0.006 255);
      text-decoration: none;
    }

    .col a:hover {
      color: #fff;
      text-decoration: underline;
    }

    .pro-link {
      color: var(--color-amber-500) !important;
      font-weight: var(--font-weight-bold);
    }

    .bottom {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: space-between;
      align-items: center;
      padding-block: var(--space-5);
      font-size: var(--font-size-xs);
      color: oklch(65% 0.01 255);
    }

    .locale {
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--radius-sm);
      padding: var(--space-2) var(--space-3);
      color: oklch(90% 0.006 255);
    }

    @media (min-width: 768px) {
      .top {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .top {
        grid-template-columns: 1.3fr repeat(5, 1fr);
      }
    }
  `,
})
export class PublicFooterComponent {
  protected readonly year = new Date().getFullYear();
}
