import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { UserSummary } from '../../../core/auth/models/auth.model';

export interface AdminSummary { readonly totalUsers: number; readonly customers: number; readonly administrators: number; }

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  summary(): Observable<AdminSummary> { return this.http.get<AdminSummary>(`${this.config.userServiceUrl}/admin/summary`); }
  users(): Observable<UserSummary[]> { return this.http.get<UserSummary[]>(`${this.config.userServiceUrl}/admin/users`); }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.config.userServiceUrl}/admin/users/${id}`); }
}
