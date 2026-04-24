import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Premium Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="badge animate-fade-in">Built for the next generation of learners</div>
          <h1 class="animate-fade-in">Collaborative Learning, <br/><span class="gradient-text">Redefined.</span></h1>
          <p class="hero-description animate-fade-in" style="animation-delay: 0.1s">
            Master new skills with interactive videos, real-time code playgrounds, and seamless study groups in a unified digital campus.
          </p>
          <div class="cta-actions animate-fade-in" style="animation-delay: 0.2s">
            <a routerLink="/courses" class="btn-primary">Explore Courses</a>
            <a routerLink="/register" class="btn-secondary">Get Started Free</a>
          </div>
        </div>
      </section>

      <!-- Bento Features Grid -->
      <section class="features-section">
        <div class="section-badge">Platform Pillars</div>
        <h2 class="section-title">Everything you need to succeed</h2>
        
        <div class="bento-grid">
          <!-- Main Large Feature -->
          <div class="bento-item main glass-panel animate-fade-in">
            <div class="feature-content">
              <span class="icon">💻</span>
              <h3>Advanced Code Playground</h3>
              <p>Experience a full-throttle IDE in your browser. Run Python, Java, and JS with zero setup.</p>
            </div>
            <div class="mockup-preview playground-preview"></div>
          </div>

          <!-- Interactive Video -->
          <div class="bento-item glass-panel animate-fade-in" style="animation-delay: 0.1s">
            <span class="icon">📺</span>
            <h3>Interactive Video</h3>
            <p>Smart player with built-in quizzes that pause the action to test your mastery.</p>
          </div>

          <!-- Real-time Chat -->
          <div class="bento-item glass-panel animate-fade-in" style="animation-delay: 0.2s">
            <span class="icon">💬</span>
            <h3>Study Channels</h3>
            <p>Real-time WebSocket chat rooms for every course. Never learn alone again.</p>
          </div>

          <!-- AI Assistant -->
          <div class="bento-item wide glass-panel animate-fade-in" style="animation-delay: 0.3s">
            <div class="feature-flex">
               <div class="text">
                  <span class="icon">🤖</span>
                  <h3>AI Study Buddy</h3>
                  <p>Powered by Gemini 1.5, get instant explanations and code reviews while you learn.</p>
               </div>
               <div class="ai-glow"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page { padding-bottom: 8rem; }
    .hero-section {
      padding: 10rem 2rem 6rem;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #f5f3ff;
      border: 1px solid #ddd6fe;
      border-radius: 100px;
      color: #4f46e5;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 5rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 1.5rem;
      color: #0f172a;
    }
    .hero-description {
      font-size: 1.25rem;
      color: #64748b;
      max-width: 650px;
      margin: 0 auto 3rem;
      line-height: 1.6;
    }
    .cta-actions { display: flex; gap: 1.5rem; justify-content: center; }

    .features-section { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    .section-badge { text-align: center; color: #4f46e5; font-weight: 800; text-transform: uppercase; font-size: 0.75rem; margin-bottom: 1rem; }
    .section-title { text-align: center; font-size: 3rem; margin-bottom: 4rem; color: #0f172a; }

    /* Bento Grid */
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 300px);
      gap: 1.5rem;
    }
    .bento-item {
      position: relative;
      padding: 2rem;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
    }
    .bento-item:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.05);
      border-color: #4f46e5;
    }
    .bento-item.main { grid-column: span 2; display: flex; align-items: center; justify-content: space-between; }
    .bento-item.wide { grid-column: span 2; }
    
    .icon { font-size: 2.5rem; margin-bottom: 1.5rem; display: block; }
    h3 { font-size: 1.5rem; margin-bottom: 0.75rem; color: #1e293b; }
    p { color: #64748b; line-height: 1.5; margin: 0; }

    .playground-preview {
      width: 200px;
      height: 150px;
      background: #0f172a;
      border-radius: 12px;
      border: 1px solid #1e293b;
      position: relative;
    }
    .playground-preview::before {
      content: 'def hello_world():';
      font-family: monospace;
      font-size: 0.7rem;
      color: #10b981;
      position: absolute;
      top: 1rem;
      left: 1rem;
    }

    .feature-flex { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .ai-glow {
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, #f5f3ff 0%, transparent 70%);
      filter: blur(20px);
      opacity: 0.8;
    }

    @media (max-width: 1024px) {
      .bento-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
      .bento-item.main, .bento-item.wide { grid-column: span 1; }
      h1 { font-size: 3.5rem; }
    }
  `]
})
export class LandingComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
