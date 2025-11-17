// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/file-upload/file-upload.component').then(m => m.FileUploadComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'analysis/:id',
    loadComponent: () => import('./components/analysis-details/analysis-details.component').then(m => m.AnalysisDetailsComponent)
  },
  { path: '**', redirectTo: '' }
];
