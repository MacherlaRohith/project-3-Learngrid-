import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CourseService, Course, Lesson, CourseStats } from '../../services/course.service';
import { QuizService, Quiz } from '../../services/quiz.service';
import { ToastService } from '../../services/toast.service';
import { CertificateService } from '../../services/certificate.service';
import { AssessmentService } from '../../services/assessment.service';

const API_URL = 'http://localhost:8080/api/';

@Component({
  selector: 'app-course-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="manage-container animate-fade-in" *ngIf="course">
       <header class="manage-header">
        <div class="header-content">
          <div class="header-left">
            <a routerLink="/instructor" class="back-pill"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Studio</a>
            <h1 class="outfit">Command: <span class="gradient-text">{{ course.title }}</span></h1>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" (click)="deleteCourse()">Destroy Course</button>
            <button class="btn-primary" (click)="saveCourseSettings()">Persist Settings</button>
          </div>
        </div>
      </header>

      <div class="dashboard-grid">
        <div class="main-column">
          <!-- Course Identity -->
          <div class="glass-panel section-card animate-fade-in">
            <h3 class="outfit section-title">Course Identity</h3>
            <div class="form-grid">
               <div class="form-group">
                 <label>Global Title</label>
                 <input type="text" class="glass-input" [(ngModel)]="course.title" />
               </div>
               <div class="form-group">
                 <label>Access Price ($)</label>
                 <input type="number" class="glass-input" [(ngModel)]="course.price" />
               </div>
            </div>
            <div class="form-group mt-1">
              <label>Syllabus Description</label>
              <textarea class="glass-input" rows="4" [(ngModel)]="course.description"></textarea>
            </div>
          </div>

          <!-- Content Architect -->
          <div class="glass-panel section-card animate-fade-in" style="animation-delay: 0.1s">
            <div class="section-title-flex">
              <h3 class="outfit">Lesson Infrastructure</h3>
              <button class="btn-add sm" (click)="showLessonForm = true">+ Initialize Lesson</button>
            </div>
            
            <div class="lesson-builder glass-panel" *ngIf="showLessonForm">
                <h4 class="outfit">New Lesson Module</h4>
                <input type="text" class="glass-input mb-1" placeholder="Module Title" [(ngModel)]="newLesson.title">
                <textarea class="glass-input mb-1" placeholder="Theoretical content or instructions..." [(ngModel)]="newLesson.content"></textarea>
                
                <div class="upload-vortex mb-1">
                  <label class="drop-zone" [class.uploading]="uploadProgress > 0">
                    <input type="file" (change)="handleFileUpload($event)" accept="video/*" hidden>
                    <div class="vortex-content">
                       <span class="icon">{{ uploadProgress > 0 ? '⚡' : '🚀' }}</span>
                       <span class="text">{{ uploadProgress > 0 ? 'Syncing: ' + uploadProgress + '%' : (newLesson.videoUrl ? 'Video Stream Ready' : 'Drop Video Asset Here') }}</span>
                    </div>
                  </label>
                  <div class="progress-bar-root" *ngIf="uploadProgress > 0">
                    <div class="progress-fill" [style.width.%]="uploadProgress"></div>
                  </div>
                </div>
                
                <input type="text" class="glass-input mb-1" placeholder="Or provide direct Asset URL" [(ngModel)]="newLesson.videoUrl">
                
                <div class="builder-actions">
                  <button class="btn-ghost" (click)="showLessonForm = false">Discard</button>
                  <button class="btn-primary" (click)="addLesson()">Commit Lesson</button>
                </div>
            </div>

            <div class="content-queue">
              <div class="lesson-stack-item glass-panel" *ngFor="let lesson of course.lessons; let i = index">
                <div class="lesson-main">
                  <span class="index">0{{ i + 1 }}</span>
                  <div class="lesson-data">
                    <h4 class="outfit">{{ lesson.title }}</h4>
                    <span class="meta-tags">
                       <span class="tag" [class.has-quiz]="hasQuizzes(lesson.id)">{{ hasQuizzes(lesson.id) ? quizzesMap[lesson.id!].length + ' Active Quizzes' : 'No Quizzes Found' }}</span>
                       <span class="tag">Video Managed</span>
                    </span>
                  </div>
                </div>
                <button class="btn-secondary sm" (click)="openQuizModal(lesson)">+ Inject Quiz</button>
              </div>
            </div>
          </div>

          <!-- AI Assessment Intel -->
          <div class="glass-panel section-card animate-fade-in" style="animation-delay: 0.12s">
            <div class="section-title-flex">
              <h3 class="outfit">Final Assessment (AI Powered)</h3>
              <button class="btn-primary" (click)="generateAssessment()" [disabled]="generatingAssessment">
                {{ generatingAssessment ? 'Synthesizing...' : '⚡ Generate AI Assessment' }}
              </button>
            </div>
            <p class="text-muted" style="margin-top: -1.5rem; margin-bottom: 2rem;">
              Our AI will analyze your course module titles and descriptions to create a 20-question randomized final assessment. 
              Students will take 12 random questions from this pool once they complete the course.
            </p>
            <div class="assessment-status glass-panel" *ngIf="assessmentPoolCount > 0">
               <span class="status-icon">✅</span>
               <div class="status-info">
                 <h4 class="outfit">Assessment Infrastructure Ready</h4>
                 <p>{{ assessmentPoolCount }} Questions in Global Pool</p>
               </div>
            </div>
          </div>

          <!-- Course Notes Section -->
          <div class="glass-panel section-card animate-fade-in" style="animation-delay: 0.15s">
            <div class="section-title-flex">
              <h3 class="outfit">Study Notes</h3>
              <button class="btn-add sm" (click)="showNoteForm = true">+ Add Note</button>
            </div>
            
            <div class="lesson-builder glass-panel" *ngIf="showNoteForm">
                <h4 class="outfit">New Study Note</h4>
                <input type="text" class="glass-input mb-1" placeholder="Note Title" [(ngModel)]="newNote.title">
                <textarea class="glass-input mb-1" rows="4" placeholder="Optional description or summary..." [(ngModel)]="newNote.content"></textarea>
                
                <div class="upload-vortex mb-1">
                  <label class="drop-zone" [class.has-file]="noteFile">
                    <input type="file" (change)="onNoteFileSelect($event)" accept=".pdf,.doc,.docx,.ppt,.pptx" hidden>
                    <div class="vortex-content">
                       <span class="icon">{{ noteFile ? '✅' : '📄' }}</span>
                       <span class="text">{{ noteFile ? noteFile.name : 'Click to upload PDF / Document' }}</span>
                       <span class="hint" *ngIf="!noteFile">Supports PDF, DOC, DOCX, PPT (max 500MB)</span>
                    </div>
                  </label>
                </div>

                <div class="builder-actions">
                  <button class="btn-ghost" (click)="showNoteForm = false; noteFile = null">Discard</button>
                  <button class="btn-primary" (click)="addNote()">Publish Note</button>
                </div>
            </div>

            <div class="content-queue">
              <div class="lesson-stack-item glass-panel note-item" *ngFor="let note of notes; let i = index">
                <div class="lesson-main" style="flex: 1; min-width: 0;">
                  <span class="index">{{ note.pdfUrl ? '📄' : '📝' }}</span>
                  <div class="lesson-data" style="flex: 1; min-width: 0;">
                    <div *ngIf="editingNoteId !== note.id">
                      <h4 class="outfit">{{ note.title }}</h4>
                      <p class="note-preview" *ngIf="note.content">{{ note.content | slice:0:120 }}{{ note.content?.length > 120 ? '...' : '' }}</p>
                      <span class="pdf-badge" *ngIf="note.pdfUrl">
                        <a [href]="'http://localhost:8080' + note.pdfUrl" target="_blank" class="pdf-link">📎 {{ note.originalFileName || 'View Attached File' }}</a>
                      </span>
                    </div>
                    <div *ngIf="editingNoteId === note.id">
                      <input type="text" class="glass-input mb-1" [(ngModel)]="editNote.title">
                      <textarea class="glass-input" rows="4" [(ngModel)]="editNote.content"></textarea>
                    </div>
                  </div>
                </div>
                <div class="note-actions">
                  <button *ngIf="editingNoteId !== note.id" class="btn-ghost sm" (click)="startEditNote(note)">Edit</button>
                  <button *ngIf="editingNoteId === note.id" class="btn-primary sm" (click)="saveEditNote(note.id)">Save</button>
                  <button *ngIf="editingNoteId === note.id" class="btn-ghost sm" (click)="editingNoteId = null">Cancel</button>
                  <button class="btn-ghost sm danger" (click)="deleteNote(note.id)">Delete</button>
                </div>
              </div>
              <p class="no-data text-muted" *ngIf="notes.length === 0 && !showNoteForm">No study notes yet. Add notes for your enrolled students.</p>
            </div>
          </div>
        </div>

        <div class="side-column">
          <!-- Performance Intelligence -->
          <div class="glass-panel section-card stats-card animate-fade-in" style="animation-delay: 0.2s">
            <h3 class="outfit">System Intelligence</h3>
            
            <div class="stat-unit">
                <span class="label">Revenue Stream</span>
                <div class="value-highlight outfit">{{ (stats?.totalRevenue || 0) | currency:'USD' }}</div>
            </div>

            <div class="stat-unit mt-2">
                <span class="label">Active Enrollment</span>
                <div class="value outfit">{{ stats?.totalEnrollments || 0 }} <span class="unit">Students</span></div>
            </div>

            <div class="visual-intel mt-2">
                <div class="intel-header">
                    <span>Engagement Velocity</span>
                    <span class="intel-trend">L7D</span>
                </div>
                <div class="svg-container">
                    <svg viewBox="0 0 100 40" class="velocity-chart">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
                          </linearGradient>
                        </defs>
                        <path class="velocity-line" [attr.d]="getTrendPath()"></path>
                        <path class="velocity-area" [attr.d]="getTrendAreaPath()"></path>
                    </svg>
                </div>
            </div>

            <div class="visual-intel mt-2 text-center">
                <div class="intel-header">Completion Density</div>
                <div class="density-gauge">
                    <div class="gauge-ring" [style.--p]="stats?.completionRate || 0">
                        <span class="gauge-val outfit">{{ (stats?.completionRate || 0) | number:'1.0-0' }}%</span>
                    </div>
                </div>
                <p class="gauge-footer text-muted">Percent of learners completing all modules.</p>
            </div>
          </div>

          <!-- Graduate Certificates Data -->
          <div class="glass-panel section-card animate-fade-in" style="animation-delay: 0.3s" *ngIf="certificates.length > 0">
            <h3 class="outfit">Graduates</h3>
            <div class="content-queue">
              <div class="lesson-stack-item glass-panel" *ngFor="let cert of certificates" style="padding: 1rem;">
                <div class="lesson-main">
                  <div class="lesson-data">
                    <h4 class="outfit" style="font-size: 1rem; color: #10b981;">{{ cert.studentName }}</h4>
                    <span class="meta-tags">
                       <span class="tag">{{ cert.issuedAt | date:'shortDate' }}</span>
                    </span>
                  </div>
                </div>
                <button class="btn-primary sm" style="font-size: 0.7rem; padding: 0.4rem 0.8rem;" (click)="downloadCert(cert.id)">View PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Injection Modal -->
      <div class="modal-root animate-fade-in" *ngIf="showQuizModal && activeLesson">
        <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-top">
            <h2 class="outfit">Inject Quiz Terminal</h2>
            <button class="close-btn" (click)="showQuizModal = false">&times;</button>
          </div>
          <p class="modal-subtitle text-muted">Into Lesson: {{ activeLesson.title }}</p>
          
          <div class="form-group mt-1">
            <label>Intel Inquiry (Question)</label>
            <input type="text" class="glass-input" [(ngModel)]="newQuiz.question" placeholder="e.g. Identify the core methodology...">
          </div>
          
          <div class="form-group mt-1">
            <label>Response Candidates (Comma separated)</label>
            <textarea class="glass-input" rows="3" [(ngModel)]="newQuiz.options" placeholder="Candidate A, Candidate B, Candidate C"></textarea>
          </div>
          
          <div class="form-grid mt-1">
            <div class="form-group">
              <label>Correct Vector</label>
              <input type="text" class="glass-input" [(ngModel)]="newQuiz.correctAnswer" placeholder="Exact string match">
            </div>
            <div class="form-group">
              <label>Trigger Pulse (sec)</label>
              <input type="number" class="glass-input" [(ngModel)]="newQuiz.triggerTimestamp" placeholder="0">
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-ghost" (click)="showQuizModal = false">Discard</button>
            <button class="btn-primary" (click)="saveQuiz()">Commit Module</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-container { max-width: 1300px; margin: 0 auto; padding: 6rem 2rem; }
    .manage-header { margin-bottom: 3.5rem; }
    .header-content { display: flex; justify-content: space-between; align-items: flex-end; }
    
    .back-pill { 
       display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; background: #fff; 
       border-radius: 100px; color: #64748b; font-size: 0.8rem; font-weight: 700; text-decoration: none; 
       margin-bottom: 1rem; border: 1px solid #e2e8f0; transition: 0.3s;
       box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .back-pill:hover { background: #f8fafc; color: #4f46e5; border-color: #4f46e5; }
    
    h1 { font-size: 2.5rem; font-weight: 900; margin: 0; color: #1e293b; }
    .header-actions { display: flex; gap: 1rem; }

    .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: flex-start; }
    
    .section-card { padding: 2.5rem; margin-bottom: 2rem; background: white; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .section-title { margin-bottom: 2rem; font-size: 1.5rem; color: #1e293b; }
    .section-title-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    
    .form-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 1.5rem; }
    .form-group label { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.6rem; letter-spacing: 0.05em; }

    /* Lesson Builder */
    .lesson-builder { background: #f8fafc; border: 1px solid #e2e8f0; padding: 2rem; margin-bottom: 2.5rem; border-radius: 16px; }
    .builder-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    
    .upload-vortex { position: relative; }
    .drop-zone { 
       display: block; padding: 3rem; border: 2px dashed #cbd5e1; border-radius: 20px; 
       text-align: center; cursor: pointer; transition: 0.3s; background: white;
    }
    .drop-zone:hover { border-color: #4f46e5; background: #f5f3ff; }
    .vortex-content { display: flex; flex-direction: column; gap: 1rem; }
    .vortex-content .icon { font-size: 2.5rem; }
    .vortex-content .text { font-size: 0.9rem; color: #64748b; font-weight: 700; }
    
    .progress-bar-root { height: 6px; background: #f1f5f9; border-radius: 10px; margin-top: 1rem; overflow: hidden; }
    .progress-fill { height: 100%; background: #4f46e5; transition: width 0.3s; }

    /* Lesson Queue */
    .content-queue { display: flex; flex-direction: column; gap: 1.25rem; }
    .lesson-stack-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: white; border: 1px solid #e2e8f0; border-radius: 16px; }
    .lesson-main { display: flex; align-items: center; gap: 2rem; }
    .lesson-main .index { font-size: 1.5rem; font-weight: 900; color: #4f46e5; opacity: 0.2; }
    .lesson-data h4 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #1e293b; }
    
    .meta-tags { display: flex; gap: 0.75rem; }
    .tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; background: #f1f5f9; color: #64748b; padding: 0.2rem 0.6rem; border-radius: 4px; }
    .tag.has-quiz { background: #ecfdf5; color: #059669; }

    /* Stats Intelligence */
    .stat-unit { margin-bottom: 2.5rem; }
    .stat-unit .label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.75rem; display: block; }
    .value { font-size: 3rem; font-weight: 900; color: #1e293b; line-height: 1; }
    .value .unit { font-size: 1.25rem; color: #64748b; }
    .value-highlight { font-size: 3.5rem; font-weight: 900; color: #059669; line-height: 1; }
    
    .visual-intel { background: #f8fafc; border-radius: 20px; padding: 1.5rem; border: 1px solid #e2e8f0; }
    .intel-header { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 800; color: #64748b; margin-bottom: 1.5rem; text-transform: uppercase; }
    .intel-trend { color: #4f46e5; }

    .velocity-chart { width: 100%; height: 100px; overflow: visible; }
    .velocity-line { fill: none; stroke: #4f46e5; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
    .velocity-area { fill: rgba(79, 70, 229, 0.05); }

    .density-gauge { position: relative; display: flex; justify-content: center; margin: 2rem 0; }
    .gauge-ring {
      --p: 0; --w: 140px; --b: 14px; --c: #4f46e5;
      width: var(--w); aspect-ratio: 1; position: relative; display: grid; place-content: center;
    }
    .gauge-ring:before {
      content: ""; position: absolute; border-radius: 50%; inset: 0;
      background: radial-gradient(farthest-side, var(--c) 98%, #0000) top/var(--b) var(--b) no-repeat, conic-gradient(var(--c) calc(var(--p)*1%), #f1f5f9 0);
      -webkit-mask: radial-gradient(farthest-side, #0000 calc(99% - var(--b)), #000 calc(100% - var(--b)));
    }
    .gauge-val { font-size: 2rem; font-weight: 900; color: #1e293b; }
    .gauge-footer { font-size: 0.8rem; margin: 1rem 0 0 0; color: #64748b; }

    /* Modals */
    .modal-root { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
    .modal-card { width: 100%; max-width: 600px; padding: 3rem; background: white; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .modal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .modal-subtitle { font-size: 0.9rem; margin-bottom: 2rem; color: #64748b; }
    .close-btn { background: none; border: none; color: #94a3b8; font-size: 2rem; cursor: pointer; line-height: 1; }

    @media (max-width: 1024px) {
       .dashboard-grid { grid-template-columns: 1fr; }
    }
    .mt-1 { margin-top: 1.5rem; }
    .mt-2 { margin-top: 2.5rem; }
    .mb-1 { margin-bottom: 1.25rem; }
    .text-center { text-align: center; }
    .note-item { flex-wrap: wrap; }
    .note-preview { font-size: 0.85rem; color: #64748b; margin: 0.3rem 0 0 0; line-height: 1.5; }
    .note-actions { display: flex; gap: 0.5rem; align-items: center; }
    .danger { color: #ef4444 !important; }
    .danger:hover { background: #fef2f2 !important; }
    .no-data { font-size: 0.9rem; text-align: center; padding: 2rem; font-style: italic; color: #64748b; }
    .pdf-badge { display: inline-block; margin-top: 0.5rem; }
    .pdf-link { color: #4f46e5; font-size: 0.8rem; font-weight: 700; text-decoration: none; transition: 0.2s; }
    .pdf-link:hover { color: #4338ca; text-decoration: underline; }
    .drop-zone.has-file { border-color: #10b981; background: #ecfdf5; }
    .hint { font-size: 0.7rem; color: #64748b; }
    .btn-ghost { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; color: #64748b; font-weight: 600; cursor: pointer; }
    .btn-ghost:hover { background: #f8fafc; color: #1e293b; }
    .btn-add { background: #f5f3ff; color: #4f46e5; border: 1px solid #ddd6fe; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .btn-add:hover { background: #ede9fe; }
  `]
})
export class CourseManageComponent implements OnInit {
  courseId: number | null = null;
  course: Course | null = null;
  stats: CourseStats | null = null;
  quizzesMap: { [lessonId: number]: Quiz[] } = {};
  certificates: any[] = [];
  generatingAssessment = false;
  assessmentPoolCount = 0;

  showLessonForm = false;
  newLesson: Lesson = { title: '', content: '', videoUrl: '' };
  uploadProgress = 0;

  showQuizModal = false;
  activeLesson: Lesson | null = null;
  newQuiz: Quiz = { question: '', options: '', correctAnswer: '', triggerTimestamp: 0 };

  // Notes
  notes: any[] = [];
  showNoteForm = false;
  newNote = { title: '', content: '' };
  noteFile: File | null = null;
  editingNoteId: number | null = null;
  editNote = { title: '', content: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private courseService: CourseService,
    private quizService: QuizService,
    private toastService: ToastService,
    private certificateService: CertificateService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.courseId = +id;
        this.loadCourse();
      }
    });
  }

  loadCourse() {
    if (!this.courseId) return;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.loadStats();
        if(this.course && this.course.lessons) {
          this.course.lessons.forEach(l => {
            if(l.id) this.loadQuizzes(l.id);
          });
        }
        this.loadCertificates();
        this.loadNotes();
        this.checkAssessmentStatus();
      },
      error: (err) => {
        this.toastService.error('Failed to load course details.');
      }
    });
  }

  loadStats() {
    if (!this.courseId) return;
    this.courseService.getCourseStats(this.courseId).subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Stats Error', err)
    });
  }

  getTrendPath(): string {
    if (!this.stats || !this.stats.enrollmentTrend || this.stats.enrollmentTrend.length === 0) return 'M0,35 L100,35';
    const trend = this.stats.enrollmentTrend;
    const max = Math.max(...trend.map(t => t.count), 1);
    
    return trend.map((t, i) => {
        const x = (i / (trend.length - 1)) * 100;
        const y = 35 - (t.count / max) * 30;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  }

  getTrendAreaPath(): string {
    const path = this.getTrendPath();
    return `${path} L100,40 L0,40 Z`;
  }

  loadQuizzes(lessonId: number) {
    this.quizService.getQuizzesByLesson(lessonId).subscribe(quizzes => {
      this.quizzesMap[lessonId] = quizzes;
    });
  }

  saveCourseSettings() {
    if (!this.course) return;
    this.courseService.updateCourse(this.course.id!, this.course).subscribe({
      next: () => this.toastService.success('Course persistence confirmed.'),
      error: () => this.toastService.error('Failed to persist settings.')
    });
  }

  deleteCourse() {
    if (!this.courseId || !confirm('Permanently destroy this course and all associated data?')) return;
    this.courseService.deleteCourse(this.courseId).subscribe({
      next: () => {
        this.toastService.success('Course destroyed.');
        this.router.navigate(['/instructor']);
      },
      error: () => this.toastService.error('Action failed.')
    });
  }

  addLesson() {
    if (!this.courseId || !this.newLesson.title) return;
    this.courseService.addLesson(this.courseId, this.newLesson).subscribe({
      next: (lesson) => {
        if (!this.course!.lessons) this.course!.lessons = [];
        this.course!.lessons.push(lesson);
        this.showLessonForm = false;
        this.newLesson = { title: '', content: '', videoUrl: '' };
        this.uploadProgress = 0;
        this.toastService.success('Module integrated.');
      },
      error: () => this.toastService.error('Integration failure.')
    });
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.courseService.getUploadUrl(file.name).subscribe({
      next: (res: any) => {
        const url = res.url;
        const baseUrl = url.split('?')[0];

        this.courseService.uploadFileToS3(url, file).subscribe({
          next: (event: any) => {
            if (event.type === 1) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
            } else if (event.type === 4) {
              this.newLesson.videoUrl = baseUrl;
              this.uploadProgress = 0;
              this.toastService.success('Video sync complete.');
            }
          },
          error: (err) => {
            this.toastService.error('Direct sync failed. Check CORS or use URL.');
            this.uploadProgress = 0;
          }
        });
      },
      error: () => this.toastService.error('Presigned URL rejection.')
    });
  }

  openQuizModal(lesson: Lesson) {
    this.activeLesson = lesson;
    this.newQuiz = { question: '', options: '', correctAnswer: '', triggerTimestamp: 0 };
    this.showQuizModal = true;
  }

  saveQuiz() {
    if(!this.activeLesson || !this.activeLesson.id) return;
    this.quizService.addQuizToLesson(this.activeLesson.id, this.newQuiz).subscribe({
      next: (quiz) => {
        if(!this.quizzesMap[this.activeLesson!.id!]) this.quizzesMap[this.activeLesson!.id!] = [];
        this.quizzesMap[this.activeLesson!.id!].push(quiz);
        this.showQuizModal = false;
        this.toastService.success('Quiz module injected.');
      },
      error: () => this.toastService.error('Injection failure.')
    });
  }

  hasQuizzes(lessonId: number | undefined): boolean {
    return lessonId ? !!this.quizzesMap[lessonId] && this.quizzesMap[lessonId].length > 0 : false;
  }

  loadCertificates() {
    if (!this.courseId) return;
    this.certificateService.getInstructorCertificates(this.courseId).subscribe({
      next: (data) => this.certificates = data,
      error: (err) => console.error('Cert Error', err)
    });
  }

  downloadCert(uuid: string) {
    if(this.course) {
        this.certificateService.downloadCertificate(uuid, this.course.title);
    }
  }

  // --- Notes Management ---
  loadNotes() {
    if (!this.courseId) return;
    this.http.get<any[]>(API_URL + 'courses/' + this.courseId + '/notes').subscribe({
      next: (data) => this.notes = data,
      error: (err) => console.error('Notes load error', err)
    });
  }

  onNoteFileSelect(event: any) {
    this.noteFile = event.target.files[0] || null;
  }

  addNote() {
    if (!this.courseId || !this.newNote.title.trim()) return;
    const formData = new FormData();
    formData.append('title', this.newNote.title);
    formData.append('content', this.newNote.content || '');
    if (this.noteFile) {
      formData.append('file', this.noteFile);
    }
    this.http.post(API_URL + 'courses/' + this.courseId + '/notes', formData).subscribe({
      next: (note: any) => {
        this.notes.unshift(note);
        this.showNoteForm = false;
        this.newNote = { title: '', content: '' };
        this.noteFile = null;
        this.toastService.success('Note published to enrolled students.');
      },
      error: () => this.toastService.error('Failed to save note.')
    });
  }

  startEditNote(note: any) {
    this.editingNoteId = note.id;
    this.editNote = { title: note.title, content: note.content };
  }

  saveEditNote(noteId: number) {
    if (!this.courseId) return;
    const formData = new FormData();
    formData.append('title', this.editNote.title);
    formData.append('content', this.editNote.content || '');
    this.http.put(API_URL + 'courses/' + this.courseId + '/notes/' + noteId, formData).subscribe({
      next: (updated: any) => {
        const idx = this.notes.findIndex(n => n.id === noteId);
        if (idx >= 0) { this.notes[idx] = { ...this.notes[idx], ...updated }; }
        this.editingNoteId = null;
        this.toastService.success('Note updated.');
      },
      error: () => this.toastService.error('Failed to update note.')
    });
  }

  deleteNote(noteId: number) {
    if (!this.courseId || !confirm('Delete this note permanently?')) return;
    this.http.delete(API_URL + 'courses/' + this.courseId + '/notes/' + noteId).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n.id !== noteId);
        this.toastService.success('Note deleted.');
      },
      error: () => this.toastService.error('Failed to delete note.')
    });
  }

  checkAssessmentStatus() {
    if (!this.courseId) return;
    this.assessmentService.getQuestions(this.courseId).subscribe({
      next: (data) => this.assessmentPoolCount = data.length,
      error: () => this.assessmentPoolCount = 0
    });
  }

  generateAssessment() {
    if (!this.courseId) return;
    this.generatingAssessment = true;
    this.assessmentService.generateAssessment(this.courseId).subscribe({
      next: (res: any) => {
        this.toastService.success('AI synthesis complete. Question pool updated.');
        this.generatingAssessment = false;
        this.checkAssessmentStatus();
      },
      error: (err) => {
        this.toastService.error('Assessment generation failed. Please try again.');
        this.generatingAssessment = false;
      }
    });
  }
}
