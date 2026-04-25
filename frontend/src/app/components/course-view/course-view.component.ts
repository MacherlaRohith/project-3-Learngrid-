import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CourseService } from '../../services/course.service';
import { QuizService, Quiz } from '../../services/quiz.service';
import { ChatComponent } from '../chat/chat.component';
import { QuizComponent } from '../quiz/quiz.component';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { ToastService } from '../../services/toast.service';
import { AiService } from '../../services/ai.service';
import { FormsModule } from '@angular/forms';

const API_URL = '/api/';

@Component({
  selector: 'app-course-view',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatComponent, QuizComponent, VideoPlayerComponent, FormsModule],
  template: `
    <div class="playback-layout" [class.chat-open]="showChat" [class.ai-open]="showAI">
      <!-- Sidebar: Lesson Navigation -->
      <aside class="lesson-sidebar glass-panel">
        <div class="sidebar-header">
          <button (click)="goBack()" class="back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Dashboard
          </button>
          <h2 class="outfit course-title">{{ course?.title }}</h2>
          
          <div class="progress-container">
            <div class="progress-labels">
               <span class="pct outfit">{{ progress }}%</span>
               <span class="lbl">Syllabus Completion</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="progress"></div>
            </div>
          </div>
        </div>

        <div class="lesson-queue">
          <div *ngFor="let lesson of course?.lessons; let i = index" 
               (click)="selectLesson(lesson)"
               [class.active]="selectedLesson?.id === lesson.id"
               class="lesson-card">
            <div class="index">0{{ i + 1 }}</div>
            <div class="lesson-meta">
              <span class="title outfit">{{ lesson.title }}</span>
              <span class="duration">15:00 Architecture</span>
            </div>
            <div *ngIf="isLessonCompleted(lesson.id)" class="check-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
          </div>
        </div>

        <!-- Assessment Trigger -->
        <div class="assessment-section" *ngIf="progress >= 100">
           <button class="btn-primary full-width" [routerLink]="['/assessment', course?.id]">
              ✨ Take Final Assessment
           </button>
           <p class="assessment-hint">Required for graduation</p>
        </div>
      </aside>

      <!-- Main: Cinematic Player Area -->
      <main class="player-vortex">
        <div class="theatre-mode glass-panel animate-fade-in">
          <app-video-player 
                 #player
                 *ngIf="selectedLesson?.videoUrl" 
                 [videoUrl]="selectedLesson.videoUrl" 
                 [quizzes]="lessonQuizzes"
                 (triggerQuiz)="handleQuizTrigger($event)">
          </app-video-player>
          
          <div *ngIf="!selectedLesson" class="empty-theatre">
            <div class="pulsing-play">▶</div>
            <p class="outfit">Select a module to begin transmission</p>
          </div>
        </div>

        <div class="lesson-intel" *ngIf="selectedLesson">
          <div class="intel-header">
            <div class="title-group">
                <h2 class="outfit lesson-h">{{ selectedLesson.title }}</h2>
                <div class="indicator-row">
                   <span class="status-pill" [class.done]="isLessonCompleted(selectedLesson.id)">
                      {{ isLessonCompleted(selectedLesson.id) ? 'Transmission Complete' : 'Active Learning' }}
                   </span>
                   <span class="ai-hint">✨ Select text for AI Insights</span>
                </div>
            </div>
            
            <div class="classroom-actions">
              <button class="action-btn ai" [class.active]="showAI" (click)="toggleAI()">
                <span class="sparkle">✨</span> AI Buddy
              </button>
              <button class="action-btn chat" [class.active]="showChat" (click)="toggleChat()">
                Study Group
              </button>
              <button class="action-btn notes" [class.active]="showNotes" (click)="toggleNotes()">
                📝 Notes
              </button>
              <button *ngIf="!isLessonCompleted(selectedLesson.id)" (click)="markCurrentLessonComplete()" class="btn-primary sm">
                Complete Module
              </button>
              <button *ngIf="lessonQuizzes.length > 0" (click)="takeQuiz()" class="btn-secondary sm">Terminal Quiz</button>
            </div>
          </div>

          <div class="lesson-content-body" (mouseup)="handleSelection($event)">
            {{ selectedLesson.content }}
          </div>
          
          <!-- Floating Magic Pulse Button -->
          <div *ngIf="selectionRange && !showAI" 
               class="magic-trigger animate-fade-in" 
               [style.top.px]="selectionRange.top - 50" 
               [style.left.px]="selectionRange.left">
            <button (click)="explainSelectedText()" class="btn-magic">
              <span>✨</span> Digitize with AI
            </button>
          </div>
        </div>
      </main>

      <!-- AI Oracle Sidebar -->
      <aside class="sidebar-right ai-oracle" [class.visible]="showAI">
        <div class="oracle-header">
            <div class="oracle-title">
               <div class="ai-glow"></div>
               <h4 class="outfit">Project Gemini</h4>
            </div>
            <button class="close-oracle" (click)="toggleAI()">&times;</button>
        </div>
        
        <div class="oracle-scroll">
           <div class="oracle-intro" *ngIf="aiMessages.length === 0 && !aiLoading">
              <div class="holo-avatar">✨</div>
              <p>Highlight lesson data and ask for <b>Digital Clarification</b>.</p>
           </div>
           
           <div class="oracle-loading" *ngIf="aiLoading">
              <div class="holo-bar"></div>
              <div class="holo-bar" style="width: 80%"></div>
              <div class="holo-bar" style="width: 60%"></div>
           </div>

           <div class="message-stack">
              <div *ngFor="let msg of aiMessages" 
                   [class.u]="msg.role === 'user'"
                   [class.a]="msg.role === 'ai'"
                   class="bubble animate-fade-in">
                <div class="bubble-inner" [innerHTML]="msg.text"></div>
              </div>
           </div>
        </div>
        
        <div class="oracle-input">
           <input type="text" [(ngModel)]="aiInput" (keyup.enter)="sendMessage()" placeholder="Sync with AI..." [disabled]="aiLoading">
           <button (click)="sendMessage()" [disabled]="aiLoading || !aiInput.trim()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
           </button>
        </div>
        
        <div class="oracle-footer">
           <button class="wipe-btn" (click)="clearAI()">Wipe History</button>
           <span class="v-tag">Gemini 1.5 Pro</span>
        </div>
      </aside>

      <!-- Study Group Sidebar -->
      <aside class="sidebar-right chat-vortex" [class.visible]="showChat">
        <app-chat *ngIf="course?.id && showChat" [roomId]="course.id.toString()"></app-chat>
      </aside>

      <app-quiz [show]="showQuiz" [quiz]="activeQuiz" (completed)="onQuizCompleted($event)" (closed)="showQuiz = false"></app-quiz>

      <!-- Notes Sidebar -->
      <aside class="sidebar-right notes-panel" [class.visible]="showNotes">
        <div class="oracle-header">
          <div class="oracle-title">
            <span style="font-size: 1.2rem;">📝</span>
            <h4 class="outfit">Study Notes</h4>
          </div>
          <button class="close-oracle" (click)="toggleNotes()">&times;</button>
        </div>
        <div class="oracle-scroll">
          <div *ngIf="courseNotes.length === 0" class="oracle-intro">
            <p>No notes have been published for this course yet.</p>
          </div>
          <div *ngFor="let note of courseNotes" class="note-card animate-fade-in">
            <h4 class="outfit note-title">{{ note.title }}</h4>
            <p class="note-body" *ngIf="note.content">{{ note.content }}</p>
            <a *ngIf="note.pdfUrl" 
               [href]="note.pdfUrl" 
               target="_blank" 
               class="pdf-download-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              {{ note.originalFileName || 'Download Attachment' }}
            </a>
            <span class="note-date">{{ note.createdAt | date:'medium' }}</span>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .playback-layout { display: flex; height: calc(100vh - 64px); background: #f8fafc; overflow: hidden; }

    /* Lesson Sidebar */
    .lesson-sidebar { width: 320px; border-radius: 0; border: none; background: white; border-right: 1px solid #e2e8f0; }
    .sidebar-header { padding: 2.5rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .back-link { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #64748b; font-size: 0.8rem; font-weight: 800; cursor: pointer; text-transform: uppercase; margin-bottom: 1.5rem; transition: 0.2s; }
    .back-link:hover { color: #4f46e5; }
    .course-title { font-size: 1.25rem; margin-bottom: 2rem; color: #1e293b; line-height: 1.4; }

    .progress-container { margin-top: 1rem; }
    .progress-labels { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.75rem; }
    .progress-labels .pct { font-size: 1.8rem; font-weight: 900; color: #4f46e5; line-height: 1; }
    .progress-labels .lbl { font-size: 0.65rem; text-transform: uppercase; font-weight: 800; color: #64748b; }
    .progress-track { height: 4px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #4f46e5; transition: width 0.6s cubic-bezier(0.23, 1, 0.32, 1); }

    .lesson-queue { flex: 1; overflow-y: auto; padding: 1.5rem 1rem; }
    .lesson-card { 
       display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem; border-radius: 14px; 
       cursor: pointer; transition: 0.3s; margin-bottom: 0.5rem; border: 1px solid transparent;
    }
    .lesson-card:hover { background: #f8fafc; }
    .lesson-card.active { background: #f5f3ff; border-color: #ddd6fe; }
    .lesson-card .index { font-weight: 900; color: #cbd5e1; font-size: 1.1rem; }
    .lesson-card.active .index { color: #4f46e5; }
    .lesson-meta { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .lesson-meta .title { font-size: 0.9rem; color: #1e293b; font-weight: 600; }
    .lesson-meta .duration { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; }
    .check-icon { width: 22px; height: 22px; background: #10b981; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: scale(0.8); }
    .player-vortex { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; gap: 3rem; }
    .theatre-mode { aspect-ratio: 16/9; background: #0f172a; overflow: hidden; border-radius: 20px; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1); }
    .empty-theatre { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; color: #64748b; }
    .pulsing-play { font-size: 4rem; animation: pulsePlay 2s infinite; opacity: 0.2; }
    @keyframes pulsePlay { 0% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.1); opacity: 0.4; } 100% { transform: scale(1); opacity: 0.2; } }
 
    .intel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; gap: 2rem; }
    .lesson-h { font-size: 2.25rem; font-weight: 900; color: #1e293b; margin-bottom: 0.5rem; }
    .indicator-row { display: flex; gap: 1rem; align-items: center; }
    .status-pill { font-size: 0.7rem; text-transform: uppercase; font-weight: 800; padding: 0.3rem 0.8rem; background: #f1f5f9; color: #64748b; border-radius: 100px; }
    .status-pill.done { background: #ecfdf5; color: #059669; }
    .ai-hint { font-size: 0.8rem; color: #4f46e5; font-weight: 600; font-style: italic; opacity: 0.8; }

    .classroom-actions { display: flex; gap: 0.75rem; align-items: center; }
    .action-btn { 
       padding: 0.6rem 1.25rem; background: #fff; border: 1px solid #e2e8f0; 
       border-radius: 12px; color: #64748b; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.3s;
       box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .action-btn:hover { background: #f8fafc; color: #1e293b; }
    .action-btn.active { color: #4f46e5; border-color: #4f46e5; background: #f5f3ff; }
    .action-btn.ai.active { border-color: #9333ea; background: #faf5ff; color: #9333ea; }
    .sparkle { color: #9333ea; }

    .lesson-content-body { font-size: 1.125rem; line-height: 1.8; color: #475569; white-space: pre-line; max-width: 1000px; }

    /* Magic Button */
    .magic-trigger { position: fixed; z-index: 1000; }
    .btn-magic { 
       background: linear-gradient(135deg, #4f46e5, #9333ea); color: #fff; border: none; 
       padding: 0.6rem 1.25rem; border-radius: 100px; font-weight: 900; font-size: 0.8rem; 
       cursor: pointer; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4); 
       display: flex; align-items: center; gap: 0.5rem; transition: 0.2s;
    }
    .btn-magic:hover { transform: scale(1.05); }

    /* Sidebars */
    .sidebar-right { 
       width: 0; min-width: 0; overflow: hidden; background: white; 
       border-left: 0 solid #e2e8f0; transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1);
       display: flex; flex-direction: column; z-index: 100;
       box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
    }
    .sidebar-right.visible { width: 380px; min-width: 380px; border-left-width: 1px; }

    .oracle-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .oracle-title { display: flex; align-items: center; gap: 0.75rem; position: relative; }
    .ai-glow { width: 10px; height: 10px; background: #9333ea; border-radius: 50%; box-shadow: 0 0 15px #9333ea; animation: pulseGlow 2s infinite; }
    @keyframes pulseGlow { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.5); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
    .oracle-title h4 { margin: 0; color: #9333ea; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.85rem; }
    .close-oracle { background: none; border: none; color: #94a3b8; font-size: 2rem; cursor: pointer; }

    .oracle-scroll { flex: 1; overflow-y: auto; padding: 2rem; }
    .oracle-intro { text-align: center; margin-top: 4rem; color: #94a3b8; }
    .holo-avatar { font-size: 3.5rem; margin-bottom: 1.5rem; }

    .bubble-inner { padding: 1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.6; }
    .bubble.u { align-self: flex-end; }
    .bubble.u .bubble-inner { background: #eef2ff; color: #4f46e5; border-bottom-right-radius: 4px; font-weight: 500; }
    .bubble.a .bubble-inner { background: #f8fafc; color: #334155; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }

    .oracle-input { padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9; display: flex; gap: 0.75rem; }
    .oracle-input input { 
       flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; 
       padding: 0.75rem 1.2rem; border-radius: 12px; color: #1e293b; font-size: 0.9rem;
    }
    .oracle-input input:focus { outline: none; border-color: #9333ea; }
    .oracle-input button { background: #9333ea; border: none; border-radius: 10px; padding: 0 1rem; color: #fff; cursor: pointer; }

    .oracle-footer { padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; }
    .wipe-btn { background: none; border: none; color: #94a3b8; font-size: 0.7rem; text-decoration: underline; cursor: pointer; }
    .v-tag { font-size: 0.6rem; font-weight: 800; color: #cbd5e1; text-transform: uppercase; }

    .oracle-loading .holo-bar { height: 12px; background: #f1f5f9; border-radius: 6px; margin-bottom: 0.75rem; animation: scan 1.5s infinite; }
    @keyframes scan { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }

    .note-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
    .note-title { font-size: 1.1rem; color: #1e293b; margin: 0 0 0.75rem 0; }
    .note-body { font-size: 0.95rem; line-height: 1.7; color: #475569; margin: 0 0 0.75rem 0; white-space: pre-line; }
    .note-date { font-size: 0.7rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
    .action-btn.notes.active { border-color: #d97706; background: #fffbeb; color: #d97706; }
    .pdf-download-btn { 
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; 
      background: #eef2ff; border: 1px solid #c7d2fe; 
      border-radius: 100px; color: #4f46e5; font-size: 0.8rem; font-weight: 700; 
      text-decoration: none; transition: 0.3s; margin: 0.75rem 0;
    }
    .pdf-download-btn:hover { background: #e0e7ff; color: #4338ca; transform: translateY(-1px); }
    .assessment-section { padding: 1.5rem; border-top: 1px solid #f1f5f9; background: #f5f3ff; }
    .full-width { width: 100%; justify-content: center; }
    .assessment-hint { font-size: 0.7rem; color: #4f46e5; text-align: center; margin-top: 0.75rem; font-weight: 800; text-transform: uppercase; }
  `]
})
export class CourseViewComponent implements OnInit, OnDestroy {
  @ViewChild('player') videoPlayer!: VideoPlayerComponent;
  
