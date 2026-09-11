import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config';
import {
  AuthResponse,
  LoginRequest,
  PendingRegistrationResponse,
  RegisterRequest,
  VerifyEmailRequest,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.appConfig.userServiceUrl}/auth/login`, payload);
  }

  register(payload: RegisterRequest): Observable<PendingRegistrationResponse> {
    return this.http.post<PendingRegistrationResponse>(`${this.appConfig.userServiceUrl}/auth/register`, payload);
  }

  verifyEmail(payload: VerifyEmailRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.appConfig.userServiceUrl}/auth/verify-email`, payload);
  }

  resendVerification(verificationId: string): Observable<PendingRegistrationResponse> {
    return this.http.post<PendingRegistrationResponse>(
      `${this.appConfig.userServiceUrl}/auth/resend-verification/${encodeURIComponent(verificationId)}`,
      {},
    );
  }
}
