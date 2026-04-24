import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { CertificateService } from '../../services/certificate.service';
import { AssessmentService } from '../../services/assessment.service';
import { CourseCardComponent } from '../course-card/course-card.component';
import { MockPaymentComponent } from '../mock-payment/mock-payment.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, CourseCardComponent, MockPaymentComponent],
  template: `
    <div class="dashboard-wrapper animate-fade-in">
      <header class="dashboard-header">
        <div class="header-content">
          <div class="title-group">
            <h1 class="outfit">Learning <span class="gradient-text">Journey</span></h1>
            <p>Master new skills and track your progress in real-time.</p>
          </div>
          <div class="header-stats" *ngIf="enrolledCourses.length > 0">
             <div class="mini-stat">
                <span class="val">{{ enrolledCourses.length }}</span>
                <span class="lbl">Active Courses</span>
             </div>
             <div class="mini-stat">
                <span class="val">{{ getCompletedCount() }}</span>
                <span class="lbl">Completed</span>
             </div>
          </div>
        </div>
      </header>

      <section class="dashboard-section">
        <h3 class="outfit section-title">Enrolled Curriculum</h3>
        
        <div *ngIf="enrolledLoading" class="loader-box">
           <div class="spinner"></div>
           <p>Syncing your library...</p>
        </div>

        <div *ngIf="!enrolledLoading && enrolledCourses.length === 0" class="empty-state glass-panel">
          <div class="empty-icon">🎒</div>
          <h4 class="outfit">Library is empty</h4>
          <p>Initialize your learning experience by exploring available courses.</p>
          <button (click)="scrollToExplore()" class="btn-primary mt-1">Explore Curriculum</button>
        </div>
        
        <div class="enrollment-stack" *ngIf="!enrolledLoading">
          <div *ngFor="let enrollment of enrolledCourses" class="enrollment-item glass-panel">
            
            <div class="item-left">
              <div class="thumbnail">
                <img [src]="enrollment.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'" alt="Course">
                <div class="complete-badge" *ngIf="enrollment.progress === 100">🏆 Complete</div>
              </div>
              <div class="info">
                <h4 class="outfit">{{ enrollment.title }}</h4>
                <p class="description">{{ enrollment.description | slice:0:100 }}...</p>
                
                <div class="actions mt-1">
                  <button class="btn-primary sm" (click)="viewCourse(enrollment)">
                    {{ enrollment.progress === 100 ? 'Review Module' : 'Resume Learning' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Custom Cyber-Gauge Progress -->
            <div class="progress-vortex">
              <div class="gauge-container">
                 <div class="gauge-root" [style.--p]="enrollment.progress || 0"></div>
                 <div class="gauge-center">
                    <span class="pct outfit">{{ (enrollment.progress || 0) | number:'1.0-0' }}%</span>
                 </div>
              </div>
              <span class="gauge-label">Mastery</span>
            </div>

          </div>
        </div>
      </section>

      <section class="dashboard-section explore-vignette" *ngIf="assessmentScores.length > 0">
        <div class="section-header-flex">
           <h3 class="outfit">Final Assessment Performances</h3>
           <span class="explore-pill" style="background: rgba(99,102,241,0.1); color: var(--primary);">Academic Scores</span>
        </div>
        <div class="score-grid">
          <div *ngFor="let res of assessmentScores" class="score-card glass-panel">
            <div class="card-left">
              <span class="score-percent outfit" [class.success]="res.score >= (res.totalQuestions * 0.7)">
                {{ (res.score / res.totalQuestions) * 100 | number:'1.0-0' }}%
              </span>
              <div class="info">
                <h4 class="outfit">Course Assessment</h4>
                <p class="description">Mastery: {{ res.score }} / {{ res.totalQuestions }} Correct</p>
                <p class="description" style="font-size: 0.8rem;">Session: {{ res.completedAt | date:'medium' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-section explore-vignette" *ngIf="certificates.length > 0">
        <div class="section-header-flex">
           <h3 class="outfit">Official Credentials</h3>
           <span class="explore-pill" style="background: rgba(16,185,129,0.1); color: #10b981;">Verified by Learngrid</span>
        </div>
        <div class="enrollment-stack">
          <div *ngFor="let cert of certificates" class="enrollment-item glass-panel" style="border-left: 4px solid #10b981;">
            <div class="item-left">
               <div class="info">
                 <h4 class="outfit" style="color: #10b981;">Certificate of Completion</h4>
                 <p class="description">Course: <strong>{{ cert.courseTitle }}</strong></p>
                 <p class="description" style="font-size: 0.8rem;">Issued: {{ cert.issuedAt | date:'mediumDate' }} | ID: {{ cert.id }}</p>
                 <div class="actions mt-1">
                   <button class="btn-certificate sm" (click)="downloadOfficialCertificate(cert.id, cert.courseTitle)">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                     Download PDF
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" class="dashboard-section explore-vignette">
        <div class="section-header-flex">
           <h3 class="outfit">Expand Horizons</h3>
           <span class="explore-pill">New Courses Available</span>
        </div>

        <div *ngIf="exploreLoading" class="loader-box">
           <div class="spinner"></div>
           <p>Scanning global catalog...</p>
        </div>

        <div class="course-grid" *ngIf="!exploreLoading">
          <app-course-card 
            *ngFor="let course of exploreCourses" 
            [course]="course" 
            [isLocked]="course.price > 0"
            actionLabel="Initialize Enrollment"
            (onAction)="enroll(course)">
          </app-course-card>
        </div>
      </section>

      <!-- Mock Payment Overlay -->
      <app-mock-payment
         [isOpen]="isPaymentModalOpen"
         [options]="paymentOptions"
         (onPaymentClosed)="isPaymentModalOpen = false">
      </app-mock-payment>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { max-width: 1300px; margin: 0 auto; padding: 6rem 2rem; }
    .dashboard-header { margin-bottom: 4rem; }
    
    .header-content { display: flex; justify-content: space-between; align-items: flex-end; }
    h1 { font-size: 3.5rem; font-weight: 900; margin: 0; color: #1e293b; }
    .title-group p { font-size: 1.1rem; color: #64748b; margin-top: 0.5rem; }
 
    .header-stats { display: flex; gap: 2rem; padding: 1.5rem 2.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .mini-stat { text-align: center; }
    .mini-stat .val { font-size: 2rem; font-weight: 900; color: #1e293b; display: block; line-height: 1; }
    .mini-stat .lbl { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.5rem; display: block; }
 
    .section-title { font-size: 1.5rem; margin-bottom: 2.5rem; color: #1e293b; }
    .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .explore-pill { padding: 0.4rem 1rem; background: #f5f3ff; color: #4f46e5; border-radius: 100px; font-weight: 800; font-size: 0.85rem; }
 
    /* Enrollment Stack */
    .enrollment-stack { display: flex; flex-direction: column; gap: 1.5rem; }
    .enrollment-item { display: flex; justify-content: space-between; align-items: center; padding: 2.5rem; transition: 0.3s; background: white; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .enrollment-item:hover { border-color: #4f46e5; transform: translateX(8px); }
 
    .item-left { display: flex; gap: 2.5rem; align-items: center; flex: 1; }
    .thumbnail { width: 240px; height: 140px; border-radius: 16px; overflow: hidden; flex-shrink: 0; position: relative; }
    .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
    .complete-badge { 
       position: absolute; inset: 0; background: rgba(16, 185, 129, 0.9); backdrop-filter: blur(4px); 
       display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 1rem; 
    }
 
    .info h4 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #1e293b; }
    .info .description { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin: 0; max-width: 600px; }
 
    .actions { display: flex; gap: 1rem; }
    .btn-certificate { 
       background: #fffbeb; color: #d97706; border: 1px solid #fde68a; 
       padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
       transition: 0.3s;
    }
    .btn-certificate:hover { background: #fef3c7; transform: translateY(-2px); }
 
    /* Custom Gauge */
    .progress-vortex { text-align: center; padding-left: 3rem; border-left: 1px solid #f1f5f9; }
    .gauge-container { position: relative; display: inline-block; width: 100px; height: 100px; margin: 0 auto; }
    .gauge-root {
       --p: 0; --b: 10px; --c: #4f46e5;
       width: 100%; height: 100%; border-radius: 50%;
       background: radial-gradient(farthest-side, var(--c) 98%, #0000) top/var(--b) var(--b) no-repeat, 
                   conic-gradient(var(--c) calc(var(--p)*1%), #f1f5f9 0);
       -webkit-mask: radial-gradient(farthest-side, #0000 calc(99% - var(--b)), #000 calc(100% - var(--b)));
       position: absolute; inset: 0;
    }
    .gauge-center { 
       position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2;
    }
    .pct { font-size: 1.5rem; font-weight: 900; color: #1e293b; }
    .gauge-label { display: block; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 800; margin-top: 1rem; }
 
    .empty-state { text-align: center; padding: 6rem; border-style: dashed; background: #f8fafc; border-color: #cbd5e1; }
    .empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }
    
    .course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
 
    .loader-box { text-align: center; padding: 5rem; color: #64748b; }
    .spinner { width: 40px; height: 40px; border: 3px solid #f1f5f9; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
 
    .explore-vignette { margin-top: 6rem; padding-top: 4rem; border-top: 1px solid #f1f5f9; }
    .mt-1 { margin-top: 1.5rem; }
    .sm { padding: 0.6rem 1.25rem; font-size: 0.85rem; }
 
    @media (max-width: 1100px) {
       .enrollment-item { flex-direction: column; align-items: flex-start; gap: 2.5rem; }
       .progress-vortex { width: 100%; border-left: none; border-top: 1px solid #f1f5f9; padding: 2rem 0 0 0; display: flex; align-items: center; justify-content: center; gap: 2rem; }
       .gauge-label { margin-top: 0; }
       .item-left { flex-direction: column; align-items: flex-start; }
       .thumbnail { width: 100%; height: 200px; }
       .header-content { flex-direction: column; align-items: flex-start; gap: 2rem; }
    }
    .score-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .score-card { display: flex; align-items: center; padding: 1.5rem; transition: 0.3s; background: white; border: 1px solid #e2e8f0; border-radius: 16px; }
    .score-percent { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: #fef2f2; color: #ef4444; font-weight: 900; font-size: 1.1rem; border: 1px solid #fee2e2; }
    .score-percent.success { background: #ecfdf5; color: #059669; border-color: #d1fae5; }
    .card-left { display: flex; gap: 1.5rem; align-items: center; }
  `]
})
export class StudentDashboardComponent implements OnInit {
  enrolledCourses: any[] = [];
  exploreCourses: any[] = [];
  certificates: any[] = [];
  assessmentScores: any[] = [];
  enrolledLoading = true;
  exploreLoading = true;

