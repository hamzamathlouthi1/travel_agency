export type Civilite = 'MR' | 'MME' | 'MLLE';

export interface UserSummary {
  readonly id: number;
  readonly civilite: Civilite;
  readonly prenom: string;
  readonly nom: string;
  readonly email: string;
  readonly mobile: string;
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
