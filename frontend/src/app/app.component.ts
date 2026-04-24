import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TokenStorageService } from './services/token-storage.service';
import { NgIf } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, ToastComponent],
  template: `
    <div class="app-container">
      <header class="glass-nav">
        <div class="nav-content">
          <div class="logo" routerLink="/">
            <span class="logo-icon">L</span>
            <h1>Learngrid</h1>
          </div>
          
          <nav *ngIf="isLoggedIn" class="main-nav">
            <a *ngIf="showStudentBoard" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            <a routerLink="/courses" routerLinkActive="active">Courses</a>
            <a routerLink="/playground" routerLinkActive="active">Playground</a>
            <a *ngIf="showInstructorBoard" routerLink="/instructor" routerLinkActive="active">Dashboard</a>
            <a *ngIf="showAdminBoard" routerLink="/admin" routerLinkActive="active" class="admin-link">Admin Console</a>
          </nav>

          <div class="user-actions">
            <ng-container *ngIf="!isLoggedIn">
              <a routerLink="/login" class="nav-link">Sign In</a>
              <a routerLink="/register" class="glass-btn-sm">Get Started</a>
            </ng-container>

            <ng-container *ngIf="isLoggedIn">
              <div class="user-profile">
                <div class="user-info">
                  <span class="username">{{ username }}</span>
                  <span *ngIf="isVerified" class="verified-badge" title="Verified User">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="verify-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </span>
                </div>
                <button (click)="logout()" class="logout-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            </ng-container>
          </div>
        </div>
      </header>

      <main class="content-area">
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
        
        <footer class="app-footer">
          <div class="footer-content">
            <div class="footer-section brand-section">
              <div class="logo">
                <span class="logo-icon">L</span>
                <h2>Learngrid</h2>
              </div>
              <p class="brand-tagline">Empowering the next generation of developers through interactive learning and collaboration.</p>
              <div class="social-links">
                <a href="#" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg></a>
                <a href="#" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
                <a href="#" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
              </div>
            </div>
            
            <div class="footer-section links-section">
              <h3>Platform</h3>
              <ul>
                <li><a routerLink="/courses">Courses</a></li>
                <li><a routerLink="/playground">Playground</a></li>
                <li><a routerLink="/dashboard">Student Dashboard</a></li>
                <li><a routerLink="/instructor">Instructor Hub</a></li>
              </ul>
            </div>
            
            <div class="footer-section links-section">
              <h3>Resources</h3>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Community Forum</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Help Center</a></li>
              </ul>
            </div>
            
            <div class="footer-section links-section">
              <h3>Legal</h3>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; {{ currentYear }} Learngrid. All rights reserved.</p>
          </div>
        </footer>
      </main>
      
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      background: #f8fafc;
      background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.08) 0px, transparent 50%);
      color: #0f172a;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .glass-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 0.75rem 0;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    .nav-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      text-decoration: none;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      color: white;
    }
    .logo h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(to right, #1e293b, #64748b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .main-nav {
      display: flex;
      gap: 1.5rem;
    }
    .main-nav a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .main-nav a:hover, .main-nav a.active {
      color: #4f46e5;
    }
    .admin-link {
      color: #d97706 !important;
      font-weight: 600 !important;
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .nav-link {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .glass-btn-sm {
      padding: 0.5rem 1rem;
      background: #4f46e5;
      border: 1px solid #4338ca;
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .glass-btn-sm:hover {
      opacity: 0.9;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.375rem 0.375rem 0.375rem 0.75rem;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 100px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .username {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .verified-badge {
      display: flex;
      align-items: center;
      color: #6366f1;
    }
    .verify-icon {
      filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.2));
    }
    .logout-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      border: none;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: #fee2e2;
      color: #ef4444;
    }
    .content-area {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .page-content {
      flex: 1;
    }
    .app-footer {
      background: white;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      padding: 4rem 0 1.5rem;
      margin-top: auto;
    }
    .footer-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }
    .brand-section .logo {
      margin-bottom: 1rem;
    }
    .brand-section .logo h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(to right, #1e293b, #64748b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-tagline {
      color: #64748b;
      font-size: 0.875rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      max-width: 300px;
    }
    .social-links {
      display: flex;
      gap: 1rem;
    }
    .social-links a {
      color: #94a3b8;
      transition: color 0.2s, transform 0.2s;
      display: flex;
    }
    .social-links a:hover {
      color: #4f46e5;
      transform: translateY(-2px);
    }
    .links-section h3 {
      color: #1e293b;
      font-size: 0.875rem;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 1.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .links-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .links-section a {
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s;
    }
    .links-section a:hover {
      color: #4f46e5;
    }
    .footer-bottom {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.5rem 1.5rem 0;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      text-align: center;
      color: #94a3b8;
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
      .brand-section {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 480px) {
      .footer-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showInstructorBoard = false;
  showStudentBoard = false;
  isVerified = false;
  username?: string;
  currentYear = new Date().getFullYear();

  constructor(private tokenStorageService: TokenStorageService, private router: Router) {
    console.log('AppComponent: Initializing...');
  }

  ngOnInit(): void {
    this.updateAuthorities();
  }

  updateAuthorities(): void {
    const user = this.tokenStorageService.getUser();
    if (user && user.roles) {
      this.isLoggedIn = true;
      this.roles = user.roles;
      this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      this.showInstructorBoard = this.roles.includes('ROLE_INSTRUCTOR') && !this.showAdminBoard;
      this.showStudentBoard = this.roles.includes('ROLE_STUDENT') && !this.showAdminBoard;
      this.isVerified = user.isVerified || false;
      this.username = user.username;
    } else {
      this.isLoggedIn = false;
      this.roles = [];
      this.showAdminBoard = false;
      this.showInstructorBoard = false;
      this.showStudentBoard = false;
      this.username = '';
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
  }
}
