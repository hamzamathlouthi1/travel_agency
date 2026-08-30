import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly auth = inject(AuthService);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly displayName = computed(() => this.auth.currentUser()?.displayName ?? 'Guest');
}
