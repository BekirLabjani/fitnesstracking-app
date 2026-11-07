import { ErrorHandler, Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs uncaught errors to Firestore (`errorLogs`, owner-only) so crashes are
 * visible without a user reporting them. Only logs when a user is signed in
 * (pre-login errors have no owner to scope the write to) and never throws
 * itself, since an error handler that can error is worse than none.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private auth = inject(Auth);
  private db = inject(Firestore);

  handleError(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error(error);

    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? (error.stack ?? '') : '';

    addDoc(collection(this.db, 'errorLogs'), {
      userId: uid,
      message: message.slice(0, 2000),
      stack: stack.slice(0, 4000),
      url: location.href,
      userAgent: navigator.userAgent,
      createdAt: serverTimestamp(),
    }).catch(() => {
      // Logging the error failed too (e.g. offline) — swallow, already
      // console.error'd above, nothing more actionable to do client-side.
    });
  }
}
