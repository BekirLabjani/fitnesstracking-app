import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore } from '@angular/fire/firestore';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    // Initialized once here (DI factory context) so every injected Firestore
    // instance across the app shares the same offline persistent cache.
    provideFirestore(() => initializeFirestore(getApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })),
    provideStorage(() => getStorage()),
  ]
};
