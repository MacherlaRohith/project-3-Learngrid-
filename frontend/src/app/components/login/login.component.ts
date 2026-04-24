import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="login-page animate-fade-in">
      <div class="glass-card glass-panel">
        <div class="card-header">
          <div class="logo-glow"></div>
          <h2 class="outfit">Welcome Back</h2>
          <p>Digital learning, <span class="gradient-text">refined.</span></p>
        </div>
        
        <form name="form" (ngSubmit)="f.form.valid && onSubmit()" #f="ngForm" novalidate>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              class="glass-input"
              name="email"
              [(ngModel)]="form.email"
              required
              email
              #email="ngModel"
              placeholder="Enter your email"
            />
            <div class="error-msg" *ngIf="email.errors && f.submitted">
              <span *ngIf="email.errors['required']">Email is required</span>
              <span *ngIf="email.errors['email']">Email must be a valid email address</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input-wrapper">
              <input
                [type]="showPassword ? 'text' : 'password'"
                class="glass-input"
                name="password"
                [(ngModel)]="form.password"
                required
                minlength="6"
                #password="ngModel"
                placeholder="••••••••"
              />
              <button type="button" class="toggle-pwd-btn" (click)="showPassword = !showPassword">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              </button>
            </div>
            <div class="error-msg" *ngIf="password.errors && f.submitted">
              <span *ngIf="password.errors['required']">Password is required</span>
              <span *ngIf="password.errors['minlength']">Password must be at least 6 characters</span>
            </div>
          </div>

          <button class="btn-primary" style="width: 100%;" [disabled]="loading">
            <span *ngIf="!loading">Sign In</span>
            <span class="loader" *ngIf="loading"></span>
          </button>

          <div class="divider">
            <span>OR</span>
          </div>

          <button type="button" class="google-btn" (click)="loginWithGoogle()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.002-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continue with Google
          </button>

          <div class="alert-error" *ngIf="f.submitted && isLoginFailed">
            Login failed: {{ errorMessage }}
          </div>

          <div class="extra-actions">
            <a routerLink="/forgot-password" class="forgot-link">Forgot Password?</a>
          </div>

          <div class="footer-link">
            Don't have an account? <a routerLink="/register">Register</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
    }
    .glass-card {
      width: 100%;
      max-width: 420px;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }
    .logo-glow {
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 100px;
      background: var(--primary);
      filter: blur(60px);
      opacity: 0.4;
    }
    .card-header {
      margin-bottom: 2.5rem;
      text-align: center;
    }
    .card-header h2 {
      margin: 0;
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
    }
    .card-header p {
      margin: 0.5rem 0 0;
      color: #64748b;
      font-size: 0.9rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.6rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .glass-input {
      width: 100%;
      padding: 0.9rem 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      color: #1e293b;
      font-size: 1rem;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    .glass-input:focus {
      outline: none;
      background: #fff;
      border-color: #4f46e5;
      box-shadow: 0 0 0 4px #e0e7ff;
    }
    .error-msg {
      color: #f87171;
      font-size: 0.75rem;
      margin-top: 0.4rem;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.85rem;
      border-radius: 12px;
      margin-top: 1.5rem;
      font-size: 0.85rem;
      text-align: center;
    }
    .footer-link {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.9rem;
      color: #64748b;
    }
    .footer-link a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }
    .footer-link a:hover {
      text-decoration: underline;
    }
    .password-input-wrapper { position: relative; }
    .toggle-pwd-btn {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      display: flex;
      padding: 0.5rem;
    }
    .divider {
      margin: 1.5rem 0;
      display: flex;
      align-items: center;
      text-align: center;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .divider::before, .divider::after {
      content: "";
      flex: 1;
      border-bottom: 1px solid #e2e8f0;
    }
    .divider span {
      margin: 0 1rem;
    }
    .google-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 0.85rem;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      color: #1e293b;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.3s;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .google-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .extra-actions {
      margin-top: 1rem;
      text-align: right;
    }
    .forgot-link {
      color: #94a3b8;
      font-size: 0.85rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    .forgot-link:hover {
      color: var(--primary);
    }
    .loader {
      width: 18px;
      height: 18px;
      border: 2px solid #fff;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: rotation 1s linear infinite;
    }
    @keyframes rotation {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent implements OnInit {
  form: any = {
    email: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
      this.router.navigate(['/dashboard']).then(() => window.location.reload());
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.authService.login(this.form).subscribe({
      next: data => {
        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.router.navigate(['/dashboard']).then(() => window.location.reload());
      },
      error: err => {
        this.loading = false;
      }
    });
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }
}
