import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc, onSnapshot, setDoc, deleteField, DocumentData } from 'firebase/firestore';
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

// Body/health fields — must never live in `userProfiles` (readable by every
// signed-in user, needed for friend search). They live in the owner-only
// `users/{uid}` document instead. See the security review that found these
// previously stored in `userProfiles`, exfiltratable via an unfiltered
// collection read by anyone with an account.
const PRIVATE_FIELDS = [
  'gender', 'age', 'heightCm', 'weightKg', 'activityLevel', 'calorieMode', 'manualCalories',
] as const satisfies readonly (keyof UserProfileData)[];

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private auth = inject(Auth);
  private db = inject(Firestore);
  private migratedUids = new Set<string>();

  profile$: Observable<UserProfileData> = new Observable<UserProfileData>(sub => {
    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      sub.next({});
      return;
    }
    this.migrateLegacyFields(uid);

    let publicData: UserProfileData = {};
    let privateData: UserProfileData = {};
    const emit = () => sub.next({ ...publicData, ...privateData });

    const unsubPublic = onSnapshot(doc(this.db, 'userProfiles', uid), snap => {
      publicData = (snap.data() as UserProfileData) ?? {};
      emit();
    });
    const unsubPrivate = onSnapshot(doc(this.db, 'users', uid), snap => {
      privateData = (snap.data() as UserProfileData) ?? {};
      emit();
    });
    return () => { unsubPublic(); unsubPrivate(); };
  });

  async updateProfile(data: Partial<UserProfileData>) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    const publicPart: DocumentData = {};
    const privatePart: DocumentData = {};
    for (const [key, value] of Object.entries(data)) {
      // Firestore rejects `undefined` field values — drop them instead of writing "nothing".
      if (value === undefined) continue;
      if ((PRIVATE_FIELDS as readonly string[]).includes(key)) privatePart[key] = value;
      else publicPart[key] = value;
    }

    const writes: Promise<void>[] = [];
    if (Object.keys(publicPart).length) {
      writes.push(setDoc(doc(this.db, 'userProfiles', uid), publicPart, { merge: true }));
    }
    if (Object.keys(privatePart).length) {
      writes.push(setDoc(doc(this.db, 'users', uid), privatePart, { merge: true }));
    }
    await Promise.all(writes);
  }

  /**
   * One-time cleanup per session/uid: body/health fields used to live in the
   * broadly-readable `userProfiles` document. Moves any leftover legacy
   * fields to the owner-only `users` document and strips them from
   * `userProfiles`. No-op once a profile is already clean.
   */
  private async migrateLegacyFields(uid: string) {
    if (this.migratedUids.has(uid)) return;
    this.migratedUids.add(uid);

    const legacySnap = await getDoc(doc(this.db, 'userProfiles', uid));
    const legacy = legacySnap.data();
    if (!legacy) return;

    const found: DocumentData = {};
    for (const field of PRIVATE_FIELDS) {
      if (legacy[field] !== undefined) found[field] = legacy[field];
    }
    if (Object.keys(found).length === 0) return;

    await setDoc(doc(this.db, 'users', uid), found, { merge: true });
    const clear: DocumentData = {};
    for (const field of PRIVATE_FIELDS) clear[field] = deleteField();
    await setDoc(doc(this.db, 'userProfiles', uid), clear, { merge: true });
  }
}
