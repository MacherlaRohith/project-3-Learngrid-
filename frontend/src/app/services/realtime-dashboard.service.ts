import { Injectable, OnDestroy } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealtimeDashboardService implements OnDestroy {
  private rxStomp: RxStomp;
  private adminUpdates = new Subject<void>();
  private instructorUpdates = new Subject<void>();
  private adminSub: any;
  private instructorSub: any;

  constructor() {
    this.rxStomp = new RxStomp();

    const factory = () => new (SockJS as any)('/ws');

    this.rxStomp.configure({
      webSocketFactory: factory,
      debug: (msg: string) => {
        if (!msg.includes('>>> \n') && !msg.includes('<<< \n')) {
          // Minimal logging
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.rxStomp.activate();
  }

  // Monitor Admin Topics
  listenForAdminUpdates(): Observable<void> {
    if (!this.adminSub) {
      this.adminSub = this.rxStomp.watch('/topic/admin/updates').subscribe(() => {
        this.adminUpdates.next();
      });
    }
    return this.adminUpdates.asObservable();
  }

  // Monitor Specific Instructor Topics
  listenForInstructorUpdates(instructorId: number): Observable<void> {
    if (this.instructorSub) {
      this.instructorSub.unsubscribe();
    }
    this.instructorSub = this.rxStomp.watch('/topic/instructor/' + instructorId + '/updates').subscribe(() => {
      this.instructorUpdates.next();
    });
    return this.instructorUpdates.asObservable();
  }

  ngOnDestroy() {
    if (this.adminSub) this.adminSub.unsubscribe();
    if (this.instructorSub) this.instructorSub.unsubscribe();
    this.rxStomp.deactivate();
  }
}
