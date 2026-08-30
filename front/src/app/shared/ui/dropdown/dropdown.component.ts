import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  model,
  viewChild,
} from '@angular/core';
import { PlatformService } from '../../../core/services/platform.service';
import { trapFocus } from '../../utils/focus-trap.util';

// Generic anchored panel: projects a trigger (`[dropdownTrigger]`) and a
// panel (`[dropdownPanel]`), and owns the open/closed behavior every
// dropdown-like control needs — outside-click dismiss, Escape-to-close,
// focus moves into the panel on open and returns to the trigger on close.
// Used for the account menu, language/currency switchers, and the search
// date-range/traveller popovers.
@Component({
  selector: 'app-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app-dropdown-host' },
  template: `
    <ng-content select="[dropdownTrigger]" />
    @if (open()) {
      <div #panel class="panel" role="dialog" tabindex="-1">
        <ng-content select="[dropdownPanel]" />
      </div>
    }
  `,
  styles: `
    :host.app-dropdown-host {
      position: relative;
      display: inline-block;
    }

    .panel {
      position: absolute;
      inset-block-start: calc(100% + var(--space-2));
      inset-inline-end: 0;
      z-index: var(--z-dropdown);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
    }

    .panel:focus {
      outline: none;
    }
  `,
})
export class DropdownComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly platform = inject(PlatformService);
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  readonly open = model(false);

  private readonly manageFocus = effect((onCleanup) => {
    if (!this.platform.isBrowser) return;
    const panel = this.panelRef()?.nativeElement;
    if (!this.open() || !panel) return;

    const trigger = this.host.nativeElement.querySelector('[dropdownTrigger]') as HTMLElement | null;
    const untrap = trapFocus(panel, trigger);
    onCleanup(untrap);
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.open()) return;
    this.open.set(false);
  }
}
