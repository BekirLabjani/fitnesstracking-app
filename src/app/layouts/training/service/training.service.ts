import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { Observable, of } from 'rxjs';

export interface TrainingEntry {
  id?: string;
  userId: string;
  type: 'strength' | 'cardio' | 'body';
  exerciseId?: string;
  date: string;
  weight?: number;
  reps?: number;
  sets?: number;
  duration?: number;
  distance?: number;
  bodyWeight?: number;
  notes?: string;
  createdAt?: any;
}

let firestoreInitialized = false;

function getDb() {
  if (!firestoreInitialized) {
    try {
      initializeFirestore(getApp(), {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
      firestoreInitialized = true;
    } catch {
      // Already initialized
    }
  }
  return getFirestore();
}

@Injectable({ providedIn: 'root' })
export class TrainingService {
  private auth = inject(Auth);

  private get db() { return getDb(); }
  private get uid(): string | null { return this.auth.currentUser?.uid ?? null; }
  private today(): string { return new Date().toISOString().split('T')[0]; }

  async addStrengthTraining(exerciseId: string, weight: number, reps: number, sets: number, notes = '') {
    if (!this.uid) throw new Error('Not authenticated');
    return addDoc(collection(this.db, 'trainings'), {
      userId: this.uid, type: 'strength', exerciseId,
      date: this.today(), weight, reps, sets, notes, createdAt: serverTimestamp(),
    });
  }

  async addCardioTraining(exerciseId: string, duration: number, distance: number, notes = '') {
    if (!this.uid) throw new Error('Not authenticated');
    return addDoc(collection(this.db, 'trainings'), {
      userId: this.uid, type: 'cardio', exerciseId,
      date: this.today(), duration, distance, notes, createdAt: serverTimestamp(),
    });
  }

  async addBodyWeight(bodyWeight: number, notes = '') {
    if (!this.uid) throw new Error('Not authenticated');
    return addDoc(collection(this.db, 'trainings'), {
      userId: this.uid, type: 'body',
      date: this.today(), bodyWeight, notes, createdAt: serverTimestamp(),
    });
  }

  async deleteTraining(id: string) {
    return deleteDoc(doc(this.db, 'trainings', id));
  }

  private queryTrainings(filters: any[]): Observable<TrainingEntry[]> {
    if (!this.uid) return of([]);
    return new Observable(sub => {
      const q = query(collection(this.db, 'trainings'), ...filters);
      const unsub = onSnapshot(q,
        snap => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as TrainingEntry));
          sub.next(data.sort((a, b) => a.date.localeCompare(b.date)));
        },
        err => sub.error(err)
      );
      return () => unsub();
    });
  }

  getStrengthTrainings(exerciseId: string): Observable<TrainingEntry[]> {
    return this.queryTrainings([
      where('userId', '==', this.uid),
      where('type', '==', 'strength'),
      where('exerciseId', '==', exerciseId),
    ]);
  }

  getCardioTrainings(exerciseId: string): Observable<TrainingEntry[]> {
    return this.queryTrainings([
      where('userId', '==', this.uid),
      where('type', '==', 'cardio'),
      where('exerciseId', '==', exerciseId),
    ]);
  }

  getBodyWeights(): Observable<TrainingEntry[]> {
    return this.queryTrainings([where('userId', '==', this.uid), where('type', '==', 'body')]);
  }

  getAllTrainings(): Observable<TrainingEntry[]> {
    return this.queryTrainings([where('userId', '==', this.uid)]);
  }
}
