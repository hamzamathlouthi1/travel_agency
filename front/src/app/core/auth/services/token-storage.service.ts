import { Injectable, inject } from '@angular/core';
import { StorageService } from '../../services/storage.service';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const USER_KEY = 'auth.user';

// Isolates the storage key/mechanism for the access token so it can move
// (e.g. to an httpOnly-cookie based flow) without touching AuthService callers.
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly storage = inject(StorageService);

  getAccessToken(): string | null {
    return this.storage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    this.storage.setItem(ACCESS_TOKEN_KEY, token);
  }

  clearAccessToken(): void {
    this.storage.removeItem(ACCESS_TOKEN_KEY);
  }

  getUser(): string | null {
    return this.storage.getItem(USER_KEY);
  }

  setUser(user: unknown): void {
    this.storage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    this.storage.removeItem(USER_KEY);
  }
}
