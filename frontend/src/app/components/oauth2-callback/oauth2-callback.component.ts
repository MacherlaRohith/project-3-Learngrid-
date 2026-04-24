import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenStorageService } from '../../services/token-storage.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-oauth2-callback',
  standalone: true,
  template: `
    <div class="callback-container glass-panel">
      <div class="loader-content">
        <div class="spinner"></div>
        <p>Authenticating with Google...</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: var(--bg-dark);
    }
    .loader-content {
      text-align: center;
      color: #fff;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top: 3px solid var(--primary);
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class OAuth2CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tokenStorage: TokenStorageService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (token) {
      this.tokenStorage.saveToken(token);
      
      // Fetch user profile after OAuth login
      this.http.get('http://localhost:8080/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token }
      }).subscribe({
        next: (user: any) => {
          this.tokenStorage.saveUser(user);
          this.router.navigate(['/dashboard']).then(() => window.location.reload());
        },
        error: (err) => {
          console.error('Failed to fetch user after OAuth login', err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
