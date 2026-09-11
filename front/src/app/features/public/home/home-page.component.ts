import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HeroComponent } from './components/hero/hero.component';
import { TrustBenefitsComponent } from './components/trust-benefits/trust-benefits.component';
import { FeaturedDestinationsComponent } from './components/featured-destinations/featured-destinations.component';
import { PromotionComponent } from './components/promotion/promotion.component';
import { SupportTrustComponent } from './components/support-trust/support-trust.component';

// Composes the nine approved homepage sections. Each section owns its own
// data fetch and template — this component only orders them and sets SEO
// metadata, it holds no business logic of its own.
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    TrustBenefitsComponent,
    FeaturedDestinationsComponent,
    PromotionComponent,
    SupportTrustComponent,
  ],
  template: `
    <app-hero />
    <app-trust-benefits />
    <app-featured-destinations />
    <app-support-trust />
    <app-promotion />
  `,
})
export class HomePageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.title.setTitle('Meridian Travel — Hotels, voyages & circuits worldwide');
    this.meta.updateTag({
      name: 'description',
      content:
        'Book hotels, voyages and circuits across 40+ countries with instant confirmation, transparent pricing and 24/7 support.',
    });
  }
}
