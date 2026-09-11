import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap } from 'rxjs';
import { AuthenticatedUser } from '../models/user.model';
import { Role } from '../models/role.model';
import { TokenStorageService } from './token-storage.service';
import { AuthApiService } from './auth-api.service';
import {
  AuthResponse,
  LoginRequest,
  PendingRegistrationResponse,
  RegisterRequest,
  VerifyEmailRequest,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private readonly currentUserSignal = signal<AuthenticatedUser | null>(this.restoreSession());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly roles = computed<readonly Role[]>(() => this.currentUserSignal()?.roles ?? []);

  private restoreSession(): AuthenticatedUser | null {
    const accessToken = this.tokenStorage.getAccessToken();
    const storedUser = this.tokenStorage.getUser();

    if (!accessToken || !storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthenticatedUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  private mapUser(response: AuthResponse): AuthenticatedUser {
    return {
      id: String(response.user.id),
      email: response.user.email,
      displayName: `${response.user.prenom} ${response.user.nom}`.trim(),
      roles: response.user.roles,
    };
  }

  login(payload: LoginRequest): Observable<AuthenticatedUser> {
    return this.authApi.login(payload).pipe(
      tap((response) => {
        this.setSession(this.mapUser(response), response.token);
      }),
      map((response) => this.mapUser(response)),
      catchError((error) => {
        this.clearSession();
        throw error;
      }),
    );
  }

  register(payload: RegisterRequest): Observable<PendingRegistrationResponse> {
    return this.authApi.register(payload);
  }

  verifyEmail(payload: VerifyEmailRequest): Observable<AuthenticatedUser> {
    return this.authApi.verifyEmail(payload).pipe(
      tap((response) => {
        this.setSession(this.mapUser(response), response.token);
      }),
      map((response) => this.mapUser(response)),
      catchError((error) => {
        this.clearSession();
        throw error;
      }),
    );
  }

  resendVerification(verificationId: string): Observable<PendingRegistrationResponse> {
    return this.authApi.resendVerification(verificationId);
  }

  logout(): void {
    this.clearSession();
    // Sends the user away from whatever page they were on — route guards
    // only run on navigation, so without this they'd be left sitting on a
    // protected page (e.g. /account) even though the session is now cleared.
    this.router.navigate(['/']);
  }

  hasRole(allowed: readonly Role[]): boolean {
    const roles = this.roles();
    return allowed.some((role) => roles.includes(role));
  }

  setSession(user: AuthenticatedUser, accessToken: string): void {
    this.currentUserSignal.set(user);
    this.tokenStorage.setAccessToken(accessToken);
    this.tokenStorage.setUser(user);
  }

  clearSession(): void {
    this.currentUserSignal.set(null);
    this.tokenStorage.clearAccessToken();
    this.tokenStorage.clearUser();
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }
}
