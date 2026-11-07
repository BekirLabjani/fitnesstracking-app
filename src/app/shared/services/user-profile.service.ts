import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { ActivityLevel, Gender } from '../calorie/calorie-calculator';

export interface UserProfileData {
  displayName?: string;
  photoUrl?: string;
  gender?: Gender;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  calorieMode?: 'auto' | 'manual';
  manualCalories?: number;
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  profile$: Observable<UserProfileData> = new Observable(sub => {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      sub.next({});
      return;
    }
    const unsub = onSnapshot(
      doc(this.db, 'userProfiles', uid),
      snap => sub.next((snap.data() as UserProfileData) ?? {}),
      () => sub.next({})
    );
    return () => unsub();
  });

  async updateProfile(data: Partial<UserProfileData>) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    // Firestore rejects `undefined` field values — drop them instead of writing "nothing".
    const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
    await setDoc(doc(this.db, 'userProfiles', uid), cleaned, { merge: true });
  }
}
