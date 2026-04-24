import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private API_URL = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<any> => {
      console.error(`AdminService ERROR [${operation}]:`, {
        status: error.status,
        message: error.message,
        url: error.url,
        body: error.error
      });
      return throwError(() => new Error(`Admin Intelligence Failure: ${operation} failed (${error.status})`));
    };
  }

  getStats(): Observable<any> {
    return this.http.get(this.API_URL + '/stats').pipe(
      catchError(this.handleError('getStats'))
    );
  }

  getPendingInstructors(): Observable<any> {
    return this.http.get(this.API_URL + '/pending-instructors').pipe(
      catchError(this.handleError('getPendingInstructors'))
    );
  }

  getUsers(): Observable<any> {
    return this.http.get(this.API_URL + '/users').pipe(
      catchError(this.handleError('getUsers'))
    );
  }

  getCourses(): Observable<any> {
    console.log('AdminService: Requesting Course Inventory diagnostics...');
    return this.http.get(this.API_URL + '/courses').pipe(
      tap(data => console.log('AdminService: Course Inventory successfully received.')),
      catchError(this.handleError('getCourses'))
    );
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(this.API_URL + '/users/' + userId + '/role', { role }).pipe(
      catchError(this.handleError('updateUserRole'))
    );
  }

  banUser(userId: number): Observable<any> {
    return this.http.post(this.API_URL + '/users/' + userId + '/ban', {}).pipe(
      catchError(this.handleError('banUser'))
    );
  }

  warnUser(userId: number, reason: string): Observable<any> {
    return this.http.post(this.API_URL + '/users/' + userId + '/warn', { reason }).pipe(
      catchError(this.handleError('warnUser'))
    );
  }

  approveInstructor(userId: number): Observable<any> {
    return this.http.post(this.API_URL + '/approve/' + userId, {}).pipe(
      catchError(this.handleError('approveInstructor'))
    );
  }

  rejectInstructor(userId: number): Observable<any> {
    return this.http.post(this.API_URL + '/reject/' + userId, {}).pipe(
      catchError(this.handleError('rejectInstructor'))
    );
  }
}
