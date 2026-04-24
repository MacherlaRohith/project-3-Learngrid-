import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../services/course.service';
import { CourseCardComponent } from '../course-card/course-card.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  template: `
    <div class="catalog-wrapper">
      <header class="catalog-header">
        <h1 class="gradient-text">Explore Our Courses</h1>
        <p class="subtitle">Discover world-class content designed to help you master new skills.</p>
        
        <div class="filters">
          <div class="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search courses..." (input)="onSearch($event)">
          </div>
        </div>
      </header>

      <section class="courses-grid" *ngIf="!loading; else loader">
        <div class="grid" *ngIf="filteredCourses.length > 0; else emptyState">
          <app-course-card 
            *ngFor="let course of filteredCourses" 
            [course]="course"
            [isLocked]="isCourseLocked(course)"
            [actionLabel]="course.id && enrolledCourseIds.has(course.id) ? 'View Details' : 'Enroll First'"
            (onAction)="handleAction(course)">
          </app-course-card>
        </div>
      </section>

      <ng-template #loader>
        <div class="loader-container">
          <div class="spinner"></div>
          <p>Curating the best content for you...</p>
        </div>
      </ng-template>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h2>No courses found</h2>
          <p>We couldn't find any courses matching your search. Try different keywords.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .catalog-wrapper {
      max-width: 1280px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
    }
    .catalog-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    .gradient-text {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 1.25rem;
      color: #64748b;
      max-width: 600px;
      margin: 0 auto 2.5rem;
    }
    .filters {
      display: flex;
      justify-content: center;
      gap: 1rem;
    }
    .search-bar {
      position: relative;
      width: 100%;
      max-width: 500px;
    }
    .search-bar svg {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }
    .search-bar input {
      width: 100%;
      padding: 1rem 1.25rem 1rem 3.5rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      color: #1e293b;
      font-size: 1rem;
      transition: all 0.2s;
    }
    .search-bar input:focus {
      outline: none;
      border-color: #4f46e5;
      background: white;
      box-shadow: 0 0 0 4px #e0e7ff;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2.5rem;
    }
    .loader-container {
      text-align: center;
      padding: 5rem 0;
      color: #64748b;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(99, 102, 241, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }
    .empty-state {
      text-align: center;
      padding: 6rem 2rem;
      background: white;
      border-radius: 32px;
      border: 1px dashed #e2e8f0;
    }
    .empty-state .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
    }
    .empty-state h2 {
      font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .empty-state p {
      color: #64748b;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 640px) {
      .gradient-text { font-size: 2.5rem; }
    }
  `]
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  enrolledCourseIds: Set<number> = new Set();
  filteredCourses: Course[] = [];
  loading = true;

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.loadEnrollments();
    this.loadCourses();
  }

  loadEnrollments(): void {
    this.courseService.getMyEnrollments().subscribe({
      next: (data: any[]) => {
        if (data) {
          this.enrolledCourseIds = new Set(data.map(c => c.courseId));
        }
      },
      error: () => {
        this.enrolledCourseIds = new Set();
      }
    });
  }

  isCourseLocked(course: Course): boolean {
    if (!course.id) return false;
    if (!course.price || course.price === 0) return false;
    return !this.enrolledCourseIds.has(course.id);
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.filteredCourses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching courses', err);
        this.loading = false;
      }
    });
  }

  onSearch(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredCourses = this.courses.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.description.toLowerCase().includes(query)
    );
  }

  handleAction(course: Course): void {
    if (course.id && !this.enrolledCourseIds.has(course.id)) {
      if (course.price && course.price > 0) {
        const confirmPayment = window.confirm(`This is a premium course. Proceed with a mock payment of $${course.price}?`);
        if (!confirmPayment) {
          return;
        }
      }

      this.courseService.enrollInCourse(course.id).subscribe({
        next: () => {
          this.enrolledCourseIds.add(course.id!);
          this.router.navigate(['/course', course.id]);
        },
        error: (err) => {
          console.error('Enrollment failed', err);
          alert(err.error?.message || 'Login required to enroll in courses.');
        }
      });
    } else {
      this.router.navigate(['/course', course.id]);
    }
  }

  viewCourse(course: Course): void {
    this.router.navigate(['/course', course.id]);
  }
}
