import { Injectable, OnDestroy } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { TokenStorageService } from './token-storage.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: string;
  type: 'CHAT' | 'JOIN' | 'LEAVE' | 'TYPING';
}

@Injectable({
  providedIn: 'root'
})
export class ChatService implements OnDestroy {
  private rxStomp: RxStomp;
  private currentRoom = new BehaviorSubject<string>('');
  private messages = new BehaviorSubject<ChatMessage[]>([]);
  private activeUsers = new BehaviorSubject<string[]>([]);
  private typingUsers = new BehaviorSubject<string[]>([]);
  private connectionStatus = new BehaviorSubject<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Subscription management — unsubscribe when switching rooms
  private roomSubscription?: Subscription;
  private usersSubscription?: Subscription;
  private typingSubscription?: Subscription;
  private typingTimeout: any;
  private typingClearTimers: Map<string, any> = new Map();

  constructor(private storageService: TokenStorageService) {
    this.rxStomp = new RxStomp();

    const factory = () => new (SockJS as any)('/ws');

    this.rxStomp.configure({
      webSocketFactory: factory,
      debug: (msg: string) => {
        // Suppress noisy heartbeat logs
        if (!msg.includes('>>> \n') && !msg.includes('<<< \n')) {
          console.log('[WS]', msg);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Track connection status
    this.rxStomp.connected$.subscribe(() => {
      this.connectionStatus.next('connected');
      // Re-join room if we were in one (reconnection scenario)
      const room = this.currentRoom.value;
      if (room) {
        this.sendJoinMessage(room);
      }
    });

    this.rxStomp.stompErrors$.subscribe(() => {
      this.connectionStatus.next('disconnected');
    });

    this.connectionStatus.next('connecting');
    this.rxStomp.activate();
  }

  joinRoom(roomId: string) {
    if (this.currentRoom.value === roomId) return;

    // Leave previous room first
    this.leaveCurrentRoom();

    this.currentRoom.next(roomId);
    this.messages.next([]);
    this.activeUsers.next([]);
    this.typingUsers.next([]);

    // Subscribe to messages on /topic/course/{id}
    this.roomSubscription = this.rxStomp
      .watch('/topic/course/' + roomId)
      .subscribe(message => {
        const msg: ChatMessage = JSON.parse(message.body);
        const currentMessages = this.messages.value;
        this.messages.next([...currentMessages, msg]);
      });

    // Subscribe to active users list
    this.usersSubscription = this.rxStomp
      .watch('/topic/course/' + roomId + '/users')
      .subscribe(message => {
        const users: string[] = JSON.parse(message.body);
        this.activeUsers.next(users);
      });

    // Subscribe to typing indicators
    this.typingSubscription = this.rxStomp
      .watch('/topic/course/' + roomId + '/typing')
      .subscribe(message => {
        const msg: ChatMessage = JSON.parse(message.body);
        const user = this.storageService.getUser();
        // Don't show our own typing
        if (user && msg.sender === user.username) return;

        const current = this.typingUsers.value;
        if (!current.includes(msg.sender)) {
          this.typingUsers.next([...current, msg.sender]);
        }
        // Clear typing after 3s of no activity
        if (this.typingClearTimers.has(msg.sender)) {
          clearTimeout(this.typingClearTimers.get(msg.sender));
        }
        this.typingClearTimers.set(msg.sender, setTimeout(() => {
          const updated = this.typingUsers.value.filter(u => u !== msg.sender);
          this.typingUsers.next(updated);
          this.typingClearTimers.delete(msg.sender);
        }, 3000));
      });

    // Send join message
    this.sendJoinMessage(roomId);
  }

  private sendJoinMessage(roomId: string) {
    const user = this.storageService.getUser();
    if (user?.username) {
      const joinMsg: ChatMessage = {
        sender: user.username,
        content: '',
        timestamp: new Date().toISOString(),
        type: 'JOIN'
      };
      this.rxStomp.publish({
        destination: '/app/chat.join/' + roomId,
        body: JSON.stringify(joinMsg)
      } as any);
    }
  }

  leaveCurrentRoom() {
    const roomId = this.currentRoom.value;
    if (roomId) {
      const user = this.storageService.getUser();
      if (user?.username) {
        const leaveMsg: ChatMessage = {
          sender: user.username,
          content: '',
          timestamp: new Date().toISOString(),
          type: 'LEAVE'
        };
        this.rxStomp.publish({
          destination: '/app/chat.leave/' + roomId,
          body: JSON.stringify(leaveMsg)
        } as any);
      }
    }

    // Clean up subscriptions
    this.roomSubscription?.unsubscribe();
    this.usersSubscription?.unsubscribe();
    this.typingSubscription?.unsubscribe();
    this.typingClearTimers.forEach(timer => clearTimeout(timer));
    this.typingClearTimers.clear();

    this.currentRoom.next('');
  }

  sendMessage(roomId: string, content: string) {
    const user = this.storageService.getUser();
    if (user?.username && content.trim()) {
      const msg: ChatMessage = {
        sender: user.username,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        type: 'CHAT'
      };
      this.rxStomp.publish({
        destination: '/app/chat.sendMessage/' + roomId,
        body: JSON.stringify(msg)
      } as any);
    }
  }

  sendTyping(roomId: string) {
    // Throttle typing events to once per 2 seconds
    if (this.typingTimeout) return;

    const user = this.storageService.getUser();
    if (user?.username) {
      const msg: ChatMessage = {
        sender: user.username,
        content: '',
        timestamp: new Date().toISOString(),
        type: 'TYPING'
      };
      this.rxStomp.publish({
        destination: '/app/chat.typing/' + roomId,
        body: JSON.stringify(msg)
      } as any);

      this.typingTimeout = setTimeout(() => {
        this.typingTimeout = null;
      }, 2000);
    }
  }

  getMessages(): Observable<ChatMessage[]> {
    return this.messages.asObservable();
  }

  getActiveUsers(): Observable<string[]> {
    return this.activeUsers.asObservable();
  }

  getTypingUsers(): Observable<string[]> {
    return this.typingUsers.asObservable();
  }

  getConnectionStatus(): Observable<'connecting' | 'connected' | 'disconnected'> {
    return this.connectionStatus.asObservable();
  }

  ngOnDestroy() {
    this.leaveCurrentRoom();
    this.rxStomp.deactivate();
  }
}
