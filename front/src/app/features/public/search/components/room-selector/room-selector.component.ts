import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Room } from '../../models/hotel-search';
import { IconButtonComponent } from '../../../../../shared/ui/icon-button/icon-button.component';

const MAX_ADULTS = 8;
const MAX_CHILDREN = 6;
const CHILD_AGE_OPTIONS = Array.from({ length: 18 }, (_, age) => age);

// Per-room adults/children/child-age steppers. Purely presentational —
// SearchStateService owns the actual room list; this emits deltas upward.
@Component({
  selector: 'app-room-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconButtonComponent],
  template: `
    <div class="room">
      <div class="room-header">
        <span class="room-title">Room {{ index() + 1 }}</span>
        @if (canRemove()) {
          <button type="button" class="remove" (click)="remove.emit()">Remove</button>
        }
      </div>

      <div class="stepper-row">
        <div>
          <div class="label">Adults</div>
          <div class="hint">Age 18+</div>
        </div>
        <div class="stepper">
          <app-icon-button
            ariaLabel="Decrease adults"
            variant="subtle"
            [disabled]="room().adults <= 1"
            (click)="patch.emit({ adults: room().adults - 1 })"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2" fill="none" /></svg>
          </app-icon-button>
          <span class="count" aria-live="polite">{{ room().adults }}</span>
          <app-icon-button
            ariaLabel="Increase adults"
            variant="subtle"
            [disabled]="room().adults >= maxAdults"
            (click)="patch.emit({ adults: room().adults + 1 })"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" /></svg>
          </app-icon-button>
        </div>
      </div>

      <div class="stepper-row">
        <div>
          <div class="label">Children</div>
          <div class="hint">Age 0&ndash;17</div>
        </div>
        <div class="stepper">
          <app-icon-button
            ariaLabel="Decrease children"
            variant="subtle"
            [disabled]="room().children <= 0"
            (click)="onChildrenChange(room().children - 1)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M5 12h14" stroke="currentColor" stroke-width="2" fill="none" /></svg>
          </app-icon-button>
          <span class="count" aria-live="polite">{{ room().children }}</span>
          <app-icon-button
            ariaLabel="Increase children"
            variant="subtle"
            [disabled]="room().children >= maxChildren"
            (click)="onChildrenChange(room().children + 1)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" fill="none" /></svg>
          </app-icon-button>
        </div>
      </div>

      @if (room().children > 0) {
        <div class="child-ages">
          @for (age of room().childAges; track $index) {
            <label class="child-age">
              <span class="label">Age of child {{ $index + 1 }}</span>
              <select
                [value]="age ?? ''"
                (change)="onChildAgeChange($index, $any($event.target).value)"
              >
                <option value="" disabled>Select age</option>
                @for (option of childAgeOptions; track option) {
                  <option [value]="option">{{ option }} years old</option>
                }
              </select>
            </label>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .room {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      padding-block: var(--space-3);
    }

    .room + .room {
      border-block-start: 1px solid var(--color-border);
    }

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .room-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .remove {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: var(--font-size-xs);
      cursor: pointer;
      text-decoration: underline;
    }

    .stepper-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .label {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
    }

    .hint {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .stepper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .count {
      min-inline-size: 1.25rem;
      text-align: center;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }

    .child-ages {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      background: var(--color-surface-subtle);
      border-radius: var(--radius-sm);
      padding: var(--space-3);
    }

    .child-age {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    select {
      font-family: var(--font-family-base);
      font-size: var(--font-size-sm);
      padding: var(--space-2);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }

    select:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  `,
})
export class RoomSelectorComponent {
  readonly index = input.required<number>();
  readonly room = input.required<Room>();
  readonly canRemove = input(false);

  readonly patch = output<Partial<Room>>();
  readonly remove = output<void>();

  protected readonly maxAdults = MAX_ADULTS;
  protected readonly maxChildren = MAX_CHILDREN;
  protected readonly childAgeOptions = CHILD_AGE_OPTIONS;

  onChildrenChange(children: number): void {
    const current = [...this.room().childAges];
    const childAges =
      children > current.length
        ? [...current, ...Array<number | null>(children - current.length).fill(null)]
        : current.slice(0, children);
    this.patch.emit({ children, childAges });
  }

  onChildAgeChange(index: number, value: string): void {
    const childAges = [...this.room().childAges];
    childAges[index] = value === '' ? null : Number(value);
    this.patch.emit({ childAges });
  }
}
