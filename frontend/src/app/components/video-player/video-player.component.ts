import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

const API_URL = '/api/';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-container" (mousemove)="showControls()" (mouseleave)="hideControls()">
      <video #mainVideo 
             [src]="videoUrl" 
             (timeupdate)="onTimeUpdate()" 
             (play)="onPlay()" 
             (pause)="onPause()"
             (loadedmetadata)="onLoadedMetadata()"
             class="video-element">
      </video>
      
      <!-- Custom Controls Overlay -->
      <div class="controls-overlay" [class.show]="controlsVisible">
        <div class="progress-area" (click)="seek($event)">
          <div class="progress-bg"></div>
          <div class="progress-fill" [style.width.%]="progress">
            <div class="seeker-node"></div>
          </div>
          
          <!-- Quiz Markers -->
          <div *ngFor="let quiz of quizzes" 
               class="quiz-marker" 
               [style.left.%]="(quiz.triggerTimestamp / duration) * 100">
               <div class="marker-dot"></div>
          </div>
        </div>
        
        <div class="controls-flex">
          <div class="left-controls">
            <button (click)="togglePlay()" class="icon-btn main-play">
              <svg *ngIf="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg *ngIf="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <span class="time-stamp outfit">{{ formatTime(currentTime) }} <span class="sep">/</span> {{ formatTime(duration) }}</span>
          </div>
          
          <div class="right-controls">
            <div class="volume-control">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </div>
            <button (click)="toggleFullscreen()" class="icon-btn">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Center Indicator -->
      <div class="center-indicator" *ngIf="indicatorVisible">
         <div class="indicator-inner glass-panel">
            <svg *ngIf="indicatorIcon === 'play'" width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            <svg *ngIf="indicatorIcon === 'pause'" width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .video-container { position: relative; width: 100%; height: 100%; background: #000; border-radius: inherit; overflow: hidden; cursor: pointer; }
    .video-element { width: 100%; height: 100%; object-fit: contain; }
    
    .controls-overlay { 
       position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem 1.5rem 1.5rem; 
       background: linear-gradient(transparent, rgba(15, 23, 42, 0.9)); 
       opacity: 0; transform: translateY(10px); transition: 0.4s cubic-bezier(0.23, 1, 0.32, 1);
       z-index: 100;
    }
    .controls-overlay.show { opacity: 1; transform: translateY(0); }

    /* Progress Infrastructure */
    .progress-area { height: 4px; border-radius: 100px; position: relative; margin-bottom: 1.5rem; transition: 0.2s; }
    .progress-area:hover { height: 6px; }
    .progress-bg { position: absolute; inset: 0; background: rgba(255,255,255,0.1); border-radius: inherit; }
    .progress-fill { 
       position: absolute; left: 0; top: 0; bottom: 0; background: var(--primary); 
       border-radius: inherit; box-shadow: 0 0 15px var(--primary-glow); 
    }
    .seeker-node { 
       position: absolute; right: -6px; top: 50%; transform: translateY(-50%); 
       width: 12px; height: 12px; background: #fff; border-radius: 50%; 
       box-shadow: 0 0 10px #fff; opacity: 0; transition: 0.2s;
    }
    .progress-area:hover .seeker-node { opacity: 1; }

    .quiz-marker { position: absolute; top: 50%; transform: translate(-50%, -50%); z-index: 5; }
    .marker-dot { width: 8px; height: 8px; background: #f59e0b; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 10px #f59e0b; }

    .controls-flex { display: flex; justify-content: space-between; align-items: center; }
    .left-controls, .right-controls { display: flex; align-items: center; gap: 1.5rem; }
    
    .icon-btn { background: none; border: none; color: #fff; cursor: pointer; display: flex; align-items: center; transition: 0.2s; padding: 0.5rem; opacity: 0.8; }
    .icon-btn:hover { opacity: 1; transform: scale(1.1); }
    .main-play { transform: scale(1.2); }
    .main-play:hover { transform: scale(1.3); }

    .time-stamp { font-size: 0.85rem; font-weight: 700; color: #94a3b8; }
    .time-stamp .sep { opacity: 0.3; margin: 0 0.2rem; }

    /* Indicator */
    .center-indicator { 
       position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
       pointer-events: none; animation: pop 0.6s ease-out forwards; z-index: 50;
    }
    .indicator-inner { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(79, 70, 229, 0.2); }
    @keyframes pop {
       0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
       50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
       100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
    }

    .volume-control { color: #fff; opacity: 0.6; cursor: pointer; }
  `]
})
export class VideoPlayerComponent implements OnDestroy {
  @Input() videoUrl = '';
  @Input() quizzes: any[] = [];
  @Input() lessonId!: number;
  @Output() triggerQuiz = new EventEmitter<any>();

  @ViewChild('mainVideo') videoElement!: ElementRef<HTMLVideoElement>;

  constructor(private http: HttpClient) {}

  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  controlsVisible = true;
  hideTimeout: any;

  indicatorVisible = false;
  indicatorIcon = 'play';
  triggeredQuizIds = new Set<string>();

  ngOnDestroy() {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  togglePlay() {
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
      this.showIndicator('play');
    } else {
      video.pause();
      this.showIndicator('pause');
    }
  }

  showIndicator(icon: string) {
    this.indicatorIcon = icon;
    this.indicatorVisible = true;
    setTimeout(() => this.indicatorVisible = false, 600);
  }

  onPlay() { this.isPlaying = true; }
  
  onPause() { 
    this.isPlaying = false; 
    this.sendHeartbeat();
  }
  
  onLoadedMetadata() { this.duration = this.videoElement.nativeElement.duration; }

  private sendHeartbeat() {
    if (!this.lessonId) return;
    const currentMinute = Math.floor(this.currentTime / 60);
    this.http.post(`${API_URL}analytics/video-heartbeat/${this.lessonId}?minute=${currentMinute}`, {}, { withCredentials: true })
      .subscribe({ error: (err) => console.error('Failed to log video progress', err) });
  }

  onTimeUpdate() {
    const video = this.videoElement.nativeElement;
    this.currentTime = video.currentTime;
    this.progress = (this.currentTime / (video.duration || 1)) * 100;

    this.quizzes.forEach(quiz => {
      const qid = quiz.id?.toString() || quiz.question;
      if (!this.triggeredQuizIds.has(qid) && 
          Math.abs(this.currentTime - quiz.triggerTimestamp) < 0.4) {
        this.triggeredQuizIds.add(qid);
        this.pause();
        this.triggerQuiz.emit(quiz);
      }
    });
  }

  pause() { this.videoElement.nativeElement.pause(); }
  resume() { this.videoElement.nativeElement.play(); }

  seek(event: MouseEvent) {
    const container = (event.currentTarget as HTMLElement);
    const rect = container.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    this.videoElement.nativeElement.currentTime = Math.max(0, Math.min(pos * this.videoElement.nativeElement.duration, this.videoElement.nativeElement.duration));
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  showControls() {
    this.controlsVisible = true;
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => this.controlsVisible = false, 3000);
  }

  hideControls() { this.controlsVisible = false; }

  toggleFullscreen() {
    const video = this.videoElement.nativeElement;
    if (video.requestFullscreen) video.requestFullscreen();
  }
}
