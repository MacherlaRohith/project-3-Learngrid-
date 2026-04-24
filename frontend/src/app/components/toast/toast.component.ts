import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast" [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        <div class="icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'info'">i</span>
          <span *ngIf="toast.type === 'warning'">!</span>
        </div>
        <div class="message">{{ toast.message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #fff;
      backdrop-filter: blur(12px);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #1e293b;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1), fadeOut 0.3s 4.7s forwards;
    }
    .toast.success { border-left: 4px solid #10b981; }
    .toast.error { border-left: 4px solid #ef4444; }
    .toast.info { border-left: 4px solid #3b82f6; }
    .toast.warning { border-left: 4px solid #f59e0b; }
    
    .icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
    }
    .success .icon { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .error .icon { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .info .icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .warning .icon { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.9); pointer-events: none; }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
