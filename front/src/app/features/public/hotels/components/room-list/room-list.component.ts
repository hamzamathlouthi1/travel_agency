import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { HotelRoom } from '../../models/room.model';
import { RatePlan } from '../../models/rate-plan.model';
import { RoomCardComponent } from '../room-card/room-card.component';

@Component({
  selector: 'app-room-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RoomCardComponent],
  template: `
    <section>
      <h2 class="title">Choose your room</h2>
      <p class="sub">Rates for the same room can differ by cancellation terms and board — compare before selecting.</p>
      <div class="rooms">
        @for (room of rooms(); track room.id) {
          <app-room-card
            [room]="room"
            [nights]="nights()"
            [occupancyLabel]="occupancyLabel()"
            [selectedRoomId]="selectedRoomId()"
            [selectedRateId]="selectedRateId()"
            [soldOutRateIds]="soldOutRateIds()"
            (rateSelected)="rateSelected.emit({ room, rate: $event })"
          />
        }
      </div>
    </section>
  `,
  styles: `
    .title {
      font-weight: var(--font-weight-extrabold);
      font-size: var(--font-size-xl);
      margin: 0 0 4px;
    }

    .sub {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin: 0 0 var(--space-4);
    }

    .rooms {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
  `,
})
export class RoomListComponent {
  readonly rooms = input.required<readonly HotelRoom[]>();
  readonly nights = input(1);
  readonly occupancyLabel = input('2 adults');
  readonly selectedRoomId = input<string | null>(null);
  readonly selectedRateId = input<string | null>(null);
  readonly soldOutRateIds = input<ReadonlySet<string>>(new Set());
  readonly rateSelected = output<{ room: HotelRoom; rate: RatePlan }>();
}
