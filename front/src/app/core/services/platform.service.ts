import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

// Single point of truth for "are we in the browser?". Nothing else in the
// app should call isPlatformBrowser/isPlatformServer directly — route
// through here so SSR-unsafe access stays easy to audit.
@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly isServer = isPlatformServer(this.platformId);
}
