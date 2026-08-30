import { Injectable, inject } from '@angular/core';
import { PlatformService } from './platform.service';

// SSR-safe localStorage wrapper. On the server this is a silent no-op
// instead of throwing, so shared services (e.g. AuthService) can call it
// unconditionally without sprinkling isPlatformBrowser checks everywhere.
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly platform = inject(PlatformService);

  getItem(key: string): string | null {
    if (!this.platform.isBrowser) {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.platform.isBrowser) {
      return;
    }
    window.localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (!this.platform.isBrowser) {
      return;
    }
    window.localStorage.removeItem(key);
  }
}
