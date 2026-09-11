import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SEARCH_MODES, SearchMode } from '../../models/search-mode';

@Component({
  selector: 'app-search-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tabs" role="tablist">
      @for (item of modes; track item.mode) {
        <button
          type="button"
          role="tab"
          class="tab"
          [class.active]="item.mode === active()"
          [attr.aria-selected]="item.mode === active()"
          (click)="modeChange.emit(item.mode)"
        >
          {{ item.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .tabs {
      display: flex;
      gap: var(--space-6);
    }

    .tab {
      background: none;
      border: none;
      border-block-end: 2.5px solid transparent;
      padding-block-end: var(--space-2);
      font-family: var(--font-family-base);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      cursor: pointer;
    }

    .tab:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .tab.active {
      color: var(--color-text-primary);
      border-block-end-color: var(--color-amber-600);
    }
  `,
})
export class SearchTabsComponent {
  readonly active = input.required<SearchMode>();
  readonly modeChange = output<SearchMode>();
  protected readonly modes = SEARCH_MODES;
}
