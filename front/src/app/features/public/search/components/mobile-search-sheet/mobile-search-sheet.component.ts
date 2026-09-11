import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconButtonComponent } from '../../../../../shared/ui/icon-button/icon-button.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { RoomSelectorComponent } from '../room-selector/room-selector.component';
import { SearchStateService } from '../../services/search-state.service';
import { DESTINATION_PROVIDER } from '../../services/destination-provider';
import { Destination, destinationLabel } from '../../models/destination';
import { totalTravellers } from '../../models/hotel-search';
import { PlatformService } from '../../../../../core/services/platform.service';
import { trapFocus } from '../../../../../shared/utils/focus-trap.util';
import { lockBodyScroll } from '../../../../../shared/utils/body-scroll-lock.util';
import {
  CalendarDay,
  MONTH_LABELS,
  WEEKDAY_LABELS,
  addMonths,
  monthMatrix,
  nightsBetween,
} from '../../utils/calendar.util';

type Step = 'destination' | 'dates' | 'travellers';

// Faithful mobile implementation of the approved step flow:
// trigger -> destination -> dates -> travellers -> search, each its own
// full-screen step with back navigation — never a shrunk desktop bar.
@Component({
  selector: 'app-mobile-search-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconButtonComponent, ButtonComponent, RoomSelectorComponent],
  template: `
    <div #sheet class="sheet" role="dialog" aria-modal="true" aria-label="Search hotels" tabindex="-1">
      <div class="sheet-header">
        <app-icon-button ariaLabel="Back" (click)="back()">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" /></svg>
        </app-icon-button>
        <span class="title">{{ stepTitle() }}</span>
        <app-icon-button ariaLabel="Close search" (click)="requestClose.emit()">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" fill="none" /></svg>
        </app-icon-button>
      </div>

      <div class="sheet-body">
        @switch (step()) {
          @case ('destination') {
            <input
              type="text"
              class="query"
              placeholder="Search destinations"
              [value]="query()"
              (input)="onQueryInput($any($event.target).value)"
              aria-label="Search destinations"
            />
            @if (query().length === 0) {
              @if (recent().length) {
                <p class="section-label">Recent searches</p>
                @for (d of recent(); track d.id) {
                  <button type="button" class="option" (click)="pickDestination(d)">{{ destinationLabel(d) }}</button>
                }
              }
              <p class="section-label">Popular destinations</p>
              @for (d of popular(); track d.id) {
                <button type="button" class="option" (click)="pickDestination(d)">{{ destinationLabel(d) }}</button>
              }
            } @else {
              @for (d of matches(); track d.id) {
                <button type="button" class="option" (click)="pickDestination(d)">{{ destinationLabel(d) }}</button>
              }
            }
          }
          @case ('dates') {
            <div class="date-fields">
              <div class="date-chip" [class.active]="pickingCheckIn()">
                <span class="k">Check-in</span>
                <span class="v">{{ checkIn() ?? 'Select' }}</span>
              </div>
              <div class="date-chip" [class.active]="!pickingCheckIn()">
                <span class="k">Check-out</span>
                <span class="v">{{ checkOut() ?? 'Select' }}</span>
              </div>
            </div>
            <div class="month-header">
              <app-icon-button ariaLabel="Previous month" variant="subtle" (click)="shiftMonth(-1)">
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" /></svg>
              </app-icon-button>
              <span class="month-label">{{ monthLabel() }}</span>
              <app-icon-button ariaLabel="Next month" variant="subtle" (click)="shiftMonth(1)">
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" /></svg>
              </app-icon-button>
            </div>
            <div class="grid weekdays">
              @for (label of weekdayLabels; track label) { <span>{{ label }}</span> }
            </div>
            <div class="grid">
              @for (day of days(); track day.iso) {
                <button
                  type="button"
                  class="day"
                  [class.dim]="!day.inCurrentMonth"
                  [class.in-range]="isInRange(day.iso)"
                  [class.range-edge]="day.iso === checkIn() || day.iso === checkOut()"
                  [disabled]="day.isPast"
                  (click)="selectDay(day)"
                >
                  {{ day.dayOfMonth }}
                </button>
              }
            </div>
            <p class="nights">{{ nightsLabel() }}</p>
          }
          @case ('travellers') {
            @for (room of searchState.hotel().rooms; track $index) {
              <app-room-selector
                [index]="$index"
                [room]="room"
                [canRemove]="searchState.hotel().rooms.length > 1"
                (patch)="searchState.updateRoom($index, $event)"
                (remove)="searchState.removeRoom($index)"
              />
            }
            <button type="button" class="add-room" (click)="searchState.addRoom()">+ Add another room</button>
          }
        }
      </div>

      <div class="sheet-footer">
        <app-button fullWidth size="lg" [disabled]="!canContinue()" (click)="continue()">
          {{ continueLabel() }}
        </app-button>
      </div>
    </div>
  `,
  styles: `
    .sheet {
      position: fixed;
      inset: 0;
      z-index: var(--z-modal);
      background: var(--color-surface);
      display: flex;
      flex-direction: column;
    }

    .sheet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-block-end: 1px solid var(--color-border);
    }

    .title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-md);
    }

    .sheet-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-4);
    }

    .sheet-footer {
      padding: var(--space-4);
      border-block-start: 1px solid var(--color-border);
    }

    .query {
      width: 100%;
      box-sizing: border-box;
      font-size: var(--font-size-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      margin-block-end: var(--space-4);
      min-height: 44px;
    }

    .section-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin: var(--space-4) 0 var(--space-2);
    }

    .option {
      display: block;
      width: 100%;
      text-align: start;
      background: none;
      border: none;
      padding: var(--space-3) var(--space-1);
      font-size: var(--font-size-md);
      min-height: 44px;
      cursor: pointer;
    }

    .date-fields {
      display: flex;
      gap: var(--space-3);
      margin-block-end: var(--space-5);
    }

    .date-chip {
      flex: 1;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
    }

    .date-chip.active {
      border-color: var(--color-ink-950);
      border-width: var(--border-width-md);
    }

    .k {
      display: block;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
    }

    .v {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .month-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: var(--space-3);
    }

    .month-label {
      font-weight: var(--font-weight-bold);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 2px;
      text-align: center;
    }

    .weekdays span {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      padding-block: var(--space-1);
    }

    .day {
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      min-height: 44px;
      cursor: pointer;
    }

    .day:disabled {
      color: var(--color-ink-300);
    }

    .day.dim {
      color: var(--color-ink-300);
    }

    .day.in-range {
      background: var(--color-teal-100);
    }

    .day.range-edge {
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      font-weight: var(--font-weight-bold);
    }

    .nights {
      margin-block-start: var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .add-room {
      background: none;
      border: none;
      color: var(--color-teal-600);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      padding: var(--space-3) 0;
    }
  `,
})
export class MobileSearchSheetComponent {
  protected readonly searchState = inject(SearchStateService);
  private readonly provider = inject(DESTINATION_PROVIDER);
  private readonly platform = inject(PlatformService);
  private readonly document = inject(DOCUMENT);
  private readonly sheetRef = viewChild<{ nativeElement: HTMLElement }>('sheet');

