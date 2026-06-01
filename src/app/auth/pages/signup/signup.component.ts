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
  selector: 'app-signup',
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
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthServiceService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  errorMessage = '';
  hidePassword = true;
  hideConfirm = true;
  loading = false;

  async onSubmit() {
    if (this.form.invalid) return;
    const { email, password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Passwörter stimmen nicht überein.';
      return;
    }
    this.loading = true;
    try {
      await this.auth.signUp(email!, password!);
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
      case 'auth/email-already-in-use': return 'Diese E-Mail ist bereits registriert.';
      case 'auth/weak-password': return 'Passwort zu schwach (min. 6 Zeichen).';
      case 'auth/invalid-email': return 'Ungültige E-Mail-Adresse.';
      case 'auth/popup-closed-by-user': return 'Anmeldung abgebrochen.';
      default: return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
    }
  }
}
