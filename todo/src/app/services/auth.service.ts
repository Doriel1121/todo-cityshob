// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse } from '../models/AuthResponse';
import { environment } from '../environmets/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private jwtToken = new BehaviorSubject<string>('');
  public jwtToken$ = this.jwtToken.asObservable();
  private jwtHelper = new JwtHelperService();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/login`,
      credentials
    );
  }

  logout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  setToken(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('username', response.username);
    this.jwtToken.next(response.token);
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.jwtToken.next('');
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.jwtHelper.isTokenExpired(token);
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.jwtHelper.decodeToken(token);
  }

  register(credentials: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/register`, credentials);
  }
}
