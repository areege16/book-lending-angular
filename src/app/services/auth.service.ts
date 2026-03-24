import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';

import { API_BASE_URL } from '../core/config/api.config';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UserRole,
} from '../core/models/app.models';

const TOKEN_KEY = 'book_lending_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private tokenSignal = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly user = computed<AuthUser | null>(() => this.decodeUser(this.tokenSignal()));
  readonly role = computed<UserRole | null>(() => this.user()?.role ?? null);

  register(payload: RegisterRequest) {
    return this.http.post(`${API_BASE_URL}/api/Account/register`, payload);
  }

  login(payload: LoginRequest) {
    return this.http.post<unknown>(`${API_BASE_URL}/api/Account/login`, payload).pipe(
      map((res) => this.extractToken(res)),
      tap((token) => this.setToken(token)),
    );
  }

  logout() {
    this.setToken('');
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  redirectByRole() {
    const role = this.role();
    if (role === 'Admin') {
      this.router.navigateByUrl('/admin/books');
      return;
    }
    this.router.navigateByUrl('/books');
  }

  private setToken(token: string) {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      this.tokenSignal.set(null);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  private decodeUser(token: string | null): AuthUser | null {
    if (!token) {
      return null;
    }

    try {
      const tokenPart = token.split('.')[1];
      if (!tokenPart) {
        return null;
      }

      const normalized = tokenPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded));
      const role =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload.role ??
        'Reader';

      return {
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? 'User',
        email: payload['email'] ?? '',
        role: role as UserRole,
      };
    } catch {
      return null;
    }
  }

  private extractToken(response: unknown): string {
    if (!response) {
      return '';
    }

    if (typeof response === 'string') {
      return response;
    }

    const res = response as AuthResponse & {
      data?: AuthResponse;
      result?: AuthResponse;
      value?: string;
    };
    return (
      res.token ??
      res.jwt ??
      res.accessToken ??
      res.data?.token ??
      res.data?.jwt ??
      res.data?.accessToken ??
      res.result?.token ??
      res.result?.jwt ??
      res.result?.accessToken ??
      res.value ??
      ''
    );
  }
}
