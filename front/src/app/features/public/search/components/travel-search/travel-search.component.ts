import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SearchTabsComponent } from '../search-tabs/search-tabs.component';
import { DestinationFieldComponent } from '../destination-field/destination-field.component';
import { DateRangeFieldComponent, DateRange } from '../date-range-field/date-range-field.component';
import { TravellersFieldComponent } from '../travellers-field/travellers-field.component';
import { MobileSearchSheetComponent } from '../mobile-search-sheet/mobile-search-sheet.component';
import { FieldTextComponent } from '../field-text/field-text.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { SearchStateService } from '../../services/search-state.service';

// The single travel search shell — one shared tab strip + field chrome
// across Hotels/Voyages/Circuits, only the field set inside changes per
// mode. Desktop renders the horizontal bar; mobile renders a collapsed
// trigger that opens the full-screen step flow (CSS-driven visibility, not
// a JS matchMedia branch, so server and client render identically).
@Component({
  selector: 'app-travel-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SearchStateService],
  imports: [
    SearchTabsComponent,
    DestinationFieldComponent,
    DateRangeFieldComponent,
    TravellersFieldComponent,
    MobileSearchSheetComponent,
    FieldTextComponent,
    ButtonComponent,
  ],
  template: `
    <div class="travel-search">
      <app-search-tabs [active]="searchState.mode()" (modeChange)="searchState.setMode($event)" />

      <!-- Desktop / tablet horizontal bar -->
      <div class="bar desktop-bar">
        @switch (searchState.mode()) {
          @case ('HOTELS') {
            <app-destination-field
              [value]="searchState.hotel().destination"
              (valueChange)="searchState.setHotelDestination($event)"
            />
            <span class="divider"></span>
            <app-date-range-field (rangeApplied)="onRangeApplied($event)" />
            <span class="divider"></span>
            <app-travellers-field />
            <div class="cta">
              <app-button
                variant="cta"
                size="lg"
                [loading]="searching()"
                [disabled]="!searchState.isHotelSearchValid()"
                (click)="submit()"
              >
                Search hotels
              </app-button>
            </div>
          }
          @case ('VOYAGES') {
            <app-field-text
              label="Departing from"
              placeholder="Tunis, Tunisia"
              [value]="searchState.voyage().departureCity"
              (valueChange)="searchState.patchVoyage({ departureCity: $event })"
            />
            <span class="divider"></span>
            <app-field-text
              label="Going to"
              placeholder="Any destination"
              [value]="searchState.voyage().destination"
              (valueChange)="searchState.patchVoyage({ destination: $event })"
            />
            <span class="divider"></span>
            <app-field-text
              label="Travel month"
              placeholder="Any time"
              [value]="searchState.voyage().travelPeriod"
              (valueChange)="searchState.patchVoyage({ travelPeriod: $event })"
            />
            <div class="cta">
              <app-button
                variant="cta"
                size="lg"
                [disabled]="!searchState.isVoyageSearchValid()"
                (click)="submit()"
              >
                Search voyages
              </app-button>
            </div>
          }
          @case ('CIRCUITS') {
            <app-field-text
              label="Region"
              placeholder="Any region"
              [value]="searchState.circuit().region"
              (valueChange)="searchState.patchCircuit({ region: $event })"
            />
            <span class="divider"></span>
            <app-field-text
              label="Duration"
              placeholder="Any length"
              [value]="searchState.circuit().duration"
              (valueChange)="searchState.patchCircuit({ duration: $event })"
            />
            <span class="divider"></span>
            <app-field-text
              label="Departure window"
              placeholder="Any date"
              [value]="searchState.circuit().departureWindow"
              (valueChange)="searchState.patchCircuit({ departureWindow: $event })"
            />
            <div class="cta">
              <app-button
                variant="cta"
                size="lg"
                [disabled]="!searchState.isCircuitSearchValid()"
                (click)="submit()"
              >
                Search circuits
              </app-button>
            </div>
          }
        }
      </div>

      <!-- Mobile collapsed trigger -->
      <button type="button" class="mobile-trigger" (click)="mobileSheetOpen.set(true)">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none" /><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="2" /></svg>
        <span>
          <span class="trigger-title">{{ mobileTriggerTitle() }}</span>
          <span class="trigger-subtitle">{{ mobileTriggerSubtitle() }}</span>
        </span>
      </button>
    </div>

    @if (mobileSheetOpen()) {
      <app-mobile-search-sheet
        (requestClose)="mobileSheetOpen.set(false)"
        (searchSubmitted)="onMobileSubmit()"
      />
    }
  `,
  styles: `
    .travel-search {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .bar {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: stretch;
    }

    .divider {
      width: 1px;
      background: var(--color-border);
      margin-block: var(--space-3);
    }

    .cta {
      padding: var(--space-3);
      display: flex;
      align-items: center;
    }

    .desktop-bar {
      display: none;
    }

    .mobile-trigger {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      box-sizing: border-box;
      background: var(--color-surface);
      border: 1.5px solid var(--color-ink-950);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      box-shadow: var(--shadow-md);
      cursor: pointer;
      text-align: start;
      color: var(--color-ink-950);
    }

    .mobile-trigger:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .trigger-title {
      display: block;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-md);
    }

    .trigger-subtitle {
      display: block;
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    @media (min-width: 768px) {
      .desktop-bar {
        display: flex;
      }
      .mobile-trigger {
        display: none;
      }
    }

    @media (min-width: 768px) and (max-width: 1023px) {
      .bar {
        flex-wrap: wrap;
      }
      .cta {
        width: 100%;
      }
      .cta app-button {
        width: 100%;
      }
    }
  `,
})
export class TravelSearchComponent {
  protected readonly searchState = inject(SearchStateService);
  private readonly router = inject(Router);

