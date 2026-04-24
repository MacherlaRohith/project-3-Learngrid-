import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="register-page animate-fade-in">
      <div class="glass-card glass-panel">
        <div class="card-header">
          <div class="logo-glow"></div>
          <h2 class="outfit">Join Learngrid</h2>
          <p>Start your collaborative <span class="gradient-text">journey.</span></p>
        </div>
        
        <form name="form" (ngSubmit)="f.form.valid && onSubmit()" #f="ngForm" novalidate>
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              class="glass-input"
              name="username"
              [(ngModel)]="form.username"
              required
              minlength="3"
              maxlength="20"
              #username="ngModel"
              placeholder="Pick a username"
            />
            <div class="error-msg" *ngIf="username.errors && f.submitted">
              <span *ngIf="username.errors['required']">Username is required</span>
              <span *ngIf="username.errors['minlength']">Username must be at least 3 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email address</label>
            <input
              type="email"
              class="glass-input"
              name="email"
              [(ngModel)]="form.email"
              required
              email
              #email="ngModel"
              placeholder="name@example.com"
            />
            <div class="error-msg" *ngIf="email.errors && f.submitted">
              <span *ngIf="email.errors['required']">Email is required</span>
              <span *ngIf="email.errors['email']">Email must be a valid email address</span>
            </div>
          </div>

          <div class="form-group">
            <label for="role">I am a...</label>
            <select
              class="glass-input"
              name="role"
              [(ngModel)]="form.role"
              required
              #role="ngModel"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
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
            <span *ngIf="!loading">Create Account</span>
            <span class="loader" *ngIf="loading"></span>
          </button>

          <div class="alert-success" *ngIf="isSuccessful">
            {{ successMessage }} <a routerLink="/login">Login now</a>
          </div>

          <div class="alert-error" *ngIf="f.submitted && isSignUpFailed">
            Signup failed: {{ errorMessage }}
          </div>

          <div class="footer-link">
            Already have an account? <a routerLink="/login">Sign In</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
    }
    .glass-card {
      width: 100%;
      max-width: 480px;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }
    .logo-glow {
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 120px;
      background: var(--secondary);
      filter: blur(60px);
      opacity: 0.3;
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
      margin-bottom: 1.25rem;
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
    select.glass-input option {
      background: #fff;
      color: #1e293b;
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
    .alert-success {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #4ade80;
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
export class RegisterComponent {
  form: any = {
    username: null,
    email: null,
    password: null,
    role: 'student'
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  successMessage = '';
  loading = false;
  showPassword = false;

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.loading = true;
    this.authService.register(this.form).subscribe({
      next: data => {
        console.log(data);
        this.successMessage = data.message || 'Registration successful!';
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
        this.loading = false;
      }
    });
  }
}
