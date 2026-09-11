import { Role } from './role.model';

export type Civilite = 'MR' | 'MME' | 'MLLE';

export interface UserSummary {
  readonly id: number;
  readonly civilite: Civilite;
  readonly prenom: string;
  readonly nom: string;
  readonly email: string;
  readonly mobile: string;
  readonly roles: readonly Role[];
  readonly createdAt: string;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly civilite: Civilite;
  readonly prenom: string;
  readonly nom: string;
  readonly email: string;
  readonly mobile: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly token: string;
  readonly type: 'Bearer';
  readonly user: UserSummary;
}

export interface PendingRegistrationResponse {
  readonly verificationId: string;
  readonly maskedEmail: string;
  readonly expiresInSeconds: number;
  readonly message: string;
}

export interface VerifyEmailRequest {
  readonly verificationId: string;
  readonly code: string;
}

export interface EmailVerificationRequiredError {
  readonly status: 403;
  readonly code: 'EMAIL_VERIFICATION_REQUIRED';
  readonly message: string;
  readonly verificationId: string;
  readonly maskedEmail: string;
}
