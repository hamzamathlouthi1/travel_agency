import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { HotelDetailStore } from '../../state/hotel-detail.store';
import { HotelDetailHeaderComponent } from '../../components/hotel-detail-header/hotel-detail-header.component';
import { HotelGalleryComponent } from '../../components/hotel-gallery/hotel-gallery.component';
import { HotelOverviewComponent } from '../../components/hotel-overview/hotel-overview.component';
import { HotelAmenitiesComponent } from '../../components/hotel-amenities/hotel-amenities.component';
import { HotelLocationComponent } from '../../components/hotel-location/hotel-location.component';
import { SearchSummaryComponent } from '../../components/search-summary/search-summary.component';
import { RoomListComponent } from '../../components/room-list/room-list.component';
import { BookingSummaryPanelComponent } from '../../components/booking-summary-panel/booking-summary-panel.component';
import { HotelDetailSkeletonComponent } from '../../components/hotel-detail-skeleton/hotel-detail-skeleton.component';
import { HotelDetailErrorComponent } from '../../components/hotel-detail-error/hotel-detail-error.component';
import { HotelUnavailableComponent } from '../../components/hotel-unavailable/hotel-unavailable.component';

// Orchestrates only: reads HotelDetailStore, wires child components, sets
// SEO metadata. Fetching, room/rate selection and verification logic all
// live in the store — this component holds no business logic of its own.
@Component({
  selector: 'app-hotel-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HotelDetailStore],
  imports: [
    RouterLink,
    HotelDetailHeaderComponent,
    HotelGalleryComponent,
    HotelOverviewComponent,
    HotelAmenitiesComponent,
    HotelLocationComponent,
    SearchSummaryComponent,
    RoomListComponent,
    BookingSummaryPanelComponent,
    HotelDetailSkeletonComponent,
    HotelDetailErrorComponent,
    HotelUnavailableComponent,
  ],
  template: `
    <div class="container page">
      @if (store.error()) {
        <app-hotel-detail-error (retry)="store.retry()" />
      } @else if (store.loading()) {
        <app-hotel-detail-skeleton />
      } @else if (store.notFound()) {
        <app-hotel-unavailable reason="NOT_FOUND" />
      } @else if (!store.hasAnyAvailability()) {
        <app-hotel-unavailable reason="NO_AVAILABILITY" />
      } @else {
        @let hotel = store.hotel()!;
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a routerLink="/">Home</a> / <a routerLink="/hotels">Hotels</a> / {{ hotel.destination }} /
          <span aria-current="page">{{ hotel.name }}</span>
        </nav>

        <app-hotel-detail-header [hotel]="hotel" />
        <app-hotel-gallery [images]="hotel.images" [hotelName]="hotel.name" />

        <section class="quick-facts" aria-label="Stay information">
          <div><span class="fact-icon">↗</span><p><strong>Prime location</strong><small>{{ hotel.area }}, {{ hotel.destination }}</small></p></div>
          <div><span class="fact-icon">◷</span><p><strong>Check-in from {{ hotel.policies.checkInFrom }}</strong><small>Check-out until {{ hotel.policies.checkOutUntil }}</small></p></div>
          <div><span class="fact-icon">✓</span><p><strong>Best price promise</strong><small>Taxes and fees shown upfront</small></p></div>
          <div><span class="fact-icon">◇</span><p><strong>24/7 assistance</strong><small>English, French and Arabic</small></p></div>
        </section>

        <div class="layout">
          <div class="main">
            <app-hotel-overview [description]="hotel.description" />
            <app-hotel-amenities [amenities]="hotel.amenities" />
            <app-hotel-location [location]="hotel.location" />
            <app-search-summary [query]="store.searchContext()" />
            <app-room-list
              [rooms]="hotel.rooms"
              [nights]="store.nights()"
              [occupancyLabel]="occupancyLabel()"
              [selectedRoomId]="store.selectedRoom()?.id ?? null"
              [selectedRateId]="store.selectedRate()?.id ?? null"
              [soldOutRateIds]="store.soldOutRateIds()"
              (rateSelected)="store.selectRate($event.room, $event.rate)"
            />
          </div>

          <app-booking-summary-panel
            [hotel]="hotel"
            [room]="store.selectedRoom()"
            [rate]="store.selectedRate()"
            [checkIn]="store.searchContext().checkIn"
            [checkOut]="store.searchContext().checkOut"
            [occupancyLabel]="occupancyLabel()"
            [verifying]="store.verifying()"
            [verificationResult]="store.verificationResult()"
            (continueClicked)="store.verifyAndContinue()"
            (acceptPriceChange)="store.acceptPriceChange()"
            (retry)="store.retryVerification()"
            (seeOtherRates)="store.clearSelection()"
          />
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      padding-block: var(--space-5) var(--space-16);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .breadcrumb {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .breadcrumb a {
      color: var(--color-text-muted);
    }

    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-8);
      align-items: start;
    }

    .main {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
      min-width: 0;
    }

    .quick-facts { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; background: var(--color-surface); box-shadow: var(--shadow-sm); }
    .quick-facts > div { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); border-bottom: 1px solid var(--color-border); }
    .quick-facts p { display: grid; gap: 2px; margin: 0; }.quick-facts strong { font-size: var(--font-size-xs); }.quick-facts small { color: var(--color-text-muted); font-size: 11px; }
    .fact-icon { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 50%; color: var(--color-teal-600); background: var(--color-teal-100); font-weight: 900; }

    @media (min-width: 1024px) {
      .layout {
        grid-template-columns: 1fr 360px;
      }
      .quick-facts { grid-template-columns: repeat(4, minmax(0,1fr)); }
      .quick-facts > div { border-bottom: 0; border-right: 1px solid var(--color-border); }
      .quick-facts > div:last-child { border-right: 0; }
    }
    @media (max-width: 560px) { .quick-facts { grid-template-columns: 1fr; } }
  `,
})
export class HotelDetailPageComponent {
  protected readonly store = inject(HotelDetailStore);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly occupancyLabel = computed(() => {
    const { adults, children } = this.store.searchContext();
    const adultsLabel = `${adults} adult${adults === 1 ? '' : 's'}`;
    return children > 0 ? `${adultsLabel}, ${children} child${children === 1 ? '' : 'ren'}` : adultsLabel;
  });

  private readonly updateSeo = effect(() => {
    const hotel = this.store.hotel();
    if (!hotel) return;
    this.title.setTitle(`${hotel.name}, ${hotel.destination} — Meridian Travel`);
    this.meta.updateTag({
      name: 'description',
      content: `${hotel.name} in ${hotel.area}, ${hotel.destination} — ${hotel.starRating}-star hotel. ${hotel.description}`.slice(
        0,
        160,
      ),
    });
  });
}
