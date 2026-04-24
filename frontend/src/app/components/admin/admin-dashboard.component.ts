import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CourseService } from '../../services/course.service';
import { ToastService } from '../../services/toast.service';
import { RealtimeDashboardService } from '../../services/realtime-dashboard.service';
import { NgZone } from '@angular/core';

interface AdminStats {
  totalUsers: number;
  studentsCount: number;
  studentsBannedCount: number;
  instructorsCount: number;
  instructorsBannedCount: number;
  adminsCount: number;
  totalCourses: number;
  totalEnrollments: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-dashboard-container animate-fade-in">
      <header class="dashboard-header">
        <div class="title-panel">
          <h1 class="outfit">Command <span class="gradient-text">Center</span></h1>
          <p>Global Intelligence & Platform Moderation</p>
        </div>
        
        <nav class="cyber-tabs glass-panel">
          <button [class.active]="activeTab === 'overview'" (click)="setTab('overview')">Overview</button>
          <button [class.active]="activeTab === 'users'" (click)="setTab('users')">Moderation</button>
          <button [class.active]="activeTab === 'courses'" (click)="setTab('courses')">Inventory</button>
          <button [class.active]="activeTab === 'approvals'" (click)="setTab('approvals')">Approvals</button>
        </nav>
      </header>

      <main class="dashboard-body">
        <!-- OVERVIEW -->
        <div *ngIf="activeTab === 'overview'" class="tab-content animate-fade-in">
          <div class="stats-bento">
            <div class="bento-card total glass-panel" (click)="setTab('users')">
              <span class="label">Total Population</span>
              <span class="value">{{ stats.totalUsers }}</span>
              <div class="glow-blob"></div>
            </div>
            
            <div class="bento-card students glass-panel" (click)="setTab('users')">
               <div class="card-header-flex">
                 <span class="label">Student Body</span>
                 <span class="trend">Live</span>
               </div>
               <div class="dual-value">
                 <span class="val active">{{ stats.studentsCount }}</span>
                 <span class="sep">/</span>
                 <span class="val banned">{{ stats.studentsBannedCount }}</span>
               </div>
               <div class="progress-track"><div class="fill student" [style.width.%]="(stats.studentsCount / (stats.totalUsers || 1)) * 100"></div></div>
            </div>

            <div class="bento-card instructors glass-panel" (click)="setTab('users')">
               <div class="card-header-flex">
                 <span class="label">Instructors</span>
                 <span class="trend">Live</span>
               </div>
               <div class="dual-value">
                 <span class="val active">{{ stats.instructorsCount }}</span>
                 <span class="sep">/</span>
                 <span class="val banned">{{ stats.instructorsBannedCount }}</span>
               </div>
               <div class="progress-track"><div class="fill instructor" [style.width.%]="(stats.instructorsCount / (stats.totalUsers || 1)) * 100"></div></div>
            </div>
          </div>

          <div class="hero-section glass-panel mt-2 animate-fade-in">
            <div class="section-title-flex">
               <h3 class="outfit">Instructor Queue</h3>
               <span class="count-badge">{{ pendingInstructors.length }} Pending</span>
            </div>
            <div class="table-frame">
              <table class="cyber-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Identity</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of pendingInstructors">
                    <td>
                      <div class="user-cell">
                        <div class="avatar-sm">{{ user.username.charAt(0) }}</div>
                        <strong>{{ user.username }}</strong>
                      </div>
                    </td>
                    <td class="text-muted">{{ user.email }}</td>
                    <td>
                      <div class="action-btns">
                        <button class="btn-primary sm" (click)="approveUser(user.id)">Verify</button>
                        <button class="btn-secondary sm" (click)="rejectUser(user.id)">Deny</button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="pendingInstructors.length === 0">
                    <td colspan="3" class="empty-state">No pending applications found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- USERS -->
        <div *ngIf="activeTab === 'users'" class="tab-content animate-fade-in">
           <div class="moderation-grid">
              <!-- ADMINS -->
              <div class="glass-panel section-card">
                 <h3 class="outfit">Administrative Staff</h3>
                 <ng-container *ngTemplateOutlet="userTableTemplate; context: { users: getAdmins(), canModerate: false }"></ng-container>
              </div>
              <!-- INSTRUCTORS -->
              <div class="glass-panel section-card">
                 <h3 class="outfit">Course Authors</h3>
                 <ng-container *ngTemplateOutlet="userTableTemplate; context: { users: getInstructors(), canModerate: true }"></ng-container>
              </div>
              <!-- STUDENTS -->
              <div class="glass-panel section-card">
                 <h3 class="outfit">Learner Database</h3>
                 <ng-container *ngTemplateOutlet="userTableTemplate; context: { users: getStudents(), canModerate: true }"></ng-container>
              </div>
           </div>
        </div>

