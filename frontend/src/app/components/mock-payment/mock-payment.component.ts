import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mock-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mock-rzp-overlay animate-fade-in" *ngIf="isOpen">
      <div class="mock-rzp-modal" (click)="$event.stopPropagation()">
        
        <header class="rzp-header" [style.background]="options?.theme?.color || '#3399cc'">
          <div class="header-top">
            <h2 class="rzp-title">{{ options?.name || 'Razorpay Gateway' }}</h2>
            <button class="rzp-close" (click)="closeModal()">&times;</button>
          </div>
          <p class="rzp-desc">{{ options?.description || 'Secure Payment' }}</p>
          <div class="rzp-amount">₹{{ (options?.amount || 0) / 100 | number:'1.2-2' }}</div>
        </header>

        <div class="rzp-body" *ngIf="!processing && !success">
          <div class="methods-list">
             <div class="method active">
                <span class="icon">💳</span>
                <span class="text">Card (Mocked Entry)</span>
             </div>
             <div class="method disabled">
                <span class="icon">📱</span>
                <span class="text">UPI / QR (Disabled)</span>
             </div>
             <div class="method disabled">
                <span class="icon">🏦</span>
                <span class="text">Netbanking (Disabled)</span>
             </div>
          </div>

          <div class="payment-details">
             <label class="rzp-label">Card Number (Simulated)</label>
             <input type="text" class="rzp-input" value="4111 1111 1111 1111" readonly>
             
             <div style="display:flex; gap:10px; margin-top:15px;">
               <div style="flex:1;">
                 <label class="rzp-label">Expiry</label>
                 <input type="text" class="rzp-input" value="12 / 30" readonly>
               </div>
               <div style="flex:1;">
                 <label class="rzp-label">CVV</label>
                 <input type="text" class="rzp-input" value="123" readonly>
               </div>
             </div>

             <!-- In sandbox test mode, Razorpay automatically passes the payment ID back on success click -->
             <button class="rzp-btn" [style.background]="options?.theme?.color || '#3399cc'" (click)="initiatePayment()">
               Pay ₹{{ (options?.amount || 0) / 100 | number:'1.2-2' }} (Test Mode)
             </button>
             
             <div class="rzp-footer-tag">
               <svg viewBox="0 0 16 16" width="12" height="12"><path fill="#024B90" d="M12 6.5A.5.5 0 0 0 11.5 6h-7A.5.5 0 0 0 4 6.5v6a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-6zM3 6.5A1.5 1.5 0 0 1 4.5 5h7A1.5 1.5 0 0 1 13 6.5v6a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-6z"/><path fill="#024B90" d="M8 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0-4.5A2.5 2.5 0 0 0 5.5 6H4.5A3.5 3.5 0 0 1 8 2.5 3.5 3.5 0 0 1 11.5 6h-1A2.5 2.5 0 0 0 8 3.5z"/></svg>
               Secured by Learngrid Simulation Platform
             </div>
          </div>
        </div>

        <div class="rzp-body loading-panel" *ngIf="processing">
          <div class="spinner" [style.border-top-color]="options?.theme?.color || '#3399cc'"></div>
          <p>Processing Test Transaction...</p>
        </div>

        <div class="rzp-body success-panel" *ngIf="success">
           <div class="success-icon">✓</div>
           <h3>Payment Successful</h3>
           <p>Redirecting back to dashboard...</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .mock-rzp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(2px); }
    .mock-rzp-modal { width: 100%; max-width: 420px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 50px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    .rzp-header { padding: 1.5rem 1.5rem 2.5rem 1.5rem; color: #fff; position: relative; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .rzp-title { margin:0; font-size: 1.1rem; font-weight: 600; }
    .rzp-close { background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; opacity: 0.8; }
    .rzp-close:hover { opacity: 1; }
    .rzp-desc { margin: 0; font-size: 0.85rem; opacity: 0.9; }
    .rzp-amount { position: absolute; bottom: -18px; right: 20px; background: #fff; color: #333; font-size: 1.25rem; font-weight: 700; padding: 0.4rem 1rem; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }

    .rzp-body { display: flex; min-height: 350px; background: #f9f9f9; }
    
    .methods-list { width: 140px; background: #fff; border-right: 1px solid #e2e8f0; }
    .method { padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; }
    .method.active { border-left: 3px solid; background: #f8fafc; color: #333; }
    .method.disabled { opacity: 0.4; cursor: not-allowed; }
    .method .icon { font-size: 1.5rem; }
    .method .text { font-size: 0.75rem; text-align: center; color: #64748b; font-weight: 500; }

    .payment-details { flex: 1; padding: 2rem 1.5rem; display: flex; flex-direction: column; }
    .rzp-label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 0.5rem; }
    .rzp-input { width: 100%; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 1rem; color: #334155; font-family: monospace; background: #f8fafc; }
    
    .rzp-btn { margin-top: 1.5rem; width: 100%; padding: 1rem; border: none; color: #fff; font-size: 1rem; font-weight: 600; border-radius: 4px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: opacity 0.2s; }
    .rzp-btn:hover { opacity: 0.9; }

    .rzp-footer-tag { margin-top: auto; padding-top: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.7rem; color: #94a3b8; font-weight: 500; }

    .loading-panel { flex-direction: column; align-items: center; justify-content: center; width: 100%; color: #334155; font-weight: 500; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-radius: 50%; border-top-style: solid; animation: spin 1s linear infinite; margin-bottom: 1rem; }
    
    .success-panel { flex-direction: column; align-items: center; justify-content: center; width: 100%; color: #10b981; text-align: center; }
    .success-icon { width: 60px; height: 60px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1rem; }
    .success-panel h3 { margin: 0 0 0.5rem 0; font-size: 1.25rem; color: #065f46; }
    .success-panel p { margin: 0; font-size: 0.85rem; color: #64748b; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MockPaymentComponent {
  @Input() isOpen = false;
  @Input() options: any = null;
  @Output() onPaymentSuccess = new EventEmitter<any>();
  @Output() onPaymentClosed = new EventEmitter<void>();

  processing = false;
  success = false;

  closeModal() {
    this.isOpen = false;
    this.onPaymentClosed.emit();
  }

  initiatePayment() {
    this.processing = true;
    
    // Simulate real network delay before success
    setTimeout(() => {
      this.processing = false;
      this.success = true;

      // Simulate the redirect delay typical in gateways
      setTimeout(() => {
        this.success = false;
        this.isOpen = false;

        const fakeSignaturePayload = {
           razorpay_order_id: this.options.order_id,
           razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(2, 10),
           razorpay_signature: "mock_sig_xxxxxxxxxxx"
        };
        
        // Execute the handler mapped in student-dashboard just like real Razorpay
        if (this.options && this.options.handler) {
            this.options.handler(fakeSignaturePayload);
        } else {
            this.onPaymentSuccess.emit(fakeSignaturePayload);
        }
      }, 1200);

    }, 2000);
  }
}
