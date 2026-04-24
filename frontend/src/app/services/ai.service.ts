import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/ai';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  constructor(private http: HttpClient) {}

  explain(text: string, context: string): Observable<any> {
    return this.http.post(`${API_URL}/explain`, { text, context });
  }
}
