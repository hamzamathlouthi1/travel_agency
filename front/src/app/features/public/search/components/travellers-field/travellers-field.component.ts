import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { RoomSelectorComponent } from '../room-selector/room-selector.component';
import { SearchStateService } from '../../services/search-state.service';
import { totalTravellers } from '../../models/hotel-search';

@Component({
  selector: 'app-travellers-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownComponent, ButtonComponent, RoomSelectorComponent],
  template: `
    <app-dropdown [(open)]="open">
      <button dropdownTrigger type="button" class="trigger" [attr.aria-expanded]="open()">
        <span class="k">Travellers &amp; rooms</span>
        <span class="v">{{ summary() }}</span>
      </button>

      <div dropdownPanel class="panel">
        @for (room of searchState.hotel().rooms; track $index) {
          <app-room-selector
            [index]="$index"
            [room]="room"
            [canRemove]="searchState.hotel().rooms.length > 1"
            (patch)="searchState.updateRoom($index, $event)"
            (remove)="searchState.removeRoom($index)"
          />
        }
        <button type="button" class="add-room" (click)="searchState.addRoom()">
          + Add another room
        </button>
        <app-button size="sm" fullWidth (click)="open.set(false)">Done</app-button>
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

    .panel {
      inline-size: min(360px, 90vw);
      padding: var(--space-4);
    }

    .add-room {
      background: none;
      border: none;
      color: var(--color-teal-600);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      padding: var(--space-2) 0;
      text-align: start;
      margin-block-end: var(--space-3);
    }
  `,
})
export class TravellersFieldComponent {
  protected readonly searchState = inject(SearchStateService);
  protected readonly open = signal(false);

  protected readonly summary = computed(() => {
    const { rooms } = this.searchState.hotel();
    const travellers = totalTravellers(rooms);
    const travellerLabel = travellers === 1 ? '1 traveller' : `${travellers} travellers`;
    const roomLabel = rooms.length === 1 ? '1 room' : `${rooms.length} rooms`;
    return `${travellerLabel} · ${roomLabel}`;
  });
}
