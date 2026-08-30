import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { DrawerComponent } from '../../../../../shared/ui/drawer/drawer.component';
import { HOTEL_SORT_OPTIONS, HotelSortKey, sortLabel } from '../../models/hotel-sort.model';

// One control, two presentations (CSS-driven, both in the DOM so
// server/client render identically): a dropdown on desktop, a bottom sheet
// on mobile — same options, same behavior.
@Component({
  selector: 'app-sort-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownComponent, DrawerComponent],
  template: `
    <div class="desktop-sort">
      <app-dropdown [(open)]="desktopOpen">
        <button dropdownTrigger type="button" class="trigger" [attr.aria-expanded]="desktopOpen()">
          <span class="k">Sort by</span>
          <span class="v">{{ currentLabel() }}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" /></svg>
        </button>
        <div dropdownPanel class="panel" role="listbox" aria-label="Sort by">
          @for (option of options; track option.key) {
            <button
              type="button"
              role="option"
              class="option"
              [class.active]="option.key === active()"
              [attr.aria-selected]="option.key === active()"
              (click)="select(option.key)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </app-dropdown>
    </div>

    <button type="button" class="mobile-trigger" (click)="mobileOpen.set(true)">
      Sort: {{ currentLabel() }}
      <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" /></svg>
    </button>

    <app-drawer [open]="mobileOpen()" edge="block-end" label="Sort by" (requestClose)="mobileOpen.set(false)">
      <h2 class="sheet-title">Sort by</h2>
      @for (option of options; track option.key) {
        <label class="row">
          <span [class.active-text]="option.key === active()">{{ option.label }}</span>
          <span class="radio" [class.checked]="option.key === active()"></span>
          <input
            type="radio"
            name="hotel-sort"
            class="visually-hidden"
            [checked]="option.key === active()"
            (change)="select(option.key)"
          />
        </label>
      }
    </app-drawer>
  `,
  styles: `
    .desktop-sort {
      display: none;
    }

    .trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-2) var(--space-3);
      cursor: pointer;
      font-family: var(--font-family-base);
    }

    .trigger:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .k {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      font-weight: var(--font-weight-semibold);
    }

    .v {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-bold);
    }

    .panel {
      inline-size: 220px;
      padding: 6px;
    }

    .option {
      display: block;
      width: 100%;
      text-align: start;
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-sm);
      cursor: pointer;
    }

    .option:hover {
      background: var(--color-surface-subtle);
    }

    .option.active {
      font-weight: var(--font-weight-bold);
    }

    .mobile-trigger {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      min-height: 44px;
    }

    .sheet-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-extrabold);
      margin: 0 0 var(--space-3);
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-1);
      min-height: 44px;
      border-block-end: 1px solid var(--color-surface-subtle);
      font-size: var(--font-size-md);
      cursor: pointer;
    }

    .active-text {
      font-weight: var(--font-weight-bold);
    }

    .radio {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1.5px solid var(--color-border-strong);
      flex-shrink: 0;
    }

    .radio.checked {
      border-color: var(--color-ink-950);
      background: var(--color-ink-950);
    }

    @media (min-width: 768px) {
      .desktop-sort {
        display: block;
      }
      .mobile-trigger {
        display: none;
      }
    }
  `,
})
export class SortControlComponent {
  readonly active = input.required<HotelSortKey>();
  readonly sortChange = output<HotelSortKey>();

  protected readonly options = HOTEL_SORT_OPTIONS;
  protected readonly desktopOpen = signal(false);
  protected readonly mobileOpen = signal(false);

  protected currentLabel(): string {
    return sortLabel(this.active());
  }

  select(key: HotelSortKey): void {
    this.sortChange.emit(key);
    this.desktopOpen.set(false);
    this.mobileOpen.set(false);
  }
}
