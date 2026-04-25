import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = '/api/assessments/';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  constructor(private http: HttpClient) {}

  generateAssessment(courseId: number): Observable<any> {
    return this.http.post(`${API_URL}${courseId}/generate`, {});
  }

  getQuestions(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}${courseId}/take`);
  }

  submitAssessment(courseId: number, answers: any[]): Observable<any> {
    return this.http.post(`${API_URL}${courseId}/submit`, answers);
  }

  getMyScores(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}my-scores`);
  }
}
