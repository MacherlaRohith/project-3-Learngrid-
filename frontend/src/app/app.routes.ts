import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { OAuth2CallbackComponent } from './components/oauth2-callback/oauth2-callback.component';
import { AssessmentTestComponent } from './components/assessment-test/assessment-test.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentDashboardComponent } from './components/dashboard/student-dashboard.component';
import { InstructorDashboardComponent } from './components/dashboard/instructor-dashboard.component';
import { CourseViewComponent } from './components/course-view/course-view.component';
import { CourseManageComponent } from './components/course-manage/course-manage.component';
import { CodePlaygroundComponent } from './components/code-playground/code-playground.component';
import { CourseListComponent } from './components/course-list/course-list.component';
import { LandingComponent } from './components/landing/landing.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AuthGuard } from './services/auth.guard';
import { VerifyCertificateComponent } from './components/verify-certificate/verify-certificate.component';
import { InstructorAnalyticsComponent } from './components/instructor-analytics/instructor-analytics.component';

export const routes: Routes = [
  { path: 'verify-certificate/:uuid', component: VerifyCertificateComponent },
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'oauth2/callback', component: OAuth2CallbackComponent },
  { path: 'assessment/:id', component: AssessmentTestComponent },
  { path: 'playground', component: CodePlaygroundComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'student', 
    component: StudentDashboardComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_STUDENT'] }
  },
  { 
    path: 'course/:id', 
    component: CourseViewComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'courses', 
    component: CourseListComponent
  },
  { 
    path: 'instructor', 
    component: InstructorDashboardComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },
  { 
    path: 'instructor/manage/:id', 
    component: CourseManageComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },
  { 
    path: 'instructor/analytics', 
    component: InstructorAnalyticsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_INSTRUCTOR', 'ROLE_ADMIN'] }
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  { path: '**', redirectTo: '' }
];
