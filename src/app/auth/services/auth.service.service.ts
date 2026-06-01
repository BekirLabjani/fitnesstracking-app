import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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

  signInWithGoogle() {
    return signInWithPopup(this.auth, this.googleProvider);
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
