import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { QuizService, Quiz } from '../../services/quiz.service';
import { ToastService } from '../../services/toast.service';

const API_URL = '/api/';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quiz-overlay" *ngIf="show">
      <div class="quiz-modal glass-panel animate-fade-in" [class.shake]="shake">
        
        <div class="quiz-header">
          <div class="status-indicator">
            <div class="indicator-inner glass-panel" [class.success]="hasSubmitted && isCorrect" [class.error]="hasSubmitted && !isCorrect">
                <span *ngIf="!hasSubmitted" class="pulse-icon">⚡</span>
                <span *ngIf="hasSubmitted && isCorrect">🏆</span>
                <span *ngIf="hasSubmitted && !isCorrect">⚠️</span>
            </div>
          </div>
          <h2 class="outfit">Knowledge <span class="gradient-text">Sync</span></h2>
          <p *ngIf="!hasSubmitted">Analyze the module data and select the correct hypothesis.</p>
          <p *ngIf="hasSubmitted && isCorrect" class="success-msg">Neural Link Established. Knowledge verified.</p>
          <p *ngIf="hasSubmitted && !isCorrect" class="error-msg">Synchronization Failure. Data recalibration required.</p>
        </div>

        <div class="quiz-body" *ngIf="quiz">
          <div class="question-box glass-panel">
             <p class="question outfit">{{ quiz.question }}</p>
          </div>
          
          <div class="options-vortex">
            <button *ngFor="let opt of parseOptions(quiz.options); let i = index"
                    class="option-pill"
                    [class.selected]="selectedOption === opt"
                    [class.correct]="hasSubmitted && isAnswerCorrect(opt)"
                    [class.wrong]="hasSubmitted && selectedOption === opt && !isCorrect"
                    (click)="selectOption(opt)"
                    [disabled]="hasSubmitted">
              <span class="letter outfit">{{ getLetter(i) }}</span>
              <span class="text">{{ stripLetter(opt) }}</span>
            </button>
          </div>
        </div>

        <div class="quiz-actions">
          <button class="btn-primary full" 
                  *ngIf="!hasSubmitted"
                  [disabled]="!selectedOption" 
                  (click)="submit()">
            Commit To Memory
          </button>
          <button class="btn-secondary full" 
                  *ngIf="hasSubmitted"
                  (click)="close()">
            Continue Transmission
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-overlay {
      position: absolute; inset: 0;
      background: rgba(241, 245, 249, 0.85); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; z-index: 2000;
    }
    .quiz-modal {
      width: 95%; max-width: 580px; padding: 4rem; border-radius: 40px; border: 1px solid #e2e8f0; background: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
    }
    
    .shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0); }
      20%, 80% { transform: translate3d(2px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
      40%, 60% { transform: translate3d(4px, 0, 0); }
    }

    .status-indicator { display: flex; justify-content: center; margin-bottom: 2.5rem; }
    .indicator-inner { 
       width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; 
       font-size: 2.5rem; background: #f8fafc; border: 1px solid #f1f5f9; transition: 0.4s;
    }
    .indicator-inner.success { background: #ecfdf5; color: #059669; border-color: #d1fae5; }
    .indicator-inner.error { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }

    .pulse-icon { animation: heartBeat 2s infinite; display: inline-block; }
    @keyframes heartBeat {
      0% { transform: scale(1); }
      14% { transform: scale(1.1); }
      28% { transform: scale(1); }
    }

    .quiz-header { text-align: center; margin-bottom: 3rem; }
    .quiz-header h2 { font-size: 2.5rem; font-weight: 900; margin-bottom: 0.75rem; color: #1e293b; }
    .quiz-header p { color: #64748b; font-size: 1rem; }
    .success-msg { color: #059669 !important; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem !important; }
    .error-msg { color: #ef4444 !important; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem !important; }

    .question-box { background: #f8fafc; padding: 2rem; border-radius: 20px; border: 1px solid #f1f5f9; margin-bottom: 2.5rem; }
    .question { font-size: 1.25rem; line-height: 1.6; color: #1e293b; margin: 0; text-align: center; }

    .options-vortex { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3.5rem; }
    .option-pill {
       display: flex; align-items: center; padding: 1.25rem 1.75rem; background: #fff; 
       border: 1px solid #e2e8f0; border-radius: 18px; color: #64748b; cursor: pointer; 
       transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1); text-align: left;
    }
    .option-pill:hover:not(:disabled) { transform: translateX(10px); background: #f8fafc; color: #1e293b; border-color: #4f46e5; }
    .option-pill.selected { background: #f5f3ff; border-color: #4f46e5; color: #4f46e5; }
    .option-pill.correct { background: #ecfdf5; border-color: #059669; color: #059669; }
    .option-pill.wrong { background: #fef2f2; border-color: #ef4444; color: #ef4444; }

    .letter { 
       width: 36px; height: 36px; background: #f1f5f9; border-radius: 12px; 
       display: flex; align-items: center; justify-content: center; margin-right: 1.5rem; font-weight: 900; color: #64748b; flex-shrink: 0;
    }
    .selected .letter { background: #4f46e5; color: #fff; }
    .correct .letter { background: #059669; color: #fff; }
    .wrong .letter { background: #ef4444; color: #fff; }
    
    .text { font-size: 1.1rem; font-weight: 700; }

    .full { width: 100%; }
  `]
})
export class QuizComponent implements OnChanges {
  @Input() quiz: Quiz | null = null;
  @Input() show = false;
  @Output() completed = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<void>();

  selectedOption: string = '';
  hasSubmitted = false;
  isCorrect = false;
  shake = false;

  constructor(private quizService: QuizService, private toastService: ToastService, private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      this.reset();
    }
  }

  parseOptions(optionsStr: string): string[] {
    if (!optionsStr) return [];
    return optionsStr.split(',').map(s => s.trim());
  }

  getLetter(index: number): string { return String.fromCharCode(65 + index); }
  stripLetter(opt: string): string { return opt.replace(/^[A-H]\)\s*/, ''); }

  selectOption(opt: string) {
    if(this.hasSubmitted) return;
    this.selectedOption = opt;
  }

  isAnswerCorrect(opt: string): boolean {
    if (!this.hasSubmitted || !this.quiz) return false;
    return opt.toLowerCase() === this.quiz.correctAnswer.toLowerCase();
  }

  submit() {
    if (!this.quiz || !this.quiz.id || !this.selectedOption) return;
    this.quizService.submitQuiz(this.quiz.id, this.selectedOption).subscribe({
      next: (res) => {
        this.hasSubmitted = true;
        this.isCorrect = res.correct;
        
        // Broadcast BI Tracker Silent Attempt
        this.http.post(`${API_URL}analytics/quiz-attempt/${this.quiz!.id}?isCorrect=${res.correct}`, {}, { withCredentials: true })
        .subscribe({ error: (err) => console.error('Silent BI Sync Error', err) });

        if (this.isCorrect) this.toastService.success('Neural sync successful.');
        else { this.triggerShake(); this.toastService.error(`Re-calibration needed. Correct vector: ${res.correctAnswer}`); }
      }
    });
  }

  triggerShake() { this.shake = true; setTimeout(() => this.shake = false, 500); }
  close() { this.completed.emit(this.isCorrect); this.show = false; this.closed.emit(); this.reset(); }
  reset() { this.selectedOption = ''; this.hasSubmitted = false; this.isCorrect = false; this.shake = false; }
}
