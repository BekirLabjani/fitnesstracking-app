import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  doc,
  getDoc,
  setDoc,
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

export interface WeeklyLeaderboardEntry {
  name: string;
  volume: number;
  isMe: boolean;
}

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private auth = inject(Auth);
  private db = inject(Firestore);
  private get uid() { return this.auth.currentUser?.uid ?? null; }

  // No 0/O/1/I/L to avoid characters users could misread when sharing a code.
  private static readonly CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  private static readonly CODE_LENGTH = 8;
  private static readonly MAX_GENERATION_ATTEMPTS = 5;

  private generateCode(): string {
    let code = '';
    for (let i = 0; i < FriendsService.CODE_LENGTH; i++) {
      code += FriendsService.CODE_ALPHABET[Math.floor(Math.random() * FriendsService.CODE_ALPHABET.length)];
    }
    return code;
  }

  /**
   * Returns this user's invite code, generating and persisting a random,
   * collision-checked one on first call. Previously this was just the first
   * 8 characters of the Firebase UID — guessable/collision-prone at scale.
   */
  async getOrCreateMyCode(): Promise<string> {
    if (!this.uid) return '';
    const myRef = doc(this.db, 'userProfiles', this.uid);
    const mySnap = await getDoc(myRef);
    const existing = mySnap.data()?.['codePrefix'];
    if (existing) return (existing as string).toUpperCase();

    for (let attempt = 0; attempt < FriendsService.MAX_GENERATION_ATTEMPTS; attempt++) {
      const candidate = this.generateCode();
      const clash = await getDocs(
        query(collection(this.db, 'userProfiles'), where('codePrefix', '==', candidate.toLowerCase()))
      );
      if (clash.empty) {
        await setDoc(myRef, { codePrefix: candidate.toLowerCase() }, { merge: true });
        return candidate;
      }
    }
    throw new Error('Konnte keinen eindeutigen Code generieren. Bitte erneut versuchen.');
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

    // Deterministic ID (<followerId>_<followedId>) so the Firestore rules
    // for `trainings` can check this relation with exists() by path.
    const relationRef = doc(this.db, 'friends', `${this.uid}_${followedId}`);
    const existing = await getDoc(relationRef);
    if (existing.exists()) throw new Error('Bereits befreundet.');

    await setDoc(relationRef, {
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

  /** Monday (ISO) of the current week, as a 'YYYY-MM-DD' string for lexicographic date comparison. */
  private currentWeekStart(): string {
    const now = new Date();
    const isoDay = now.getUTCDay() || 7; // Sunday=0 -> 7, Monday=1..Saturday=6
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - isoDay + 1));
    return monday.toISOString().split('T')[0];
  }

  private async weeklyStrengthVolume(userId: string, weekStart: string): Promise<number> {
    const snap = await getDocs(query(
      collection(this.db, 'trainings'),
      where('userId', '==', userId),
      where('type', '==', 'strength')
    ));
    return snap.docs
      .map(d => d.data())
      .filter(t => (t['date'] as string) >= weekStart)
      .reduce((sum, t) => sum + (t['weight'] ?? 0) * (t['reps'] ?? 0) * (t['sets'] ?? 0), 0);
  }

  /** This week's (Mon-today) strength training volume for me and my friends, ranked descending. */
  async getWeeklyVolumeLeaderboard(): Promise<WeeklyLeaderboardEntry[]> {
    if (!this.uid) return [];
    const weekStart = this.currentWeekStart();

    const myProfileSnap = await getDoc(doc(this.db, 'userProfiles', this.uid));
    const myName = myProfileSnap.data()?.['displayName'] || 'Ich';
    const myVolume = await this.weeklyStrengthVolume(this.uid, weekStart);

    const friendsSnap = await getDocs(query(collection(this.db, 'friends'), where('followerId', '==', this.uid)));
    const friendEntries = await Promise.all(friendsSnap.docs.map(async d => {
      const data = d.data();
      const volume = await this.weeklyStrengthVolume(data['followedId'], weekStart);
      return { name: data['followedName'] ?? 'Unbekannt', volume, isMe: false };
    }));

    return [{ name: myName, volume: myVolume, isMe: true }, ...friendEntries]
      .sort((a, b) => b.volume - a.volume);
  }

  async saveMyProfile() {
    if (!this.uid || !this.auth.currentUser) return;
    // Only displayName here — codePrefix is owned by getOrCreateMyCode()
    // and must never be overwritten, or a user's shared invite code would
    // silently stop working for people who already saved it.
    await setDoc(doc(this.db, 'userProfiles', this.uid), {
      displayName: this.auth.currentUser.displayName ?? '',
    }, { merge: true });
  }
}