  protected readonly mobileSheetOpen = signal(false);
  protected readonly searching = signal(false);

  protected readonly mobileTriggerTitle = () => {
    const destination = this.searchState.hotel().destination;
    return destination || 'Where to?';
  };

  protected readonly mobileTriggerSubtitle = () => {
    const { checkIn, checkOut, rooms } = this.searchState.hotel();
    const dates = checkIn && checkOut ? `${checkIn} — ${checkOut}` : 'Any week';
    return `${dates} · ${rooms.length === 1 ? '1 room' : `${rooms.length} rooms`}`;
  };

  onRangeApplied(range: DateRange): void {
    this.searchState.setHotelDates(range.checkIn, range.checkOut);
  }

  submit(): void {
    const mode = this.searchState.mode();
    this.searching.set(true);
    setTimeout(() => {
      this.searching.set(false);
      if (mode === 'HOTELS') {
        void this.router.navigate(['/hotels'], { queryParams: this.hotelQueryParams() });
      } else if (mode === 'VOYAGES') {
        void this.router.navigate(['/voyages']);
      } else {
        void this.router.navigate(['/circuits']);
      }
    }, 400);
  }

  onMobileSubmit(): void {
    this.mobileSheetOpen.set(false);
    void this.router.navigate(['/hotels'], { queryParams: this.hotelQueryParams() });
  }

  // Builds the /hotels URL contract (see hotels/utils/hotel-search-url.util.ts)
  // from the search bar's per-room state. Intentionally duplicated rather than
  // importing the Hotels feature's util here — Search and Hotels stay
  // decoupled; both sides just agree on the same small set of param names.
  private hotelQueryParams(): Record<string, string> {
    const { destination, checkIn, checkOut, rooms } = this.searchState.hotel();
    const adults = rooms.reduce((sum, room) => sum + room.adults, 0);
    const children = rooms.reduce((sum, room) => sum + room.children, 0);
    const params: Record<string, string> = { destination, rooms: String(rooms.length) };
    if (checkIn) params['checkIn'] = checkIn;
    if (checkOut) params['checkOut'] = checkOut;
    if (adults) params['adults'] = String(adults);
    if (children) params['children'] = String(children);
    return params;
  }
}
