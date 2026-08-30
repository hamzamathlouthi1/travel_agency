import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { PlatformService } from '../../../core/services/platform.service';
import { trapFocus } from '../../utils/focus-trap.util';
import { lockBodyScroll } from '../../utils/body-scroll-lock.util';

export type DrawerEdge = 'inline-end' | 'block-end';

// Off-canvas panel used for the mobile navigation and the mobile search
// steps. `edge` picks which side it slides in from: `inline-end` for nav
// (right in LTR, left in RTL — logical, not hardcoded), `block-end` for the
// bottom sheet pattern (filters, guest/room picker on mobile). Owns focus
// trapping, return-focus-on-close, and body scroll locking while open.
@Component({
  selector: 'app-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="scrim" (click)="requestClose.emit()"></div>
      <div
        #panel
        class="panel"
        [class.edge-inline-end]="edge() === 'inline-end'"
        [class.edge-block-end]="edge() === 'block-end'"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-label]="label()"
      >
        @if (edge() === 'block-end') {
          <div class="grabber" aria-hidden="true"></div>
        }
        <ng-content />
      </div>
    }
  `,
  styles: `
    .scrim {
      position: fixed;
      inset: 0;
      background: rgba(10, 14, 20, 0.4);
      z-index: var(--z-overlay);
    }

    .panel {
      position: fixed;
      background: var(--color-surface);
      z-index: var(--z-modal);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
    }

    .panel:focus {
      outline: none;
    }

    .panel.edge-inline-end {
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: min(360px, 88vw);
      border-start-start-radius: var(--radius-lg);
      border-end-start-radius: var(--radius-lg);
    }

    .panel.edge-block-end {
      inset-inline: 0;
      inset-block-end: 0;
      max-block-size: 85vh;
      border-start-start-radius: var(--radius-lg);
      border-start-end-radius: var(--radius-lg);
      padding-block-start: var(--space-3);
    }

    .grabber {
      inline-size: 36px;
      block-size: 4px;
      border-radius: var(--radius-pill);
      background: var(--color-border);
      margin-inline: auto;
      margin-block-end: var(--space-3);
    }
  `,
})
export class DrawerComponent {
  readonly open = input(false);
  readonly edge = input<DrawerEdge>('inline-end');
  readonly label = input('Dialog');
  readonly requestClose = output<void>();

  private readonly platform = inject(PlatformService);
  private readonly document = inject(DOCUMENT);
  private readonly panelRef = viewChild<{ nativeElement: HTMLElement }>('panel');

  // Escape-to-close, focus trap + return, and scroll lock — all browser-only,
  // all torn down together when `open` flips false or the component is
  // destroyed.
  private readonly manageOverlay = effect((onCleanup) => {
    if (!this.platform.isBrowser || !this.open()) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.requestClose.emit();
    };
    this.document.addEventListener('keydown', handler);
    const unlockScroll = lockBodyScroll(this.document);

    const panel = this.panelRef()?.nativeElement;
    const previouslyFocused = this.document.activeElement as HTMLElement | null;
    const untrap = panel ? trapFocus(panel, previouslyFocused) : null;

    onCleanup(() => {
      this.document.removeEventListener('keydown', handler);
      unlockScroll();
      untrap?.();
    });
  });
}
