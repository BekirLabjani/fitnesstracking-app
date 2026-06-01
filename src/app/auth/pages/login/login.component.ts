import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthServiceService } from '../../services/auth.service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthServiceService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage = '';
  hidePassword = true;
  loading = false;

  async onSubmit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.loading = true;
    try {
      await this.auth.signIn(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMessage = this.getErrorMessage(e.code);
    } finally {
      this.loading = false;
    }
  }

  async onGoogleLogin() {
    this.loading = true;
    try {
      await this.auth.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.errorMessage = this.getErrorMessage(e.code);
    } finally {
      this.loading = false;
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'Kein Konto mit dieser E-Mail gefunden.';
      case 'auth/wrong-password': return 'Falsches Passwort.';
      case 'auth/invalid-credential': return 'E-Mail oder Passwort falsch.';
      case 'auth/too-many-requests': return 'Zu viele Versuche. Bitte warte kurz.';
      case 'auth/popup-closed-by-user': return 'Anmeldung abgebrochen.';
      default: return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
    }
  }
}