  course: any;
  selectedLesson: any;
  showChat = false;
  showAI = false;
  
  lessonQuizzes: Quiz[] = [];
  showQuiz = false;
  activeQuiz: Quiz | null = null;
  
  progress = 0;
  completedLessonIds: Set<number> = new Set();

  aiLoading = false;
  aiMessages: any[] = [];
  aiInput = '';
  selectedText = '';
  selectionRange: any = null;

  // Notes
  showNotes = false;
  courseNotes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private courseService: CourseService,
    private quizService: QuizService,
    private aiService: AiService,
    private toastService: ToastService
  ) {}

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
     if (!event.target.closest('.magic-trigger') && !event.target.closest('.lesson-content-body')) {
        this.selectionRange = null;
     }
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.params['id'];
    this.loadCourse(courseId);
  }

  ngOnDestroy(): void {}

  loadCourse(id: number): void {
    this.courseService.getCourseById(id).subscribe({
      next: (data: any) => {
        this.course = data;
        this.checkAccess(id);
      },
      error: () => this.router.navigate(['/courses'])
    });
  }

  private checkAccess(courseId: number): void {
    const user = JSON.parse(localStorage.getItem('auth-user') || '{}');
    const isAdminOrInstructor = user.roles?.some((r: string) => r === 'ROLE_ADMIN' || r === 'ROLE_INSTRUCTOR');
    
    if (isAdminOrInstructor) {
        this.initializeLessons();
        return;
    }

    this.courseService.getMyEnrollments().subscribe({
      next: (enrollments: any[]) => {
        const isEnrolled = enrollments.some(e => (e.courseId == courseId) || (e.id == courseId));
        if (isEnrolled) this.initializeLessons();
        else this.router.navigate(['/courses']);
      },
      error: () => this.router.navigate(['/courses'])
    });
  }

  private initializeLessons(): void {
    this.courseService.getEnrollmentStatus(this.course.id).subscribe({
      next: (status: any) => {
        this.progress = Math.round(status.progress || 0);
        this.completedLessonIds = new Set(status.completedLessonIds || []);
        if (this.course.lessons?.length > 0) this.selectLesson(this.course.lessons[0]);
      },
      error: () => {
        if (this.course.lessons?.length > 0) this.selectLesson(this.course.lessons[0]);
      }
    });
  }

  selectLesson(lesson: any): void {
    this.selectedLesson = lesson;
    this.loadQuizzesForLesson(lesson.id);
  }

  loadQuizzesForLesson(lessonId: number) {
    this.quizService.getQuizzesByLesson(lessonId).subscribe(quizzes => this.lessonQuizzes = quizzes);
  }

  goBack(): void { this.router.navigate(['/dashboard']); }
  toggleChat(): void { this.showChat = !this.showChat; if (this.showChat) { this.showAI = false; this.showNotes = false; } }
  toggleAI(): void { this.showAI = !this.showAI; if (this.showAI) { this.showChat = false; this.showNotes = false; } }
  toggleNotes(): void { 
    this.showNotes = !this.showNotes; 
    if (this.showNotes) { 
      this.showChat = false; this.showAI = false;
      if (this.courseNotes.length === 0 && this.course?.id) this.loadNotes();
    } 
  }

  loadNotes(): void {
    this.http.get<any[]>(API_URL + 'courses/' + this.course.id + '/notes').subscribe({
      next: (notes) => this.courseNotes = notes,
      error: () => this.toastService.error('Could not load notes.')
    });
  }

  handleSelection(event: any): void {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 5) {
      const range = selection?.getRangeAt(0).getBoundingClientRect();
      this.selectedText = text;
      this.selectionRange = { top: range?.top || 0, left: range?.left || 0 };
    } else this.selectionRange = null;
  }

  explainSelectedText(): void {
    if (!this.selectedText) return;
    this.showAI = true; this.showChat = false; this.selectionRange = null;
    this.askAI(this.selectedText);
  }

  askAI(text: string): void {
    this.aiLoading = true;
    const context = `Course: ${this.course?.title}, Lesson: ${this.selectedLesson?.title}`;
    this.aiService.explain(text, context).subscribe({
      next: (res: any) => {
        this.aiMessages.push({ role: 'ai', text: res.explanation });
        this.aiLoading = false;
      },
      error: () => {
        this.aiMessages.push({ role: 'ai', text: "Transmission interrupted. Re-syncing..." });
        this.aiLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.aiInput.trim() || this.aiLoading) return;
    const query = this.aiInput;
    this.aiMessages.push({ role: 'user', text: query });
    this.aiInput = ''; this.askAI(query);
  }

  clearAI(): void { this.aiMessages = []; }

  handleQuizTrigger(quiz: Quiz): void {
    this.activeQuiz = quiz; this.showQuiz = true;
    if (this.videoPlayer) this.videoPlayer.pause();
  }

  onQuizCompleted(passed: boolean): void {
    if(passed && this.course?.id && this.selectedLesson?.id) this.markCurrentLessonComplete();
    this.showQuiz = false;
    if (this.videoPlayer) this.videoPlayer.resume();
  }

  takeQuiz(): void {
    if (this.lessonQuizzes.length > 0) this.handleQuizTrigger(this.lessonQuizzes[0]);
  }

  isLessonCompleted(lessonId: number): boolean { return this.completedLessonIds.has(lessonId); }

  markCurrentLessonComplete(): void {
    if (!this.course?.id || !this.selectedLesson?.id) return;
    this.courseService.completeLesson(this.course.id, this.selectedLesson.id).subscribe({
      next: () => {
        this.toastService.success('Module integrated.');
        this.completedLessonIds.add(this.selectedLesson.id);
        this.courseService.getEnrollmentStatus(this.course.id).subscribe(status => this.progress = Math.round(status.progress));
      }
    });
  }
}