  isPaymentModalOpen = false;
  paymentOptions: any = null;

  constructor(
    private courseService: CourseService, 
    private certificateService: CertificateService,
    private assessmentService: AssessmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEnrolledCourses();
    this.loadExploreCourses();
    this.loadCertificates();
    this.loadAssessmentScores();
  }

  loadCertificates(): void {
    this.certificateService.getMyCertificates().subscribe({
      next: (data) => this.certificates = data,
      error: (err) => console.error('Error loading certificates', err)
    });
  }

  loadEnrolledCourses(): void {
    this.courseService.getMyEnrollments().subscribe({
      next: (data: any[]) => {
        this.enrolledCourses = data;
        
        this.enrolledCourses.forEach(enrollment => {
          const courseId = enrollment.courseId || enrollment.id;
          this.courseService.getEnrollmentStatus(courseId).subscribe({
            next: (status: any) => {
              enrollment.progress = Math.round(status.progress || 0);
            }
          });
        });
        
        this.enrolledLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading enrolled courses', err);
        this.enrolledLoading = false;
      }
    });
  }

  loadExploreCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data: any[]) => {
        this.courseService.getMyEnrollments().subscribe(enrolledRaw => {
          const enrolledIds = enrolledRaw.map((r: any) => r.courseId);
          this.exploreCourses = data.filter(c => !enrolledIds.includes(c.id));
          this.exploreLoading = false;
        });
      },
      error: (err: any) => {
        console.error('Error loading explore courses', err);
        this.exploreLoading = false;
      }
    });
  }

  loadAssessmentScores(): void {
    this.assessmentService.getMyScores().subscribe({
      next: (data) => this.assessmentScores = data,
      error: (err) => console.error('Error loading scores', err)
    });
  }

  getCompletedCount(): number {
    return this.enrolledCourses.filter(e => e.progress === 100).length;
  }

  enroll(course: any): void {
    if (course.price && course.price > 0) {
      if (!window.confirm(`Initiate enrollment in premium module for ₹${course.price}?`)) return;

      this.courseService.createPaymentOrder(course.id).subscribe({
        next: (orderData: any) => {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Learngrid Academy',
            description: `Enrollment for ${course.title}`,
            order_id: orderData.orderId,
            theme: {
              color: '#6366f1'
            },
            handler: (response: any) => {
              this.courseService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                courseId: course.id
              }).subscribe({
                next: () => {
                  this.enrolledLoading = true;
                  this.loadEnrolledCourses();
                  this.loadExploreCourses();
                },
                error: (err: any) => {
                  alert(err.error?.message || 'Payment Verification Failed!');
                }
              });
            }
          };
          
          this.paymentOptions = options;
          this.isPaymentModalOpen = true;
        },
        error: (err: any) => alert(err.error?.message || 'Error initializing simulation payment.')
      });
      return;
    }

    this.courseService.enrollInCourse(course.id).subscribe({
      next: () => {
        this.enrolledLoading = true;
        this.loadEnrolledCourses();
        this.loadExploreCourses();
      },
      error: (err: any) => {
        alert(err.error?.message || 'Enrollment failure');
      }
    });
  }

  viewCourse(enrollment: any): void {
    this.router.navigate(['/course', enrollment.courseId]);
  }

  scrollToExplore(): void {
    document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' });
  }

  downloadOfficialCertificate(uuid: string, courseTitle: string): void {
    this.certificateService.downloadCertificate(uuid, courseTitle);
  }
}
