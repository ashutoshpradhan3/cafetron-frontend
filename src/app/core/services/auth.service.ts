import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile
} from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API = 'http://localhost:8081/api';
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly LEGACY_TOKEN_KEYS = ['cafetron_token', 'auth_token'];
  private readonly USER_KEY = 'cafetron_user';

  constructor(private http: HttpClient) {}

  // ── API calls ────────────────────────────────────────────────────

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API}/auth/register`, request
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.API}/auth/login`, request
    ).pipe(
      tap(response => this.saveSession(response))
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/users/me`);
  }

  // ── Session management ───────────────────────────────────────────

  private saveSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(this.USER_KEY, JSON.stringify(response));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(this.USER_KEY);
  }

  getToken(): string | null {
    const primary = localStorage.getItem(this.TOKEN_KEY);
    if (primary) {
      return primary;
    }

    for (const key of this.LEGACY_TOKEN_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        localStorage.setItem(this.TOKEN_KEY, legacy);
        localStorage.removeItem(key);
        return legacy;
      }
    }

    return null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getRole(): string | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    return JSON.parse(user).role;
  }

  getUserName(): string | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) return null;
    return JSON.parse(user).name;
  }
}
