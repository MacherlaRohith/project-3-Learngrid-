import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = 'http://localhost:8080/api/user/';

  constructor(private http: HttpClient) {}

  getInstructorWarnings(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL + 'instructor/warnings');
  }
}