  readonly requestClose = output<void>();
  readonly searchSubmitted = output<void>();

  // This component only ever exists while the sheet is open (the parent
  // mounts/destroys it), so setup runs once the element is available and
  // tears down on destroy — no separate `open` input to react to.
  private readonly manageOverlay = effect((onCleanup) => {
    if (!this.platform.isBrowser) return;
    const sheet = this.sheetRef()?.nativeElement;
    if (!sheet) return;

    const unlockScroll = lockBodyScroll(this.document);
    const previouslyFocused = this.document.activeElement as HTMLElement | null;
    const untrap = trapFocus(sheet, previouslyFocused);

    onCleanup(() => {
      unlockScroll();
      untrap();
    });
  });

  protected readonly step = signal<Step>('destination');
  protected readonly query = signal('');
  protected readonly recent = toSignal(this.provider.recent(), { initialValue: [] });
  protected readonly popular = toSignal(this.provider.popular(), { initialValue: [] });
  protected readonly matches = signal<readonly Destination[]>([]);
  protected readonly destinationLabel = destinationLabel;

  private readonly today = new Date();
  private readonly viewYear = signal(this.today.getFullYear());
  private readonly viewMonth = signal(this.today.getMonth());
  protected readonly pickingCheckIn = computed(
    () => !this.searchState.hotel().checkIn || !!this.searchState.hotel().checkOut,
  );
  protected readonly checkIn = computed(() => this.searchState.hotel().checkIn);
  protected readonly checkOut = computed(() => this.searchState.hotel().checkOut);

  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly monthLabel = computed(
    () => `${MONTH_LABELS[this.viewMonth()]} ${this.viewYear()}`,
  );
  protected readonly days = computed(() => monthMatrix(this.viewYear(), this.viewMonth(), this.today));
  protected readonly nightsLabel = computed(() => {
    const inDate = this.checkIn();
    const outDate = this.checkOut();
    if (!inDate || !outDate) return 'Select your dates';
    const nights = nightsBetween(inDate, outDate);
    return nights === 1 ? '1 night selected' : `${nights} nights selected`;
  });

  protected readonly stepTitle = computed(() => {
    switch (this.step()) {
      case 'destination':
        return 'Where to?';
      case 'dates':
        return 'Select dates';
      case 'travellers':
        return 'Travellers & rooms';
    }
  });

  protected readonly canContinue = computed(() => {
    switch (this.step()) {
      case 'destination':
        return !!this.searchState.hotel().destination;
      case 'dates':
        return !!this.checkIn() && !!this.checkOut();
      case 'travellers':
        return totalTravellers(this.searchState.hotel().rooms) > 0;
    }
  });

  protected readonly continueLabel = computed(() =>
    this.step() === 'travellers' ? 'Search hotels' : 'Continue',
  );

  onQueryInput(value: string): void {
    this.query.set(value);
    this.provider.search(value).subscribe((results) => this.matches.set(results));
  }

  pickDestination(destination: Destination): void {
    this.searchState.setHotelDestination(destinationLabel(destination));
    this.step.set('dates');
  }

  shiftMonth(delta: number): void {
    const { year, month } = addMonths(this.viewYear(), this.viewMonth(), delta);
    this.viewYear.set(year);
    this.viewMonth.set(month);
  }

  selectDay(day: CalendarDay): void {
    if (day.isPast) return;
    const inDate = this.checkIn();
    const outDate = this.checkOut();

    if (!inDate || (inDate && outDate)) {
      this.searchState.setHotelDates(day.iso, null);
      return;
    }
    if (day.iso <= inDate) {
      this.searchState.setHotelDates(day.iso, null);
      return;
    }
    this.searchState.setHotelDates(inDate, day.iso);
  }

  isInRange(iso: string): boolean {
    const inDate = this.checkIn();
    const outDate = this.checkOut();
    if (!inDate || !outDate) return false;
    return iso > inDate && iso < outDate;
  }

  back(): void {
    if (this.step() === 'dates') this.step.set('destination');
    else if (this.step() === 'travellers') this.step.set('dates');
    else this.requestClose.emit();
  }

  continue(): void {
    if (this.step() === 'destination') this.step.set('dates');
    else if (this.step() === 'dates') this.step.set('travellers');
    else this.searchSubmitted.emit();
  }
}
