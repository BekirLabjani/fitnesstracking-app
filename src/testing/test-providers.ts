import { provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { Chart, registerables } from 'chart.js';
import { environment } from '../environments/environment';

// main.ts registers Chart.js controllers for the real app bootstrap, which
// Karma's test bundle never runs — register here so ng2-charts works in specs.
Chart.register(...registerables);

/**
 * Shared DI providers for specs whose components/services inject Auth,
 * Firestore, Storage or Router — mirrors app.config.ts so TestBed resolves
 * the same tokens the real app uses. Guards against "Firebase App '[DEFAULT]'
 * already exists" since Karma loads every spec into one shared JS realm.
 */
export const TEST_PROVIDERS = [
  provideFirebaseApp(() => (getApps().length ? getApp() : initializeApp(environment.firebase))),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore()),
  provideStorage(() => getStorage()),
  provideRouter([]),
  provideNoopAnimations(),
];
