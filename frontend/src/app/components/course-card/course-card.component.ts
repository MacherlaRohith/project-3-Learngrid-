import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="course-card glass-panel animate-fade-in">
      <div class="thumbnail-container" [class.locked]="isLocked">
        <img [src]="course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'" [alt]="course.title">
        
        <div class="status-badge" *ngIf="!course.isApproved">Pending Approval</div>
        
        <!-- Lock Overlay for Paid Courses -->
        <div class="lock-overlay" *ngIf="isLocked">
           <div class="lock-vortex">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
           </div>
           <button (click)="onAction.emit(course)" class="btn-primary sm mt-1">Unlock Course</button>
        </div>

        <!-- Action Overlay for Unlocked -->
        <div class="hover-overlay" *ngIf="!isLocked">
          <button (click)="onAction.emit(course)" class="btn-primary">
            {{ actionLabel }}
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="badge-row">
           <span class="type-tag" [class.paid]="course.price > 0">{{ course.price > 0 ? 'Premium' : 'Standard' }}</span>
           <span class="price-tag outfit" *ngIf="course.price > 0">\${{ course.price }}</span>
        </div>
        
        <h3 class="outfit title">{{ course.title }}</h3>
        <p class="description">{{ course.description | slice:0:70 }}...</p>
        
        <div class="card-footer">
          <div class="instructor">
             <span class="avatar">{{ (course.instructor?.username || 'I')[0] }}</span>
             <span class="name">{{ course.instructor?.username || 'Instructor' }}</span>
          </div>
          <div class="metrics">
             <span class="lessons">{{ course.lessons?.length || 0 }} Modules</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-card { 
       display: flex; flex-direction: column; overflow: hidden; height: 100%; transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1); border-radius: 20px;
       background: white; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .course-card:hover { transform: translateY(-10px); border-color: #4f46e5; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

    .thumbnail-container { position: relative; aspect-ratio: 16/10; overflow: hidden; background: #f1f5f9; }
    .thumbnail-container img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s transform; }
    .course-card:hover img { transform: scale(1.08); }

    .hover-overlay { 
       position: absolute; inset: 0; background: rgba(79, 70, 229, 0.1); backdrop-filter: blur(8px); 
       display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s;
    }
    .course-card:hover .hover-overlay { opacity: 1; }

    .lock-overlay { 
       position: absolute; inset: 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); 
       display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center;
    }
    .lock-vortex { 
       width: 60px; height: 60px; background: #f5f3ff; border-radius: 16px; 
       display: flex; align-items: center; justify-content: center; color: #4f46e5; margin-bottom: 0.5rem;
       border: 1px solid #ddd6fe;
    }

    .status-badge { 
       position: absolute; top: 1rem; right: 1rem; background: #f59e0b; color: #fff; 
       padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; z-index: 5;
    }

    .card-body { padding: 1.75rem; flex: 1; display: flex; flex-direction: column; }
    .badge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    
    .type-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; padding: 0.2rem 0.6rem; background: #f1f5f9; border-radius: 4px; }
    .type-tag.paid { color: #059669; background: #ecfdf5; }
    
    .price-tag { font-weight: 900; color: #1e293b; font-size: 1.1rem; }

    .title { font-size: 1.25rem; margin-bottom: 0.75rem; line-height: 1.4; color: #1e293b; }
    .description { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin-bottom: 1.5rem; flex: 1; }

    .card-footer { 
       display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; 
       border-top: 1px solid #f1f5f9; 
    }
    .instructor { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 28px; height: 28px; background: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; color: #fff; }
    .instructor .name { font-size: 0.8rem; font-weight: 700; color: #64748b; }

    .metrics .lessons { font-size: 0.75rem; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.05em; }

    .sm { padding: 0.5rem 1rem; font-size: 0.75rem; }
    .mt-1 { margin-top: 1rem; }
  `]
})
export class CourseCardComponent {
  @Input() course: any;
  @Input() actionLabel: string = 'View Details';
  @Input() isLocked: boolean = false;
  @Output() onAction = new EventEmitter<any>();
}
