import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { SkeletonComponent } from '../../../../../shared/ui/skeleton/skeleton.component';
import { DESTINATION_PROVIDER } from '../../services/destination-provider';
import { Destination, destinationLabel } from '../../models/destination';

// One field, three states depending on what the visitor has typed:
// recent searches + popular destinations (empty query), or filtered matches.
// Swapping DESTINATION_PROVIDER's implementation is the only change needed
// to move this off mock data.
@Component({
  selector: 'app-destination-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DropdownComponent, SkeletonComponent],
  template: `
    <app-dropdown [(open)]="open">
      <button
        dropdownTrigger
        type="button"
        class="trigger"
        [attr.aria-expanded]="open()"
        (click)="onTriggerClick()"
      >
        <span class="k">{{ label() }}</span>
        <span class="v">{{ value() || placeholder() }}</span>
      </button>

      <div dropdownPanel class="panel">
        <input
          #queryInput
          type="text"
          class="query"
          [placeholder]="'Search destinations'"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          aria-label="Search destinations"
        />

        @if (query().length === 0) {
          @if (recent().length) {
            <p class="section-label">Recent searches</p>
            @for (destination of recent(); track destination.id) {
              <button type="button" class="option" (click)="select(destination)">
                {{ destinationLabel(destination) }}
              </button>
            }
          }
          <p class="section-label">Popular destinations</p>
          @for (destination of popular(); track destination.id) {
            <button type="button" class="option" (click)="select(destination)">
              {{ destinationLabel(destination) }}
            </button>
          }
        } @else {
          @if (matches() === undefined) {
            <app-skeleton height="1.1rem" />
            <app-skeleton height="1.1rem" width="80%" />
          } @else if (matches()!.length === 0) {
            <p class="empty">No destinations match "{{ query() }}"</p>
          } @else {
            @for (destination of matches(); track destination.id) {
              <button type="button" class="option" (click)="select(destination)">
                {{ destinationLabel(destination) }}
              </button>
            }
          }
        }
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
      padding: var(--space-3);
      max-block-size: 420px;
      overflow-y: auto;
    }

    .query {
      width: 100%;
      box-sizing: border-box;
      font-size: var(--font-size-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      margin-block-end: var(--space-3);
    }

    .query:focus-visible {
      outline: none;
      border-color: var(--color-ink-950);
      box-shadow: var(--shadow-focus);
    }

    .section-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin: var(--space-3) var(--space-2) var(--space-1);
    }

    .option {
      display: block;
      width: 100%;
      text-align: start;
      background: transparent;
      border: none;
      border-radius: var(--radius-sm);
      padding: var(--space-2);
      font-size: var(--font-size-sm);
      cursor: pointer;
    }

    .option:hover {
      background: var(--color-surface-subtle);
    }

    .option:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .empty {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      padding: var(--space-2);
    }
  `,
})
export class DestinationFieldComponent {
  private readonly provider = inject(DESTINATION_PROVIDER);

  readonly label = input('Destination');
  readonly placeholder = input('Where to?');
  readonly value = input('');
  readonly valueChange = output<string>();

  protected readonly open = signal(false);
  protected readonly query = signal('');

  protected readonly recent = toSignal(this.provider.recent(), { initialValue: [] });
  protected readonly popular = toSignal(this.provider.popular(), { initialValue: [] });

  // undefined = loading, [] = no matches, Destination[] = matches.
  protected readonly matches = toSignal(
    toObservable(this.query).pipe(
      debounceTime(150),
      distinctUntilChanged(),
      switchMap((query) => (query ? this.provider.search(query) : of(undefined))),
    ),
    { initialValue: undefined },
  );

  protected readonly destinationLabel = destinationLabel;

  onTriggerClick(): void {
    this.open.set(true);
  }

  select(destination: Destination): void {
    this.valueChange.emit(destinationLabel(destination));
    this.query.set('');
    this.open.set(false);
  }
}
