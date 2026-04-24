import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="auth-page animate-fade-in">
      <div class="glass-card glass-panel">
        <div class="card-header">
          <h2 class="outfit">New Password</h2>
          <p>Create a strong password for your account.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #f="ngForm" *ngIf="!resetSuccess">
          <div class="form-group">
            <label>New Password</label>
            <input
              type="password"
              class="glass-input"
              name="password"
              [(ngModel)]="form.password"
              required
              minlength="6"
              #password="ngModel"
              placeholder="••••••••"
            />
            <div class="error-msg" *ngIf="password.errors && f.submitted">
               <span *ngIf="password.errors['required']">Password is required</span>
               <span *ngIf="password.errors['minlength']">Must be at least 6 characters</span>
            </div>
          </div>

          <div class="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              class="glass-input"
              name="confirmPassword"
              [(ngModel)]="form.confirmPassword"
              required
              placeholder="••••••••"
            />
            <div class="error-msg" *ngIf="form.password !== form.confirmPassword && f.submitted">
               Passwords do not match
            </div>
          </div>

          <button class="btn-primary" style="width: 100%;" [disabled]="loading || f.invalid">
            <span *ngIf="!loading">Reset Password</span>
            <span class="loader" *ngIf="loading"></span>
          </button>

          <div class="alert-error" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>
        </form>

        <div class="success-msg" *ngIf="resetSuccess">
          <div class="check-icon">✓</div>
          <h3>Password Reset!</h3>
          <p>Your password has been successfully updated. You can now log in with your new credentials.</p>
          <a routerLink="/login" class="btn-primary" style="display: block; text-align: center; margin-top: 1.5rem; text-decoration: none;">Login Now</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px); padding: 2rem; }
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
    .success-msg { text-align: center; }
    .success-msg h3 { color: #0f172a; margin-bottom: 0.5rem; }
    .check-icon { width: 60px; height: 60px; background: #ecfdf5; border: 2px solid #10b981; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.5rem; }
    .success-msg p { color: #475569; }
    .loader { width: 18px; height: 18px; border: 2px solid #fff; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
    @keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: any = {
    password: '',
    confirmPassword: ''
  };
  token: string = '';
  loading: boolean = false;
  resetSuccess: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'];
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token.';
    }
  }

  onSubmit() {
    if (this.form.password !== this.form.confirmPassword) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    this.authService.resetPassword({
      token: this.token,
      newPassword: this.form.password
    }).subscribe({
      next: () => {
        this.resetSuccess = true;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to reset password. The link might be expired.';
        this.loading = false;
      }
    });
  }
}
