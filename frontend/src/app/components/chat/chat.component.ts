import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-vortex-root">
      <!-- Header -->
      <header class="chat-header glass-panel">
        <div class="header-main">
          <div class="header-icon-box">
             <div class="ai-glow-small"></div>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="header-info">
             <h4 class="outfit">Study Group</h4>
             <div class="status-row" [class.live]="connectionStatus === 'connected'">
                <span class="dot"></span>
                <span class="label">{{ connectionStatus === 'connected' ? activeUsers.length + ' Nodes Active' : 'Syncing...' }}</span>
             </div>
          </div>
        </div>
        <button class="toggle-users" (click)="showUsers = !showUsers" [class.active]="showUsers">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </button>
      </header>

      <!-- Users Panel -->
      <div class="users-overlay glass-panel animate-fade-in" *ngIf="showUsers">
         <div class="overlay-top">
            <span class="outfit">Active Nodes</span>
            <span class="count-badge">{{ activeUsers.length }}</span>
         </div>
         <div class="user-nodes">
            <div *ngFor="let user of activeUsers" class="node-item" [class.is-me]="user === currentUser?.username">
               <div class="node-avatar" [style.background]="getAvatarColor(user)">{{ getInitial(user) }}</div>
               <span class="node-name">{{ user }}</span>
               <span *ngIf="user === currentUser?.username" class="me-tag">Self</span>
            </div>
         </div>
      </div>

      <!-- Messages Area -->
      <div class="message-vortex" #scrollMe>
        <div class="vortex-empty" *ngIf="messages.length === 0">
           <div class="empty-icon">💬</div>
           <p class="outfit">Initialize Communication</p>
           <span class="text-muted">Broadcast to the study group.</span>
        </div>

        <ng-container *ngFor="let msg of messages; let i = index">
          <div *ngIf="i === 0" class="vortex-date"><span>Encrypted Stream</span></div>

          <!-- System Log -->
          <div *ngIf="msg.type !== 'CHAT'" class="vortex-log animate-fade-in">
             <span class="log-text">{{ msg.content }}</span>
          </div>

          <!-- Chat Bubble -->
          <div *ngIf="msg.type === 'CHAT'" class="msg-container animate-fade-in"
               [ngClass]="{'my-msg': isMyMessage(msg), 'other-msg': !isMyMessage(msg)}">
            
            <div *ngIf="!isMyMessage(msg) && shouldShowAvatar(i)" class="msg-avatar" [style.background]="getAvatarColor(msg.sender)">
              {{ getInitial(msg.sender) }}
            </div>
            <div *ngIf="!isMyMessage(msg) && !shouldShowAvatar(i)" class="avatar-pad"></div>

            <div class="msg-intel">
              <div *ngIf="!isMyMessage(msg) && shouldShowAvatar(i)" class="sender-label">{{ msg.sender }}</div>
              <div class="msg-bubble glass-panel" [class.tail-less]="!shouldShowAvatar(i) && !isMyMessage(msg)">
                {{ msg.content }}
              </div>
              <div class="msg-time">{{ formatTimestamp(msg.timestamp) }}</div>
            </div>
          </div>
        </ng-container>

        <!-- Typing -->
        <div *ngIf="typingUsers.length > 0" class="typing-vortex animate-fade-in">
           <div class="typing-pulsor">
              <span></span><span></span><span></span>
           </div>
           <span class="typing-label">{{ getTypingText() }}</span>
        </div>
      </div>

      <!-- Footer Input -->
      <footer class="chat-footer">
        <div class="input-vortex">
           <input type="text" [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" (input)="onTyping()"
                  placeholder="Sync a thought..." [disabled]="connectionStatus !== 'connected'">
           <button class="btn-send" (click)="sendMessage()" [disabled]="!newMessage.trim() || connectionStatus !== 'connected'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
           </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .chat-vortex-root { display: flex; flex-direction: column; height: 100%; position: relative; background: transparent; }

    .chat-header { 
       padding: 1.25rem 1.5rem; border-radius: 0; border: none; border-bottom: 1px solid #f1f5f9; 
       display: flex; justify-content: space-between; align-items: center; z-index: 50; 
       background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);
    }
    .header-main { display: flex; align-items: center; gap: 1rem; }
    .header-icon-box { 
       width: 32px; height: 32px; background: rgba(99, 102, 241, 0.1); border-radius: 10px; 
       display: flex; align-items: center; justify-content: center; color: var(--primary); 
       position: relative; border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .ai-glow-small { position: absolute; inset: 0; box-shadow: 0 0 10px var(--primary-glow); opacity: 0.5; border-radius: inherit; }

    .header-info h4 { margin: 0; font-size: 0.85rem; font-weight: 800; color: #1e293b; letter-spacing: 0.05em; text-transform: uppercase; }
    .status-row { display: flex; align-items: center; gap: 0.4rem; }
    .status-row .dot { width: 5px; height: 5px; background: #475569; border-radius: 50%; transition: 0.3s; }
    .status-row.live .dot { background: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
    .status-row .label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }

    .toggle-users { background: none; border: none; color: #94a3b8; cursor: pointer; transition: 0.3s; padding: 0.5rem; border-radius: 8px; }
    .toggle-users:hover { color: #1e293b; background: #f8fafc; }
    .toggle-users.active { color: #4f46e5; background: #f5f3ff; }

    /* Users Overlay */
    .users-overlay { position: absolute; top: 5rem; left: 1rem; right: 1rem; padding: 1.5rem; z-index: 100; border: 1px solid #e2e8f0; background: white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 16px; }
    .overlay-top { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
    .count-badge { background: rgba(99,102,241,0.1); color: var(--primary); padding: 0.1rem 0.5rem; border-radius: 100px; }
    .node-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-radius: 8px; transition: 0.2s; }
    .node-item:hover { background: #f8fafc; }
    .node-avatar { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; color: #fff; }
    .node-name { font-size: 0.8rem; font-weight: 700; color: #475569; }
    .me-tag { font-size: 0.6rem; color: #4f46e5; text-transform: uppercase; font-weight: 900; }

    /* Message Vortex */
    .message-vortex { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem; }
    .vortex-empty { text-align: center; margin-top: 5rem; opacity: 0.3; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .vortex-date { text-align: center; margin: 1.5rem 0; }
    .vortex-date span { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.1em; background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 100px; }

    .vortex-log { text-align: center; margin: 0.5rem 0; }
    .log-text { font-size: 0.7rem; color: #475569; font-weight: 600; font-style: italic; }

    .msg-container { display: flex; gap: 0.75rem; max-width: 90%; }
    .my-msg { align-self: flex-end; flex-direction: row-reverse; }
    .other-msg { align-self: flex-start; }

    .msg-avatar { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; color: #fff; transform: translateY(1.5rem); flex-shrink: 0; }
    .avatar-pad { width: 32px; flex-shrink: 0; }

    .msg-intel { display: flex; flex-direction: column; }
    .sender-label { font-size: 0.7rem; font-weight: 800; color: #475569; margin: 0 0 2px 4px; text-transform: uppercase; }
    .msg-bubble { 
       padding: 0.875rem 1.25rem; font-size: 0.9rem; line-height: 1.5; color: #334155; border-radius: 20px; 
       background: #f8fafc; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px;
    }
    .tail-less { border-top-left-radius: 4px; }
    .my-msg .msg-bubble { background: #4f46e5; border: none; color: #fff; border-radius: 20px; border-bottom-right-radius: 4px; box-shadow: 0 5px 15px rgba(79, 70, 229, 0.2); }
    .my-msg .tail-less { border-top-right-radius: 4px; }
    .msg-time { font-size: 0.6rem; color: #334155; margin-top: 0.25rem; padding: 0 0.5rem; font-weight: 700; }
    .my-msg .msg-time { text-align: right; }

    .typing-vortex { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; }
    .typing-pulsor { display: flex; gap: 4px; }
    .typing-pulsor span { width: 5px; height: 5px; background: #4f46e5; border-radius: 50%; animation: pulseTyping 1.4s infinite ease-in-out both; }
    .typing-pulsor span:nth-child(1) { animation-delay: -0.32s; }
    .typing-pulsor span:nth-child(2) { animation-delay: -0.16s; }
    @keyframes pulseTyping { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
    .typing-label { font-size: 0.75rem; color: #475569; font-weight: 700; font-style: italic; }

    .chat-footer { padding: 1.5rem; background: #fff; border-top: 1px solid #f1f5f9; }
    .input-vortex { display: flex; gap: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 0.5rem 0.5rem 0.5rem 1.25rem; transition: 0.3s; }
    .input-vortex:focus-within { border-color: #4f46e5; background: #fff; }
    .input-vortex input { flex: 1; background: none; border: none; color: #1e293b; font-size: 0.85rem; outline: none; }
    .btn-send { width: 34px; height: 34px; border-radius: 10px; background: #4f46e5; color: #fff; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
    .btn-send:hover { transform: scale(1.05); box-shadow: 0 0 10px rgba(79, 70, 229, 0.4); }
    .btn-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

    .message-vortex::-webkit-scrollbar { width: 4px; }
    .message-vortex::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() roomId!: string;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  currentUser: any;
  activeUsers: string[] = [];
  typingUsers: string[] = [];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' = 'connecting';
  showUsers = false;

  private subscriptions: Subscription[] = [];
  private avatarColors = [
    'linear-gradient(135deg, #6366f1, #818cf8)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #06b6d4, #22d3ee)'
  ];

  constructor(private chatService: ChatService, private storageService: TokenStorageService) {}

  ngOnInit() {
    this.currentUser = this.storageService.getUser();
    if (this.roomId) {
      this.chatService.joinRoom(this.roomId);
      this.subscriptions.push(this.chatService.getMessages().subscribe(msgs => this.messages = msgs));
      this.subscriptions.push(this.chatService.getActiveUsers().subscribe(users => this.activeUsers = users));
      this.subscriptions.push(this.chatService.getTypingUsers().subscribe(users => this.typingUsers = users));
      this.subscriptions.push(this.chatService.getConnectionStatus().subscribe(status => this.connectionStatus = status));
    }
  }

  ngOnDestroy() { this.subscriptions.forEach(s => s.unsubscribe()); }
  ngAfterViewChecked() { this.scrollToBottom(); }

  scrollToBottom(): void {
    try {
      const el = this.myScrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  sendMessage() {
    if (this.newMessage.trim() && this.roomId) {
      this.chatService.sendMessage(this.roomId, this.newMessage);
      this.newMessage = '';
    }
  }

  onTyping() { if (this.roomId && this.newMessage.trim()) this.chatService.sendTyping(this.roomId); }
  isMyMessage(msg: ChatMessage): boolean { return this.currentUser && msg.sender === this.currentUser.username; }

  shouldShowAvatar(index: number): boolean {
    if (index === 0) return true;
    const prev = this.messages[index - 1];
    const curr = this.messages[index];
    return prev.sender !== curr.sender || prev.type !== 'CHAT';
  }

  getInitial(name: string): string { return name ? name.charAt(0).toUpperCase() : '?'; }
  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return this.avatarColors[Math.abs(hash) % this.avatarColors.length];
  }

  getTypingText(): string {
    if (this.typingUsers.length === 1) return `${this.typingUsers[0]} is syncing...`;
    if (this.typingUsers.length > 1) return `Multiple nodes syncing...`;
    return '';
  }

  formatTimestamp(ts: string): string {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  }
}