        <!-- COURSES -->
        <div *ngIf="activeTab === 'courses'" class="tab-content animate-fade-in">
          <div class="glass-panel">
            <div class="section-title-flex">
               <h3 class="outfit">Global Catalog</h3>
               <button class="btn-secondary sm" (click)="loadData()">Sync Data 🔄</button>
            </div>
            <div class="table-frame">
              <table class="cyber-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Instructor</th>
                    <th>Impact</th>
                    <th>Engagement</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let course of courses">
                    <td><strong class="title-highlight">{{ course.title }}</strong></td>
                    <td>
                       <div class="instructor-tag">
                         <span class="point"></span>
                         {{ course.instructorName }}
                       </div>
                    </td>
                    <td><span class="count">{{ course.enrollmentCount }}</span> enrolled</td>
                    <td>
                      <div class="engagement-track">
                        <div class="fill" [style.width.%]="(course.enrollmentCount / (stats.totalUsers || 1)) * 100"></div>
                      </div>
                    </td>
                    <td>
                      <button class="btn-secondary sm" (click)="viewCourseDetails(course)">Analyze</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- APPROVALS -->
        <div *ngIf="activeTab === 'approvals'" class="tab-content animate-fade-in">
           <div class="glass-panel">
              <h3 class="outfit mb-2">Content Review Queue</h3>
              <div class="table-frame">
                 <table class="cyber-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Author</th>
                        <th>Price Point</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let pc of pendingCourses">
                        <td><strong>{{ pc.title }}</strong></td>
                        <td class="text-muted">{{ pc.instructorName }}</td>
                        <td><span class="price-pill">\${{ pc.price || 0 }}</span></td>
                        <td>
                          <div class="action-btns">
                            <button class="btn-primary sm" (click)="approveCourse(pc.id)">Publish</button>
                            <button class="btn-secondary sm" (click)="rejectCourse(pc.id)">Reject</button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </main>

      <!-- REUSABLE TABLE -->
      <ng-template #userTableTemplate let-filteredUsers="users" let-canModerate="canModerate">
         <div class="table-frame mt-1">
            <table class="cyber-table">
               <thead>
                 <tr>
                   <th>User</th>
                   <th>Status</th>
                   <th>Moderation</th>
                 </tr>
               </thead>
               <tbody>
                 <tr *ngFor="let user of filteredUsers" [class.banned]="user.isBanned">
                   <td>
                     <div class="user-info">
                       <span class="mail">{{ user.email }}</span>
                     </div>
                   </td>
                   <td>
                     <span class="status-badge" [class.danger]="user.isBanned">
                       {{ user.isBanned ? 'Restricted' : 'Active' }}
                     </span>
                   </td>
                   <td>
                     <div class="mod-controls">
                        <select class="cyber-select" [ngModel]="getERole(user)" (ngModelChange)="changeUserRole(user.id, $event)">
                          <option value="ROLE_STUDENT">Student</option>
                          <option value="ROLE_INSTRUCTOR">Instructor</option>
                          <option value="ROLE_ADMIN">Admin</option>
                        </select>
                        <button class="icon-btn danger" *ngIf="canModerate && !user.isBanned && !isUserAdmin(user)" (click)="banUser(user.id)" title="Restrict Access">🚫</button>
                        <button class="icon-btn success" *ngIf="canModerate && user.isBanned && !isUserAdmin(user)" (click)="banUser(user.id)" title="Restore Access">🔓</button>
                        <button class="icon-btn warning" *ngIf="isInstructor(user)" (click)="warnUser(user.id)" title="Issue Warning">⚠️</button>
                     </div>
                   </td>
                 </tr>
               </tbody>
            </table>
         </div>
      </ng-template>

      <!-- MODAL -->
      <div *ngIf="selectedCourse" class="modal-root animate-fade-in" (click)="selectedCourse = null">
        <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
           <div class="modal-top">
             <h2 class="outfit">{{ selectedCourse.title }} Intelligence</h2>
           </div>
           <div class="modal-body">
              <div class="data-row"><label>Principal Instructor</label> <span>{{ selectedCourse.instructorName }}</span></div>
              <div class="data-row"><label>Active Enrollment</label> <span class="accent">{{ selectedCourse.enrollmentCount }} Students</span></div>
           </div>
           <div class="modal-actions">
              <button class="btn-primary" (click)="selectedCourse = null">Close Intel</button>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container { max-width: 1400px; margin: 0 auto; padding: 4rem 2rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; }
    
