import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

// Numbered pagination, not infinite scroll — preserves a comparable
// position and a shareable/back-navigable URL per page (see hotel-search-url.util.ts).
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pagination" aria-label="Results pages">
      <button
        type="button"
        class="step"
        [disabled]="page() <= 1"
        aria-label="Previous page"
        (click)="pageChange.emit(page() - 1)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" /></svg>
      </button>

      @for (item of items(); track $index) {
        @if (item === null) {
          <span class="ellipsis" aria-hidden="true">&hellip;</span>
        } @else {
          <button
            type="button"
            class="num"
            [class.active]="item === page()"
            [attr.aria-current]="item === page() ? 'page' : null"
            [attr.aria-label]="'Page ' + item"
            (click)="pageChange.emit(item)"
          >
            {{ item }}
          </button>
        }
      }

      <button
        type="button"
        class="step"
        [disabled]="page() >= totalPages()"
        aria-label="Next page"
        (click)="pageChange.emit(page() + 1)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" /></svg>
      </button>
    </nav>
  `,
  styles: `
    .pagination {
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: center;
    }

    .step,
    .num {
      min-width: 36px;
      min-height: 36px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
    }

    .step {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .step:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .num {
      border-color: transparent;
    }

    .num:hover:not(.active) {
      background: var(--color-surface-subtle);
    }

    .num.active {
      background: var(--color-ink-950);
      border-color: var(--color-ink-950);
      color: var(--color-text-inverse);
    }

    .step:focus-visible,
    .num:focus-visible {
      outline: none;
      box-shadow: var(--shadow-focus);
    }

    .ellipsis {
      color: var(--color-text-muted);
      padding: 0 4px;
    }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly items = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const items: (number | null)[] = [1];
    if (current > 3) items.push(null);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (current < total - 2) items.push(null);
    items.push(total);
    return items;
  });
}
