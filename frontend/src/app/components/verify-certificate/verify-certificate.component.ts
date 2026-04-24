import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-root">
      <div class="verify-card glass-panel animate-fade-in" *ngIf="!loading && result">
        <div class="result-icon success" *ngIf="result.valid">✓</div>
        <div class="result-icon error" *ngIf="!result.valid">✖</div>
        
        <h2 class="outfit status">{{ result.valid ? 'Verified' : 'Invalid Certificate' }}</h2>
        
        <div class="details" *ngIf="result.valid">
          <p>This document officially certifies that:</p>
          <h3 class="name outfit gradient-text">{{ result.studentName }}</h3>
          <p>Has successfully completed the curriculum for:</p>
          <h4 class="course">{{ result.courseName }}</h4>
          <p class="instructor">Instructed by {{ result.instructorName }}</p>
          <p class="issued">Issued: {{ result.issuedAt | date:'mediumDate' }}</p>
        </div>

        <div class="details empty" *ngIf="!result.valid">
          <p>The cryptographic signature provided does not match any official records on the Learngrid platform.</p>
        </div>

        <button class="btn-primary" (click)="goHome()">Return to Platform</button>
      </div>
      
      <div class="loader-box" *ngIf="loading">
        <div class="spinner"></div>
        <p>Verifying cryptographic signature...</p>
      </div>
    </div>
  `,
  styles: [`
    .verify-root { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
    .verify-card { max-width: 500px; width: 90%; padding: 4rem; text-align: center; border-radius: 24px; border: 1px solid #e2e8f0; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
    
    .result-icon { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 2rem; font-weight: 900; }
    .result-icon.success { background: #ecfdf5; color: #10b981; box-shadow: 0 0 30px rgba(16, 185, 129, 0.1); }
    .result-icon.error { background: #fef2f2; color: #ef4444; box-shadow: 0 0 30px rgba(239, 68, 68, 0.1); }
    
    .status { font-size: 2rem; margin-bottom: 2rem; color: #0f172a; }
    .details { margin-bottom: 3rem; color: #64748b; }
    .name { font-size: 2.5rem; margin: 1rem 0 2rem; }
    .course { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 1rem; }
    .instructor { font-style: italic; }
    .issued { margin-top: 1.5rem; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .btn-primary { width: 100%; border-radius: 12px; padding: 1rem; font-weight: 800; font-size: 1rem; }
    
    .loader-box { text-align: center; color: #64748b; }
    .spinner { width: 50px; height: 50px; border: 3px solid #f1f5f9; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VerifyCertificateComponent implements OnInit {
  loading = true;
  result: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.http.get(`http://localhost:8080/api/certificates/verify/${uuid}`).subscribe({
          next: (res) => {
            this.result = res;
            this.loading = false;
          },
          error: (err) => {
            this.result = { valid: false };
            this.loading = false;
          }
        });
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
