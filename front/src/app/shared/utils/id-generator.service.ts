import { Injectable } from '@angular/core';

// SSR-safe unique id generation for form control associations (label `for`,
// aria-describedby, etc). Deliberately NOT a module-level counter: this is a
// providedIn: 'root' service, so Angular Universal gives it a fresh instance
// per request, keeping server-rendered ids in sync with the client's first
// render on hydration. A plain top-level `let id = 0` would instead persist
// across requests inside the same Node process and drift from the browser.
@Injectable({ providedIn: 'root' })
export class IdGeneratorService {
  private counter = 0;

  next(prefix: string): string {
    this.counter += 1;
    return `${prefix}-${this.counter}`;
  }
}
