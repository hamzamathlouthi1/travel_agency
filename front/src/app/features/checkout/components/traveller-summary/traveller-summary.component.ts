import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Traveller, TRAVELLER_TITLE_LABEL } from '../../../booking/domain/traveller.model';
import { ContactDetails } from '../../../booking/domain/contact-details.model';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-traveller-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    <section class="section" aria-labelledby="traveller-summary-heading">
      <div class="head">
        <h2 id="traveller-summary-heading" class="section-title">Travellers</h2>
        <app-button variant="ghost" size="sm" (click)="edit.emit()">Edit</app-button>
      </div>

      <ul class="list">
        <li class="traveller">
          <span class="name">{{ leadName() }}</span>
          <span class="tag">Lead traveller</span>
        </li>
        @for (traveller of additionalTravellers(); track $index) {
          <li class="traveller">
            <span class="name">{{ travellerName(traveller) }}</span>
            @if (traveller.type === 'CHILD') {
              <span class="tag">Child</span>
            }
          </li>
        }
      </ul>

      <div class="contact">
        <span>{{ contact().email }}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{{ contact().phone }}</span>
      </div>
    </section>
  `,
  styles: `
    .section {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .section-title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-extrabold);
      margin: 0;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .traveller {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .tag {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted);
    }

    .contact {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      padding-block-start: var(--space-2);
      border-block-start: 1px solid var(--color-surface-subtle);
    }
  `,
})
export class TravellerSummaryComponent {
  readonly leadTraveller = input.required<Traveller>();
  readonly contact = input.required<ContactDetails>();
  readonly additionalTravellers = input<readonly Traveller[]>([]);

  readonly edit = output<void>();

  protected readonly leadName = computed(() => this.travellerName(this.leadTraveller()));

  protected travellerName(traveller: Traveller): string {
    const title = traveller.title ? `${TRAVELLER_TITLE_LABEL[traveller.title]} ` : '';
    return `${title}${traveller.firstName} ${traveller.lastName}`;
  }
}
