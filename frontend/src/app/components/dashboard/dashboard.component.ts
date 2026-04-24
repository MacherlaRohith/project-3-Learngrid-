import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="redirect-loader">
      <div class="spinner"></div>
      <p>Redirecting to your dashboard...</p>
    </div>
  `,
  styles: [`
    .redirect-loader {
      height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(99, 102, 241, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor(private tokenStorage: TokenStorageService, private router: Router) { }

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const roles = user.roles || [];
    if (roles.includes('ROLE_ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (roles.includes('ROLE_INSTRUCTOR')) {
      this.router.navigate(['/instructor']);
    } else {
      this.router.navigate(['/student']);
    }
  }
}
