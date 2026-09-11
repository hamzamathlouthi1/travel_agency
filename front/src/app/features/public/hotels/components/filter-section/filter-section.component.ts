import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Generic collapsible-free grouping wrapper — a title plus projected
// controls — reused by every filter group so spacing/typography stays
// identical across price/stars/rating/board/cancellation/amenities/area.
@Component({
  selector: 'app-filter-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="section">
      <legend class="title">{{ title() }}</legend>
      <ng-content />
    </fieldset>
  `,
  styles: `
    .section {
      border: none;
      margin: 0;
      padding: 0;
    }

    .title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      padding: 0;
      margin: 0 0 var(--space-3);
    }
  `,
})
export class FilterSectionComponent {
  readonly title = input.required<string>();
}
