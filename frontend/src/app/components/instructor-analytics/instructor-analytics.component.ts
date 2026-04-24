import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

const API_URL = 'http://localhost:8080/api/';

@Component({
  selector: 'app-instructor-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  template: `
    <div class="analytics-container fade-in">
      <h1 class="outfit">Advanced <span class="gradient-text">Analytics</span></h1>
      <p class="subtitle">Gain neuro-insight into your student demographics and performance matrix.</p>

      <!-- Global Course Selector -->
      <div class="course-selector glass-panel">
        <label for="courseSelect">Analyze Environment:</label>
        <select id="courseSelect" [(ngModel)]="selectedCourseId" (change)="loadCourseData()">
          <option [value]="null">Select a course to decode...</option>
          <option *ngFor="let c of courses" [value]="c.id">{{ c.title }}</option>
        </select>
      </div>

      <div class="charts-grid" *ngIf="selectedCourseId">
        
        <!-- Video Drop-off Rates -->
        <div class="chart-card glass-panel">
          <h3 class="outfit">Video Attention Span (Drop-offs)</h3>
          <p class="chart-desc">Identifies precisely which minute users disconnect.</p>
          <div class="chart-wrapper" *ngIf="dropoffChartData.datasets.length > 0">
             <canvas baseChart
                [data]="dropoffChartData"
                [options]="barChartOptions"
                [type]="'bar'">
             </canvas>
          </div>
          <p class="no-data" *ngIf="dropoffChartData.datasets.length === 0">No video telemetry data yet.</p>
        </div>

        <!-- Quiz Difficulty Matrix -->
        <div class="chart-card glass-panel">
          <h3 class="outfit">Neural Failure Nodes (Quiz Difficulty)</h3>
          <p class="chart-desc">Percentage of students failing specific questions.</p>
          <div class="chart-wrapper" *ngIf="quizChartData.datasets.length > 0">
             <canvas baseChart
                [data]="quizChartData"
                [options]="horizontalBarOptions"
                [type]="'bar'">
             </canvas>
          </div>
          <p class="no-data" *ngIf="quizChartData.datasets.length === 0">No quiz attempt data yet.</p>
        </div>
      </div>

      <!-- Global Revenue Matrix -->
      <div class="chart-card glass-panel full-width mt-4">
        <h3 class="outfit">Global Accrual Matrix (Revenue)</h3>
        <p class="chart-desc">Total platform earnings trajectory across all modules.</p>
        <div class="chart-wrapper line-chart" *ngIf="revenueChartData.datasets.length > 0">
           <canvas baseChart
              [data]="revenueChartData"
              [options]="lineChartOptions"
              [type]="'line'">
           </canvas>
        </div>
        <p class="no-data" *ngIf="revenueChartData.datasets.length === 0">No revenue data yet. Enroll students in paid courses to see earnings.</p>
      </div>

    </div>
  `,
  styles: [`
    .analytics-container { padding: 3rem 5%; max-width: 1400px; margin: 0 auto; color: #0f172a; }
    h1 { font-size: 3rem; font-weight: 900; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 2px; }
    .subtitle { color: #64748b; font-size: 1.1rem; margin-bottom: 3rem; }
    
    .course-selector {
        padding: 1.5rem; border-radius: 15px; margin-bottom: 3rem; display: flex; align-items: center; gap: 1.5rem; background: white; border: 1px solid #e2e8f0;
    }
    .course-selector label { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; }
    select { 
        background: #f8fafc; color: #1e293b; border: 1px solid #e2e8f0; 
        padding: 0.75rem 1.25rem; border-radius: 8px; font-family: 'Inter', sans-serif; min-width: 250px;
        outline: none; transition: 0.3s;
    }
    select:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px #e0e7ff; }
    
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
    .chart-card { padding: 2rem; border-radius: 20px; background: white; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .chart-card h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; }
    .chart-desc { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }
    
    .chart-wrapper { height: 300px; width: 100%; position: relative; }
    .line-chart { height: 400px; }
    .full-width { width: 100%; }
    .mt-4 { margin-top: 2rem; }
    .no-data { color: #64748b; font-style: italic; text-align: center; padding: 3rem; }
  `]
})
export class InstructorAnalyticsComponent implements OnInit {

  courses: any[] = [];
  selectedCourseId: number | null = null;

  // Global Chart Configurations
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Minute', color: '#64748b' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Drop-offs (Count)', color: '#64748b' } }
    }
  };

  horizontalBarOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Failure Rate (%)', color: '#64748b' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    elements: {
        line: { tension: 0.4, borderWidth: 3 },
        point: { radius: 4, hitRadius: 10, hoverRadius: 6 }
    },
    scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' }, title: { display: true, text: 'Revenue (₹)', color: '#64748b' } }
    }
  };

  dropoffChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  quizChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  revenueChartData: ChartData<'line'> = { labels: [], datasets: [] };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(API_URL + 'courses/created-courses', { withCredentials: true })
      .subscribe(res => this.courses = res);
    
    this.loadGlobalRevenue();
  }

  loadGlobalRevenue() {
    this.http.get<any>(API_URL + 'analytics/instructor/revenue', { withCredentials: true })
      .subscribe(res => {
         const labels = Object.keys(res.monthlyTrend);
         const data = Object.values(res.monthlyTrend) as number[];
         this.revenueChartData = {
           labels: labels,
           datasets: [
             { data: data, label: 'Monthly Revenue', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true }
           ]
         };
      });
  }

  loadCourseData() {
    if (!this.selectedCourseId) return;

    // Load Dropoffs
    this.http.get<any[]>(API_URL + 'analytics/instructor/dropoff-rates/' + this.selectedCourseId, { withCredentials: true })
      .subscribe(data => {
         this.dropoffChartData = {
            labels: data.map(d => 'Min ' + d.minute),
            datasets: [{ data: data.map(d => d.count), label: 'Drops', backgroundColor: '#6366f1' }]
         };
      });

    // Load Quiz Difficulty
    this.http.get<any[]>(API_URL + 'analytics/instructor/quiz-difficulty/' + this.selectedCourseId, { withCredentials: true })
      .subscribe(data => {
         this.quizChartData = {
             labels: data.map(d => d.question.substring(0, 25) + '...'),
             datasets: [{ data: data.map(d => d.failureRate), label: 'Failure Rate %', backgroundColor: '#ef4444' }]
         };
      });
  }
}
