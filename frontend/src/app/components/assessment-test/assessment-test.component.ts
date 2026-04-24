import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-test',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="assessment-page animate-fade-in">
      <div class="glass-container">
        <!-- Header -->
        <div class="test-header" *ngIf="!completed">
          <div class="header-info">
            <h2 class="outfit">Final Assessment</h2>
            <p>Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}</p>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="(currentQuestionIndex / questions.length) * 100"></div>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="loading">
          <div class="pulse-loader"></div>
          <p>Preparing your AI-generated assessment...</p>
        </div>

        <!-- Question View -->
        <div class="question-card" *ngIf="!loading && !completed && questions.length > 0">
          <h3 class="question-text">{{ questions[currentQuestionIndex].question }}</h3>
          
          <div class="options-grid">
            <label *ngFor="let option of getOptions(questions[currentQuestionIndex].options)" 
                   class="option-item" 
                   [class.selected]="selectedAnswer === option"
                   (click)="selectOption(option)">
              <div class="radio-circle"></div>
              <span class="option-text">{{ option }}</span>
            </label>
          </div>

          <div class="action-footer">
            <button class="btn-glass" (click)="prevQuestion()" [disabled]="currentQuestionIndex === 0">Previous</button>
            <button class="btn-primary" 
                    (click)="nextQuestion()" 
                    [disabled]="!selectedAnswer">
              {{ currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question' }}
            </button>
          </div>
        </div>

        <!-- Completed State -->
        <div class="completion-card" *ngIf="completed">
          <div class="score-burst" [class.success]="result.score >= (result.totalQuestions * 0.7)">
             <span class="score-value">{{ result.score }}/{{ result.totalQuestions }}</span>
          </div>
          <h2 class="outfit">Assessment Complete!</h2>
          <p class="result-text" *ngIf="result.score >= (result.totalQuestions * 0.7)">
            Outstanding work! You have successfully mastered this course material.
          </p>
          <p class="result-text" *ngIf="result.score < (result.totalQuestions * 0.7)">
            Good effort! Consider reviewing the course material and trying again to improve your score.
          </p>
          
          <div class="actions">
            <button class="btn-primary" routerLink="/dashboard">Return to Dashboard</button>
            <button class="btn-glass" (click)="retry()">Retry Assessment</button>
          </div>
        </div>

        <div class="no-data" *ngIf="!loading && !completed && questions.length === 0">
           <p>No assessment questions available for this course yet. Please ask the instructor to generate the assessment.</p>
           <button class="btn-glass" routerLink="/dashboard">Go Back</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .assessment-page {
      min-height: calc(100vh - 80px);
      padding: 3rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .glass-container {
      width: 100%;
      max-width: 800px;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
    }
    .test-header {
      margin-bottom: 3rem;
    }
    .header-info h2 { margin: 0; font-size: 2rem; color: #1e293b; }
    .header-info p { margin: 0.5rem 0 1.5rem; color: #64748b; font-family: 'Outfit'; }
    .progress-bar {
      height: 8px;
      background: #f1f5f9;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(to right, #4f46e5, #9333ea);
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .question-text {
      font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 2.5rem;
      line-height: 1.4;
      font-weight: 600;
    }
    .options-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 3rem;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .option-item:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }
    .option-item.selected {
      background: #eef2ff;
      border-color: #4f46e5;
      box-shadow: 0 0 20px rgba(79, 70, 229, 0.1);
    }
    .radio-circle {
      width: 22px;
      height: 22px;
      border: 2px solid #cbd5e1;
      border-radius: 50%;
      position: relative;
    }
    .option-item.selected .radio-circle {
      border-color: #4f46e5;
    }
    .option-item.selected .radio-circle::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: #4f46e5;
      border-radius: 50%;
    }
    .option-text { color: #334155; font-size: 1.1rem; font-weight: 500; }
    .action-footer { display: flex; justify-content: space-between; }
    .btn-glass { 
      padding: 0.8rem 1.6rem; 
      background: white; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      color: #1e293b; 
      font-weight: 600;
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-glass:hover:not(:disabled) { background: #f1f5f9; border-color: #4f46e5; color: #4f46e5; }
    .btn-glass:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .completion-card { text-align: center; }
    .score-burst {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.25rem;
      font-weight: 800;
      background: #fef2f2;
      color: #ef4444;
      border: 4px solid #fee2e2;
    }
    .score-burst.success {
      background: #ecfdf5;
      color: #10b981;
      border-color: #d1fae5;
    }
    .completion-card h2 { font-size: 2.5rem; color: #1e293b; margin-bottom: 1rem; }
    .result-text { color: #64748b; font-size: 1.1rem; max-width: 450px; margin: 0 auto 2.5rem; line-height: 1.6; }
    .actions { display: flex; gap: 1rem; justify-content: center; }
    .loading-state, .no-data { text-align: center; padding: 4rem 0; color: #64748b; }
    .pulse-loader {
      width: 60px;
      height: 60px;
      border: 5px solid #f1f5f9;
      border-top-color: #4f46e5;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class AssessmentTestComponent implements OnInit {
  courseId!: number;
  questions: any[] = [];
  currentQuestionIndex = 0;
  answers: any[] = [];
  selectedAnswer: string = '';
  loading = true;
  completed = false;
  result: any = null;

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseId = +this.route.snapshot.params['id'];
    this.loadQuestions();
  }

  loadQuestions() {
    this.loading = true;
    this.assessmentService.getQuestions(this.courseId).subscribe({
      next: (data) => {
        this.questions = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getOptions(optionsStr: string): string[] {
    return optionsStr.split(';');
  }

  selectOption(option: string) {
    this.selectedAnswer = option;
  }

  nextQuestion() {
    this.answers.push({ id: this.questions[this.currentQuestionIndex].id, answer: this.selectedAnswer });
    
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = '';
    } else {
      this.submit();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      const lastAnswer = this.answers.pop();
      this.selectedAnswer = lastAnswer ? lastAnswer.answer : '';
    }
  }

  submit() {
    this.loading = true;
    this.assessmentService.submitAssessment(this.courseId, this.answers).subscribe({
      next: (score) => {
        this.result = score;
        this.completed = true;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to submit assessment. Please try again.');
      }
    });
  }

  retry() {
    this.completed = false;
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.selectedAnswer = '';
    this.loadQuestions(); // Load a fresh set of random 10
  }
}