    h1 { font-size: 3rem; font-weight: 900; margin: 0; }
    .title-panel p { color: var(--text-muted); margin: 0.5rem 0 0; font-size: 1.1rem; }

    .cyber-tabs { display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: 16px; margin-bottom: 0px; background: #fff; border: 1px solid #e2e8f0; }
    .cyber-tabs button { background: none; border: none; color: #64748b; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .cyber-tabs button:hover { color: #1e293b; background: #f8fafc; }
    .cyber-tabs button.active { background: #4f46e5; color: #fff; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2); }

    /* Bento Stats */
    .stats-bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
    .bento-card { padding: 2rem; position: relative; overflow: hidden; transition: 0.3s; cursor: pointer; background: white; border: 1px solid #e2e8f0; border-radius: 24px; }
    .bento-card:hover { transform: translateY(-5px); border-color: #4f46e5; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .bento-card.total { background: linear-gradient(135deg, #f5f3ff, transparent); }
    
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 800; display: block; margin-bottom: 1rem; }
    .value { font-size: 3.5rem; font-weight: 900; color: #0f172a; line-height: 1; }
    
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .trend { font-size: 0.7rem; color: var(--accent); background: rgba(16, 185, 129, 0.1); padding: 0.2rem 0.5rem; border-radius: 100px; font-weight: 800; }
    
    .dual-value { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 1.5rem; }
    .dual-value .val { font-size: 2.5rem; font-weight: 900; color: #1e293b; }
    .dual-value .val.banned { color: #ef4444; font-size: 1.5rem; }
    .dual-value .sep { color: #cbd5e1; font-size: 1.5rem; }
    
    .progress-track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
    .progress-track .fill { height: 100%; border-radius: 10px; }
    .fill.student { background: var(--primary); box-shadow: 0 0 10px var(--primary-glow); }
    .fill.instructor { background: var(--secondary); box-shadow: 0 0 10px var(--secondary-glow); }

    /* Tables */
    .section-title-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .count-badge { padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.05); border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: var(--primary); }
    
    .cyber-table { width: 100%; border-collapse: collapse; }
    .cyber-table th { text-align: left; padding: 1.2rem 1rem; color: #475569; font-size: 0.75rem; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #f1f5f9; }
    .cyber-table td { padding: 1.5rem 1rem; border-bottom: 1px solid #f8fafc; color: #334155; }
    .cyber-table tr:hover td { background: #f8fafc; }
    
    .user-cell { display: flex; align-items: center; gap: 1rem; }
    .avatar-sm { width: 32px; height: 32px; background: var(--primary-glow); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem; }
    
    .status-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(16, 185, 129, 0.1); color: var(--accent); }
    .status-badge.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .btn-primary.sm, .btn-secondary.sm { padding: 0.5rem 1rem; font-size: 0.75rem; border-radius: 8px; }
    .action-btns { display: flex; gap: 0.5rem; }

    .moderation-grid { display: flex; flex-direction: column; gap: 2rem; }
    .section-card { padding: 2rem; }
    
    .title-highlight { color: #0f172a; font-size: 1.1rem; font-weight: 700; }
    .instructor-tag { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
    .point { width: 6px; height: 6px; background: var(--secondary); border-radius: 50%; box-shadow: 0 0 8px var(--secondary-glow); }
    
    .engagement-track { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; }
    .engagement-track .fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 10px; }

    .price-pill { padding: 0.3rem 0.8rem; background: rgba(16, 185, 129, 0.1); color: var(--accent); border-radius: 100px; font-weight: 800; font-size: 0.85rem; }

    .mod-controls { display: flex; gap: 0.5rem; align-items: center; }
    .cyber-select { background: #fff; border: 1px solid #e2e8f0; color: #1e293b; padding: 0.4rem; border-radius: 8px; font-size: 0.8rem; outline: none; }
    .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; background: rgba(255,255,255,0.05); }
    .icon-btn:hover { transform: scale(1.1); }
    .icon-btn.danger:hover { background: #ef4444; }
    .icon-btn.warning:hover { background: #f59e0b; }
    .icon-btn.success:hover { background: var(--accent); }

    .modal-root { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-card { width: 100%; max-width: 500px; padding: 3rem; border-color: var(--primary-glow); }
    .data-row { display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
    .data-row label { color: #64748b; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; }
    .data-row span { font-weight: 700; color: #1e293b; }
    .data-row span.accent { color: #4f46e5; }

    .mt-1 { margin-top: 1rem; }
    .mt-2 { margin-top: 2rem; }
    .mb-2 { margin-bottom: 2rem; }
    .text-muted { color: var(--text-muted); }
    .empty-state { text-align: center; color: var(--text-muted); padding: 3rem !important; font-style: italic; }
    
    @media (max-width: 1100px) {
       .stats-bento { grid-template-columns: 1fr; }
       .moderation-grid { grid-template-columns: 1fr; }
       .dashboard-header { flex-direction: column; align-items: flex-start; gap: 2rem; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'overview' | 'users' | 'courses' | 'approvals' = 'overview';
  
  stats: AdminStats = {
    totalUsers: 0,
    studentsCount: 0,
    studentsBannedCount: 0,
    instructorsCount: 0,
    instructorsBannedCount: 0,
    adminsCount: 0,
    totalCourses: 0,
    totalEnrollments: 0
  };

  pendingInstructors: any[] = [];
  pendingCourses: any[] = [];
  users: any[] = [];
  courses: any[] = [];
  selectedCourse: any = null;

  constructor(
    private adminService: AdminService,
    private courseService: CourseService,
    private toast: ToastService,
    private realtimeService: RealtimeDashboardService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.realtimeService.listenForAdminUpdates().subscribe(() => {
      console.log('Real-time event received for Admin Dashboard. Syncing data...');
      this.ngZone.run(() => {
        this.loadData();
      });
    });
  }

  ngOnDestroy(): void {
  }

  loadData() {
    this.adminService.getStats().subscribe(data => this.stats = data);
    this.adminService.getPendingInstructors().subscribe(data => this.pendingInstructors = data);
    this.adminService.getUsers().subscribe(data => this.users = data);
    this.adminService.getCourses().subscribe(data => this.courses = data);
    this.courseService.getPendingCourses().subscribe(data => this.pendingCourses = data);
  }

  setTab(tab: 'overview' | 'users' | 'courses' | 'approvals') {
    this.activeTab = tab;
  }

  approveUser(id: number) {
    this.adminService.approveInstructor(id).subscribe({
      next: () => {
        this.toast.success('Instructor verified.');
        this.loadData();
      },
      error: () => this.toast.error('Verification failed.')
    });
  }

  rejectUser(id: number) {
    this.adminService.rejectInstructor(id).subscribe({
      next: () => {
        this.toast.info('Application processed.');
        this.loadData();
      },
      error: () => this.toast.error('Action failed.')
    });
  }

  changeUserRole(userId: number, newRoleName: string) {
    this.adminService.updateUserRole(userId, newRoleName).subscribe({
      next: () => {
        this.toast.success('Role updated.');
        this.loadData();
      },
      error: () => this.toast.error('Role update failed.')
    });
  }

  banUser(userId: number) {
    this.adminService.banUser(userId).subscribe({
      next: (res) => {
        this.toast.info(res.message);
        this.loadData();
      },
      error: (err) => this.toast.error('Moderation failed.')
    });
  }

  warnUser(userId: number) {
    const reason = window.prompt("Reason for disciplinary warning:", "Failure to adhere to platform quality standards");
    if (reason === null) return;

    this.adminService.warnUser(userId, reason).subscribe({
      next: (res) => {
        this.toast.warning(res.message);
        this.loadData();
      },
      error: () => this.toast.error('Warning failed.')
    });
  }

  viewCourseDetails(course: any) {
    this.selectedCourse = course;
  }

  approveCourse(id: number) {
    this.courseService.approveCourse(id).subscribe({
      next: () => {
        this.toast.success('Course published.');
        this.loadData();
      },
      error: () => this.toast.error('Approval failed.')
    });
  }

  rejectCourse(id: number) {
    if(!confirm('Reject and remove this course submission?')) return;
    this.courseService.rejectCourse(id).subscribe({
      next: () => {
        this.toast.info('Course submission rejected.');
        this.loadData();
      },
      error: () => this.toast.error('Action failed.')
    });
  }

  getAdmins() { return this.users.filter(u => this.getERole(u) === 'ROLE_ADMIN'); }
  getInstructors() { return this.users.filter(u => this.getERole(u) === 'ROLE_INSTRUCTOR'); }
  getStudents() { return this.users.filter(u => this.getERole(u) === 'ROLE_STUDENT'); }

  isInstructor(user: any): boolean { return this.getERole(user) === 'ROLE_INSTRUCTOR'; }
  isStudent(user: any): boolean { return this.getERole(user) === 'ROLE_STUDENT'; }

  isUserAdmin(user: any): boolean {
    return this.getERole(user) === 'ROLE_ADMIN';
  }

  getERole(user: any): string {
    return user.roles?.[0] || 'ROLE_STUDENT';
  }
}
