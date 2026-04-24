import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('Main.ts: Bootstrapping Learngrid Application...');
bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Main.ts: Bootstrapping complete!'))
  .catch(err => console.error('Main.ts: Bootstrapping error:', err));
