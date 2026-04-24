import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { CourseCardComponent } from '../course-card/course-card.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RealtimeDashboardService } from '../../services/realtime-dashboard.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, CourseCardComponent, FormsModule],
  providers: [UserService],
  template: `
    <div class="dashboard-wrapper animate-fade-in">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="title-group">
            <h1 class="outfit">Instructor <span class="gradient-text">Studio</span></h1>
            <p>Architect knowledge and inspire the next generation.</p>
          </div>
          <button (click)="isCreating = true" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create New Course
          </button>
        </div>
      </header>

      <!-- Create Modal -->
      <div *ngIf="isCreating" class="modal-root animate-fade-in" (click)="isCreating = false">
        <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <h2 class="outfit">New Course Architect</h2>
            <button (click)="isCreating = false" class="close-btn">&times;</button>
          </div>
          
          <form (submit)="createCourse()" class="modal-body">
            <div class="form-group">
              <label>Course Title</label>
              <input type="text" class="glass-input" [(ngModel)]="newCourse.title" name="title" placeholder="e.g. Master the Glassmorphism UI" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea class="glass-input" [(ngModel)]="newCourse.description" name="description" rows="4" placeholder="Course syllabus and core objectives..." required></textarea>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Price ($)</label>
                <input type="number" class="glass-input" [(ngModel)]="newCourse.price" name="price" placeholder="49.99" required>
              </div>
              <div class="form-group">
                <label>Thumbnail URL</label>
                <input type="text" class="glass-input" [(ngModel)]="newCourse.thumbnailUrl" name="thumbnailUrl" placeholder="https://...">
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" (click)="isCreating = false" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn-primary">Publish to Catalog</button>
            </div>
          </form>
        </div>
      </div>

      <!-- PLATFORM ALERTS -->
      <section *ngIf="warnings.length > 0" class="alerts-section glass-panel animate-fade-in">
        <div class="alerts-header">
          <div class="alert-icon">⚠️</div>
          <div>
            <h3 class="outfit">Platform Intelligence Notices</h3>
            <p class="text-muted">Direct feedback from administrative moderation team.</p>
          </div>
        </div>
        <div class="alerts-list">
          <div *ngFor="let alert of warnings" class="alert-item glass-panel">
            <span class="timestamp">{{ alert.timestamp | date:'medium' }}</span>
            <p class="reason"><span class="label">Moderator Note:</span> {{ alert.reason }}</p>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-header-flex">
           <h3 class="outfit">Your Course Portfolio</h3>
           <span class="count-pill">{{ myCourses.length }} Active Projects</span>
        </div>

        <div *ngIf="loading" class="loader-box">
           <div class="spinner"></div>
           <p>Syncing your portfolio...</p>
        </div>

        <div *ngIf="!loading && myCourses.length === 0 && !isCreating" class="empty-state glass-panel">
          <div class="empty-icon">🎨</div>
          <h4 class="outfit">The canvas is blank</h4>
          <p>Your journey as a creator starts with a single course.</p>
          <button (click)="isCreating = true" class="btn-primary mt-1">Initialize First Course</button>
        </div>

        <div class="course-grid" *ngIf="!loading">
          <app-course-card 
            *ngFor="let course of myCourses" 
            [course]="course" 
            actionLabel="Manage Studio"
            (onAction)="manageCourse(course)">
          </app-course-card>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { max-width: 1300px; margin: 0 auto; padding: 6rem 2rem; }
    .dashboard-header { margin-bottom: 4rem; position: relative; }
    
    h1 { font-size: 3.5rem; font-weight: 900; margin: 0; }
    .title-group p { font-size: 1.1rem; color: var(--text-muted); margin-top: 0.5rem; }
    
    .header-content { display: flex; justify-content: space-between; align-items: center; }

    /* Modal Styling */
    .modal-root { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-card { width: 100%; max-width: 650px; padding: 3rem; border-color: var(--primary-glow); }
    .modal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .close-btn { background: none; border: none; color: #64748b; font-size: 2rem; cursor: pointer; }
    
    .form-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; }

    /* Alerts */
    .alerts-section { margin-bottom: 4rem; border-left: 4px solid #f59e0b; padding: 2.5rem; }
    .alerts-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
    .alert-icon { font-size: 2rem; width: 60px; height: 60px; background: rgba(245, 158, 11, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(245, 158, 11, 0.1); }
    .alerts-list { display: flex; flex-direction: column; gap: 1rem; }
    .alert-item { padding: 1.5rem; background: rgba(255,255,255,0.02); }
    .timestamp { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 0.5rem; }
    .reason { line-height: 1.6; color: #fff; margin:0; }
    .reason .label { color: #f59e0b; font-weight: 800; }

    /* Portfolio Section */
    .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .count-pill { padding: 0.4rem 1rem; background: rgba(99, 102, 241, 0.1); color: var(--primary); border-radius: 100px; font-weight: 800; font-size: 0.85rem; }
    
    .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }

    .loader-box { text-align: center; padding: 5rem; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.05); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 6rem; border-style: dashed; }
    .empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }
    .mt-1 { margin-top: 1.5rem; }

    @media (max-width: 768px) {
       .header-content { flex-direction: column; align-items: flex-start; gap: 2rem; }
       .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class InstructorDashboardComponent implements OnInit {
  myCourses: any[] = [];
  warnings: any[] = [];
  loading = true;
  isCreating = false;

  newCourse: any = {
    title: '',
    description: '',
    thumbnailUrl: '',
    price: 0
  };

  constructor(
    private courseService: CourseService, 
    private userService: UserService,
    private router: Router,
    private realtimeService: RealtimeDashboardService,
    private tokenStorage: TokenStorageService,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.loadMyCourses();
    this.loadWarnings();
    
    const user = this.tokenStorage.getUser();
    if (user?.id) {
      this.realtimeService.listenForInstructorUpdates(user.id).subscribe(() => {
        console.log('Real-time event received for Instructor. Syncing data...');
        this.ngZone.run(() => {
          this.loadMyCourses();
          this.loadWarnings();
        });
      });
    }
  }

  loadWarnings(): void {
    this.userService.getInstructorWarnings().subscribe({
      next: (data) => this.warnings = data,
      error: (err) => console.warn('Could not fetch warnings', err)
    });
  }

  loadMyCourses(): void {
    this.courseService.getInstructorCourses().subscribe({
      next: (data: any[]) => {
        this.myCourses = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading instructor courses', err);
        this.loading = false;
      }
    });
  }

  createCourse(): void {
    if (!this.newCourse.title || !this.newCourse.description) return;

    this.courseService.createCourse(this.newCourse).subscribe({
      next: () => {
        this.isCreating = false;
        this.newCourse = { title: '', description: '', thumbnailUrl: '', price: 0 };
        this.loadMyCourses();
      },
      error: (err: any) => {
        console.warn('Failed to create course', err);
      }
    });
  }

  manageCourse(course: any): void {
    this.router.navigate(['/instructor/manage', course.id]);
  }
}
