import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { DashboardComponent } from './layouts/dashboard/dashboard.component';
import { TrainingComponent } from './layouts/training/training.component';
import { ProfileComponent } from './layouts/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Ohne diese Zeile weiß Angular nicht: Welche Seite soll ich zeigen, wenn jemand die App öffnet?
  { path: 'dashboard', component: DashboardComponent },
  { path: 'training', component: TrainingComponent },
  { path: 'profile', component: ProfileComponent },
];
