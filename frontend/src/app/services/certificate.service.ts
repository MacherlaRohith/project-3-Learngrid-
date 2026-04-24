import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = 'http://localhost:8080/api/certificates';

  constructor(private http: HttpClient) { }

  public getMyCertificates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-certificates`);
  }

  public getInstructorCertificates(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/instructor/course/${courseId}`);
  }

  public downloadCertificate(uuid: string, courseTitle: string): void {
    this.http.get(`${this.apiUrl}/download/${uuid}`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Learngrid_Certificate_${courseTitle.replace(/\\s+/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
