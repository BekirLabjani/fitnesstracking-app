import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/pages/signup/signup.component').then(m => m.SignupComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./layouts/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'training',
    loadComponent: () => import('./layouts/training/training.component').then(m => m.TrainingComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./layouts/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./layouts/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'trainingsplan',
    loadComponent: () => import('./layouts/trainingsplan/trainingsplan.component').then(m => m.TrainingsplanComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];
