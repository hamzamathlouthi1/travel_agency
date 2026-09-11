import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { IconButtonComponent } from '../../../../../shared/ui/icon-button/icon-button.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import {
  CalendarDay,
  MONTH_LABELS,
  WEEKDAY_LABELS,
  addMonths,
  monthMatrix,
  nightsBetween,
} from '../../utils/calendar.util';

export interface DateRange {
  readonly checkIn: string | null;
  readonly checkOut: string | null;
}

// Single month grid, click-click range selection: first click sets check-in
// (and clears any prior check-out), second click after it sets check-out.
@Component({
  selector: 'app-date-range-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownComponent, IconButtonComponent, ButtonComponent],
  template: `
    <app-dropdown [(open)]="open">
      <button dropdownTrigger type="button" class="trigger" [attr.aria-expanded]="open()">
        <span class="k">Check-in &mdash; check-out</span>
        <span class="v" [class.placeholder]="!checkIn() && !checkOut()">{{ summary() }}</span>
      </button>

      <div dropdownPanel class="panel">
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
          @for (label of weekdayLabels; track label) {
            <span>{{ label }}</span>
          }
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

        <div class="footer">
          <span class="nights">{{ nightsLabel() }}</span>
          <app-button size="sm" [disabled]="!checkIn() || !checkOut()" (click)="apply()">
            Apply
          </app-button>
        </div>
      </div>
    </app-dropdown>
  `,
  styles: `
    .trigger {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      align-items: flex-start;
      background: transparent;
      border: none;
      padding: var(--space-3) var(--space-5);
      cursor: pointer;
      width: 100%;
      text-align: start;
    }
    .trigger:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
      border-radius: var(--radius-sm);
    }
    .k {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .v {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }
    .v.placeholder {
      color: var(--color-ink-300);
      font-weight: var(--font-weight-regular);
    }

    .panel {
      inline-size: min(340px, 92vw);
      padding: var(--space-4);
    }

    .month-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: var(--space-3);
    }

    .month-label {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
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
      padding-block: var(--space-2);
      cursor: pointer;
    }

    .day:hover:not(:disabled) {
      background: var(--color-surface-subtle);
    }

    .day:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .day:disabled {
      color: var(--color-ink-300);
      cursor: not-allowed;
    }

    .day.dim {
      color: var(--color-ink-300);
    }

    .day.in-range {
      background: var(--color-teal-100);
      border-radius: 0;
    }

    .day.range-edge {
      background: var(--color-ink-950);
      color: var(--color-text-inverse);
      font-weight: var(--font-weight-bold);
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-start: var(--space-3);
      padding-block-start: var(--space-3);
      border-block-start: 1px solid var(--color-border);
    }

    .nights {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `,
})
export class DateRangeFieldComponent {
  readonly rangeApplied = output<DateRange>();

  protected readonly open = signal(false);
  protected readonly checkIn = signal<string | null>(null);
  protected readonly checkOut = signal<string | null>(null);

  private readonly today = new Date();
  private readonly viewYear = signal(this.today.getFullYear());
  private readonly viewMonth = signal(this.today.getMonth());

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

  protected readonly summary = computed(() => {
    const inDate = this.checkIn();
    const outDate = this.checkOut();
    if (!inDate) return 'Add dates';
    if (!outDate) return `${inDate} — add check-out`;
    return `${inDate} — ${outDate}`;
  });

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
      this.checkIn.set(day.iso);
      this.checkOut.set(null);
      return;
    }

    if (day.iso <= inDate) {
      this.checkIn.set(day.iso);
      return;
    }

    this.checkOut.set(day.iso);
  }

  isInRange(iso: string): boolean {
    const inDate = this.checkIn();
    const outDate = this.checkOut();
    if (!inDate || !outDate) return false;
    return iso > inDate && iso < outDate;
  }

  apply(): void {
    this.rangeApplied.emit({ checkIn: this.checkIn(), checkOut: this.checkOut() });
    this.open.set(false);
  }
}
