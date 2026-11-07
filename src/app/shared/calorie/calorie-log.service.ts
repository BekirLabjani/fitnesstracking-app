import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Observable, of } from 'rxjs';

export interface CalorieLogEntry {
  id?: string;
  userId: string;
  date: string;
  kcal: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  note?: string;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class CalorieLogService {
  private auth = inject(Auth);
  private db = inject(Firestore);

  private get uid(): string | null { return this.auth.currentUser?.uid ?? null; }
  private today(): string { return new Date().toISOString().split('T')[0]; }

  async addEntry(kcal: number, protein?: number, carbs?: number, fat?: number, note = '') {
    if (!this.uid) throw new Error('Not authenticated');
    return addDoc(collection(this.db, 'calorieLogs'), {
      userId: this.uid,
      date: this.today(),
      kcal,
      ...(protein !== undefined ? { protein } : {}),
      ...(carbs !== undefined ? { carbs } : {}),
      ...(fat !== undefined ? { fat } : {}),
      note,
      createdAt: serverTimestamp(),
    });
  }

  async deleteEntry(id: string) {
    return deleteDoc(doc(this.db, 'calorieLogs', id));
  }

  getAllEntries(): Observable<CalorieLogEntry[]> {
    if (!this.uid) return of([]);
    return new Observable(sub => {
      const q = query(collection(this.db, 'calorieLogs'), where('userId', '==', this.uid));
      const unsub = onSnapshot(
        q,
        snap => sub.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as CalorieLogEntry))),
        err => sub.error(err)
      );
      return () => unsub();
    });
  }
}
