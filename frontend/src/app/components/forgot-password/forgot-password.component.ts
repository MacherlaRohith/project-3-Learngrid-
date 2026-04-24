import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="glass-card glass-panel">
        <div class="card-header">
          <h2 class="outfit">Reset Password</h2>
          <p>Enter your email to receive a password reset link.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #f="ngForm" *ngIf="!submitted">
          <div class="form-group">
            <label>Email Address</label>
            <input
              type="email"
              class="glass-input"
              name="email"
              [(ngModel)]="email"
              required
              email
              #emailModel="ngModel"
              placeholder="Enter your email"
            />
            <div class="error-msg" *ngIf="emailModel.errors && (emailModel.dirty || emailModel.touched)">
               <span *ngIf="emailModel.errors['required']">Email is required</span>
               <span *ngIf="emailModel.errors['email']">Enter a valid email</span>
            </div>
          </div>

          <button class="btn-primary" style="width: 100%;" [disabled]="loading || f.invalid">
            <span *ngIf="!loading">Send Reset Link</span>
            <span class="loader" *ngIf="loading"></span>
          </button>

          <div class="alert-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="footer-link">
            Back to <a routerLink="/login">Login</a>
          </div>
        </form>

        <div class="success-msg" *ngIf="submitted">
          <div class="check-icon">✓</div>
          <p>We've sent a password reset link to <strong>{{ email }}</strong>. Please check your inbox (and spam folder).</p>
          <a routerLink="/login" class="btn-primary" style="display: block; text-align: center; margin-top: 1.5rem; text-decoration: none;">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
    }
    .glass-card { width: 100%; max-width: 420px; padding: 3rem; }
    .card-header { margin-bottom: 2.5rem; text-align: center; }
    .card-header h2 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0; }
    .card-header p { margin: 0.5rem 0 0; color: #64748b; font-size: 0.9rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
    .glass-input {
      width: 100%; padding: 0.9rem 1.25rem; background: #fff;
      border: 1px solid #e2e8f0; border-radius: 14px;
      color: #1e293b; transition: all 0.3s; box-sizing: border-box;
    }
    .glass-input:focus { outline: none; border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px #e0e7ff; }
    .error-msg { color: #dc2626; font-size: 0.75rem; margin-top: 0.4rem; }
    .alert-error { background: #fef2f2; border: 1px solid #fee2e2; color: #dc2626; padding: 0.85rem; border-radius: 12px; margin-top: 1.5rem; text-align: center; font-size: 0.85rem; }
    .footer-link { margin-top: 2rem; text-align: center; font-size: 0.9rem; color: #64748b; }
    .footer-link a { color: #4f46e5; text-decoration: none; font-weight: 600; }
    .success-msg { text-align: center; padding: 1rem 0; }
    .check-icon { width: 60px; height: 60px; background: #ecfdf5; border: 2px solid #10b981; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem; }
    .success-msg p { color: #475569; line-height: 1.6; }
    .loader { width: 18px; height: 18px; border: 2px solid #fff; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
    @keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class ForgotPasswordComponent {
  email: string = '';
  loading: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.submitted = true;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to send reset link. Please try again.';
        this.loading = false;
      }
    });
  }
}
