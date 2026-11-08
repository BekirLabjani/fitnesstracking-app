import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast.component';
import { AuthServiceService } from './auth/services/auth.service.service';
import { ToastService } from './shared/toast/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet></router-outlet><app-toast></app-toast>`
})
export class AppComponent {
  private auth = inject(AuthServiceService);
  private router = inject(Router);
  private toast = inject(ToastService);

  constructor() {
    // Completes signInWithGoogle()'s redirect, if the app just loaded
    // because the browser navigated back from Google's OAuth page.
    // Resolves to null (no-op) on every other page load.
    this.auth.handleGoogleRedirectResult()
      .then(result => {
        if (result) this.router.navigate(['/dashboard']);
      })
      .catch(() => {
        this.toast.error('Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
      });
  }
}
