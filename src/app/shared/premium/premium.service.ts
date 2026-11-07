import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PremiumService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  isPremium$: Observable<boolean> = new Observable(sub => {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      sub.next(false);
      return;
    }
    const unsub = onSnapshot(
      doc(this.db, 'entitlements', uid),
      snap => sub.next(snap.exists() ? !!snap.data()?.['isPremium'] : false),
      () => sub.next(false)
    );
    return () => unsub();
  });
}
