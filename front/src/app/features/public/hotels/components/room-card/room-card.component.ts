import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { HotelRoom } from '../../models/room.model';
import { RatePlan } from '../../models/rate-plan.model';
import { RatePlanCardComponent } from '../rate-plan-card/rate-plan-card.component';

// The room header (name, size, beds, view, capacity) is shown once and
// applies to every rate plan listed beneath it — never repeated per rate.
@Component({
  selector: 'app-room-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RatePlanCardComponent],
  template: `
    <article class="room" [class.selected]="isRoomSelected()">
      <div class="head">
        <div class="image" aria-hidden="true"></div>
        <div>
          <h3 class="name">{{ room().name }}</h3>
          <p class="meta">{{ metaLine() }}</p>
        </div>
      </div>

      <ul class="rates">
        @for (rate of room().ratePlans; track rate.id) {
          <app-rate-plan-card
            [rate]="rate"
            [roomName]="room().name"
            [nights]="nights()"
            [occupancyLabel]="occupancyLabel()"
            [selected]="isRateSelected(rate)"
            [soldOut]="isSoldOut(rate)"
            (select)="rateSelected.emit(rate)"
          />
        }
      </ul>
    </article>
  `,
  styles: `
    .room {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface);
    }

    .room.selected {
      border-width: var(--border-width-md);
      border-color: var(--color-ink-950);
    }

    .head {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-5);
    }

    .image {
      width: 120px;
      height: 88px;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, var(--color-teal-100), var(--color-paper-100));
    }

    .name {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-md);
      margin: 0 0 3px;
    }

    .meta {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin: 0;
    }

    .rates {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class RoomCardComponent {
  readonly room = input.required<HotelRoom>();
  readonly nights = input(1);
  readonly occupancyLabel = input('2 adults');
  readonly selectedRoomId = input<string | null>(null);
  readonly selectedRateId = input<string | null>(null);
  readonly soldOutRateIds = input<ReadonlySet<string>>(new Set());
  readonly rateSelected = output<RatePlan>();

  protected readonly metaLine = computed(() => {
    const room = this.room();
    const parts: string[] = [];
    if (room.sizeSquareMeters) parts.push(`${room.sizeSquareMeters} m²`);
    if (room.beds.length) parts.push(room.beds.map((b) => `${b.count} ${b.type}`).join(', '));
    if (room.view) parts.push(room.view);
    parts.push(`Up to ${room.occupancy.maxAdults} adults`);
    return parts.join(' · ');
  });

  protected isRoomSelected(): boolean {
    return this.selectedRoomId() === this.room().id;
  }

  protected isRateSelected(rate: RatePlan): boolean {
    return this.isRoomSelected() && this.selectedRateId() === rate.id;
  }

  protected isSoldOut(rate: RatePlan): boolean {
    return !rate.available || this.soldOutRateIds().has(rate.id);
  }
}
