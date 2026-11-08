import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  user,
  User
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  private auth = inject(Auth);
  private googleProvider = new GoogleAuthProvider();

  currentUser$: Observable<User | null> = user(this.auth);

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // Redirect, not popup: Safari's cross-site tracking protection (ITP)
  // routinely breaks signInWithPopup's storage/postMessage handshake on
  // iOS, with no clear error — redirect avoids that class of failure
  // entirely. The result is picked up by handleGoogleRedirectResult()
  // once the browser navigates back.
  signInWithGoogle() {
    return signInWithRedirect(this.auth, this.googleProvider);
  }

  /** Call once on app startup to complete a signInWithGoogle() redirect, if one is in flight. */
  handleGoogleRedirectResult() {
    return getRedirectResult(this.auth);
  }

  signOut() {
    return signOut(this.auth);
  }

  sendPasswordReset(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  updateDisplayName(name: string) {
    const u = this.auth.currentUser;
    if (!u) throw new Error('Not authenticated');
    return updateProfile(u, { displayName: name });
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}
