import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/';

export interface Quiz {
  id?: number;
  question: string;
  options: string; // comma separated "A) opt1, B) opt2"
  correctAnswer: string;
  triggerTimestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  constructor(private http: HttpClient) {}

  getQuizzesByLesson(lessonId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(API_URL + `lessons/${lessonId}/quizzes`);
  }

  addQuizToLesson(lessonId: number, quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(API_URL + `lessons/${lessonId}/quizzes`, quiz);
  }

  submitQuiz(quizId: number, answer: string): Observable<{correct: boolean, correctAnswer: string}> {
    return this.http.post<{correct: boolean, correctAnswer: string}>(API_URL + `quizzes/${quizId}/submit`, { answer });
  }
}
