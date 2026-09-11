import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TravelSearchComponent } from '../../../search/components/travel-search/travel-search.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TravelSearchComponent, RouterLink],
  template: `
    <section class="hero">
      <div class="container hero-inner">
        <div class="copy">
          <p class="eyebrow">✈ &nbsp; Explore. Dream. Discover.</p>
          <h1>Discover Amazing<br /><em>Places with Us</em></h1>
          <p>Find the best tours, hotels and flights — everything you need for the perfect trip.</p>
          <a routerLink="/voyages">Explore now <span>→</span></a>
        </div>
        <div class="search-wrap"><app-travel-search /></div>
      </div>
      <span class="float float-one" aria-hidden="true">✦</span>
      <span class="float float-two" aria-hidden="true">✈</span>
    </section>
  `,
  styles: `
    .hero { position: relative; min-height: 550px; isolation: isolate; background: #dff3ff url('/images/home/sidi-bou-said-street.jpg') 68% 48% / cover no-repeat; }
    .hero::before { content: ''; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(241,250,255,.98) 0%, rgba(228,246,255,.91) 35%, rgba(221,243,255,.18) 68%, transparent 100%); }
    .hero-inner { min-height: 550px; position: relative; padding-top: 80px; }
    .copy { width: min(560px, 49%); animation: reveal .75s cubic-bezier(.2,.75,.2,1) both; }
    .eyebrow { width: fit-content; margin: 0 0 18px; color: #315d7c; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 0; color: #082b4d; font-family: var(--font-family-base); font-size: clamp(42px, 5vw, 68px); font-weight: 800; line-height: .92; letter-spacing: -.055em; }
    h1 em { display: inline-block; color: #0873d1; font-family: var(--font-family-display); font-weight: 500; animation: script-in .9s .2s both; }
    .copy > p:not(.eyebrow) { max-width: 44ch; margin: 20px 0 24px; color: #516b80; font-size: 14px; line-height: 1.6; }
    .copy a { min-height: 46px; padding: 0 22px; display: inline-flex; align-items: center; gap: 20px; border-radius: 10px; background: #0873d1; color: white; font-size: 13px; font-weight: 800; text-decoration: none; box-shadow: 0 12px 28px rgba(8,115,209,.27); transition: translate .2s, box-shadow .2s; }
    .copy a:hover { translate: 0 -3px; box-shadow: 0 16px 32px rgba(8,115,209,.36); }
    .search-wrap { position: absolute; z-index: 3; left: var(--space-4); right: var(--space-4); bottom: -62px; padding: 18px; border: 1px solid rgba(255,255,255,.9); border-radius: 18px; background: rgba(255,255,255,.92); box-shadow: 0 18px 45px rgba(18,74,119,.16); backdrop-filter: blur(18px); animation: rise .7s .2s both; }
    .float { position: absolute; color: rgba(8,115,209,.35); animation: drift 4s ease-in-out infinite; }
    .float-one { left: 8%; top: 28%; }.float-two { right: 9%; top: 20%; animation-delay: -2s; }
    @keyframes reveal { from { opacity: 0; transform: translateY(20px); } }
    @keyframes script-in { from { opacity: 0; transform: translateX(-16px); } }
    @keyframes rise { from { opacity: 0; transform: translateY(25px); } }
    @keyframes drift { 50% { transform: translateY(-10px) rotate(8deg); } }
    @media (min-width: 768px) { .search-wrap { left: var(--space-6); right: var(--space-6); } }
    @media (max-width: 767px) { .hero { min-height: 630px; background-position: 61% center; } .hero::before { background: linear-gradient(90deg, rgba(240,250,255,.96), rgba(231,247,255,.77) 68%, rgba(231,247,255,.2)); } .hero-inner { min-height: 630px; padding-top: 56px; } .copy { width: 100%; } h1 { font-size: 43px; } .search-wrap { bottom: -44px; padding: 12px; } }
    @media (prefers-reduced-motion: reduce) { .copy, h1 em, .search-wrap, .float { animation: none; } }
  `,
})
export class HeroComponent {}
