import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/code/';

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  constructor(private http: HttpClient) {}

  executeCode(language: string, code: string): Observable<any> {
    return this.http.post(API_URL + 'execute', { language, code });
  }
}
