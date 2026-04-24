import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8080/api/courses';

export interface Lesson {
  id?: number;
  title: string;
  content: string;
  videoUrl: string;
}

export interface Course {
  id?: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  lessons?: Lesson[];
}

export interface CourseStats {
  totalEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  enrollmentTrend: { date: string, count: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private http: HttpClient) { }

  getAllCourses(): Observable<any> {
    return this.http.get(API_URL);
  }

  getMyEnrolledCourses(): Observable<any> {
    return this.http.get(`${API_URL}/my-courses`);
  }

  getInstructorCourses(): Observable<any> {
    return this.http.get(`${API_URL}/created-courses`);
  }

  getCourseById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/${id}`);
  }

  getMyEnrollments(): Observable<any> {
    return this.http.get(`${API_URL}/my-enrollments`);
  }

  getEnrollmentStatus(courseId: number): Observable<any> {
    return this.http.get(`${API_URL}/${courseId}/enrollment-status`);
  }

  getCourseStats(courseId: number): Observable<CourseStats> {
    return this.http.get<CourseStats>(`${API_URL}/${courseId}/stats`);
  }

  createCourse(course: any): Observable<any> {
    return this.http.post(API_URL, course);
  }

  enrollInCourse(courseId: number): Observable<any> {
    return this.http.post(`${API_URL}/${courseId}/enroll`, {});
  }

  completeLesson(courseId: number, lessonId: number): Observable<any> {
    return this.http.post(`${API_URL}/${courseId}/complete-lesson/${lessonId}`, {});
  }

  getUploadUrl(fileName: string): Observable<any> {
    return this.http.get(`${API_URL}/upload-url`, {
      params: { fileName }
    });
  }

  uploadFileToS3(url: string, file: File): Observable<any> {
    return this.http.put(url, file, {
      headers: { 'Content-Type': file.type },
      reportProgress: true,
      observe: 'events'
    });
  }

  addLesson(courseId: number, lesson: any): Observable<any> {
    return this.http.post(`${API_URL}/${courseId}/lessons`, lesson);
  }

  updateCourse(id: number, course: any): Observable<any> {
    return this.http.put(`${API_URL}/${id}`, course);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }

  // --- ADMIN MODERATION ---
  getPendingCourses(): Observable<any> {
    return this.http.get('http://localhost:8080/api/admin/courses/pending');
  }

  approveCourse(id: number): Observable<any> {
    return this.http.post(`http://localhost:8080/api/admin/courses/${id}/approve`, {});
  }

  rejectCourse(id: number): Observable<any> {
    return this.http.post(`http://localhost:8080/api/admin/courses/${id}/reject`, {});
  }

  // --- PAYMENT INTEGRATION ---
  createPaymentOrder(courseId: number): Observable<any> {
    return this.http.post('http://localhost:8080/api/payment/create-order', { courseId });
  }

  verifyPayment(payload: any): Observable<any> {
    return this.http.post('http://localhost:8080/api/payment/verify', payload);
  }
}

