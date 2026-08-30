import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HeroComponent } from './components/hero/hero.component';
import { TrustBenefitsComponent } from './components/trust-benefits/trust-benefits.component';
import { FeaturedDestinationsComponent } from './components/featured-destinations/featured-destinations.component';
import { FeaturedHotelsComponent } from './components/featured-hotels/featured-hotels.component';
import { FeaturedVoyagesComponent } from './components/featured-voyages/featured-voyages.component';
import { FeaturedCircuitsComponent } from './components/featured-circuits/featured-circuits.component';
import { PromotionComponent } from './components/promotion/promotion.component';
import { TravelInspirationComponent } from './components/travel-inspiration/travel-inspiration.component';
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
    FeaturedHotelsComponent,
    FeaturedVoyagesComponent,
    FeaturedCircuitsComponent,
    PromotionComponent,
    TravelInspirationComponent,
    SupportTrustComponent,
  ],
  template: `
    <app-hero />
    <app-trust-benefits />
    <app-featured-destinations />
    <app-featured-hotels />
    <app-featured-voyages />
    <app-featured-circuits />
    <app-promotion />
    <app-travel-inspiration />
    <app-support-trust />
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
