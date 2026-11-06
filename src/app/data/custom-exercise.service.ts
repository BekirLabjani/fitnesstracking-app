import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { Observable, of } from 'rxjs';

export interface CustomExercise {
  id: string;
  userId: string;
  name: string;
  category: string;
  isCardio: boolean;
  createdAt?: any;
}

@Injectable({ providedIn: 'root' })
export class CustomExerciseService {
  private auth = inject(Auth);
  private db = inject(Firestore);
  private get uid(): string | null { return this.auth.currentUser?.uid ?? null; }

  getMyCustomExercises(): Observable<CustomExercise[]> {
    if (!this.uid) return of([]);
    return new Observable(sub => {
      const q = query(collection(this.db, 'customExercises'), where('userId', '==', this.uid));
      const unsub = onSnapshot(q,
        snap => sub.next(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomExercise))),
        err => sub.error(err)
      );
      return () => unsub();
    });
  }

  async addCustomExercise(name: string, category: string, isCardio: boolean): Promise<string> {
    if (!this.uid) throw new Error('Not authenticated');
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error('Name darf nicht leer sein.');
    const ref = await addDoc(collection(this.db, 'customExercises'), {
      userId: this.uid,
      name: trimmedName,
      category: category.trim() || 'Eigene',
      isCardio,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  async deleteCustomExercise(id: string) {
    return deleteDoc(doc(this.db, 'customExercises', id));
  }
}
