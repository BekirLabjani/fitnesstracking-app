import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { Observable, of } from 'rxjs';

export interface FriendConnection {
  id?: string;
  followerId: string;
  followedId: string;
  followedName: string;
  createdAt?: any;
}

export interface FriendBestLift {
  exerciseName: string;
  weight: number;
}

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private auth = inject(Auth);
  private get db() { return getFirestore(); }
  private get uid() { return this.auth.currentUser?.uid ?? null; }

  get myInviteCode(): string {
    return this.uid?.substring(0, 8).toUpperCase() ?? '';
  }

  async addFriend(code: string): Promise<string> {
    if (!this.uid) throw new Error('Not authenticated');
    const trimmed = code.trim().toLowerCase();

    const usersSnap = await getDocs(
      query(collection(this.db, 'userProfiles'), where('codePrefix', '==', trimmed))
    );

    if (usersSnap.empty) throw new Error('Kein Nutzer mit diesem Code gefunden.');

    const friendDoc = usersSnap.docs[0];
    const followedId = friendDoc.id;
    if (followedId === this.uid) throw new Error('Du kannst dich nicht selbst hinzufügen.');

    const existing = await getDocs(query(
      collection(this.db, 'friends'),
      where('followerId', '==', this.uid),
      where('followedId', '==', followedId)
    ));
    if (!existing.empty) throw new Error('Bereits befreundet.');

    await addDoc(collection(this.db, 'friends'), {
      followerId: this.uid,
      followedId,
      followedName: friendDoc.data()['displayName'] ?? 'Unbekannt',
      createdAt: serverTimestamp(),
    });
    return friendDoc.data()['displayName'] ?? 'Unbekannt';
  }

  getMyFriends(): Observable<FriendConnection[]> {
    if (!this.uid) return of([]);
    return new Observable(sub => {
      const q = query(collection(this.db, 'friends'), where('followerId', '==', this.uid));
      const unsub = onSnapshot(q, snap => {
        sub.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as FriendConnection)));
      });
      return () => unsub();
    });
  }

  async getFriendBestLifts(friendId: string): Promise<FriendBestLift[]> {
    const snap = await getDocs(query(
      collection(this.db, 'trainings'),
      where('userId', '==', friendId),
      where('type', '==', 'strength')
    ));
    const byExercise: Record<string, number> = {};
    snap.docs.forEach(d => {
      const data = d.data();
      const ex = data['exerciseId'];
      const w = data['weight'] ?? 0;
      byExercise[ex] = Math.max(byExercise[ex] ?? 0, w);
    });
    const { EXERCISES } = await import('../../data/exercise.data');
    return Object.entries(byExercise).map(([id, weight]) => ({
      exerciseName: EXERCISES[id as keyof typeof EXERCISES]?.name ?? id,
      weight,
    })).sort((a, b) => b.weight - a.weight);
  }

  async saveMyProfile() {
    if (!this.uid || !this.auth.currentUser) return;
    const { setDoc, doc } = await import('firebase/firestore');
    await setDoc(doc(this.db, 'userProfiles', this.uid), {
      displayName: this.auth.currentUser.displayName ?? '',
      codePrefix: this.uid.substring(0, 8).toLowerCase(),
    }, { merge: true });
  }
}
