import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { EXERCISES, ExerciseId } from '../../data/exercise.data';
import { Subscription } from 'rxjs';

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface DayPlan { exercises: ExerciseId[]; }
type WeekPlan = Record<string, DayPlan>;

@Component({
  selector: 'app-trainingsplan',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './trainingsplan.component.html',
  styleUrl: './trainingsplan.component.scss',
})
export class TrainingsplanComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private db = inject(Firestore);
  private unsub?: () => void;

  days = DAYS;
  dayKeys = DAY_KEYS;
  activeDay = 0;

  plan: WeekPlan = {};
  allExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category !== 'Cardio')
    .map(([id, ex]) => ({ id: id as ExerciseId, name: ex.name, category: ex.category }));

  selectedExercise: ExerciseId | null = null;
  saving = false;

  get uid() { return this.auth.currentUser?.uid; }
  get activeDayKey() { return this.dayKeys[this.activeDay]; }
  get activePlan(): ExerciseId[] { return this.plan[this.activeDayKey]?.exercises ?? []; }

  ngOnInit() {
    if (!this.uid) return;
    const ref = doc(this.db, 'trainingPlans', this.uid);
    this.unsub = onSnapshot(ref, snap => {
      this.plan = (snap.data() as WeekPlan) ?? {};
    });
  }

  ngOnDestroy() { this.unsub?.(); }

  async addExercise() {
    if (!this.selectedExercise || !this.uid) return;
    const current = [...this.activePlan];
    if (current.includes(this.selectedExercise)) return;
    current.push(this.selectedExercise);
    await setDoc(
      doc(this.db, 'trainingPlans', this.uid),
      { [this.activeDayKey]: { exercises: current } },
      { merge: true }
    );
    this.selectedExercise = null;
  }

  async removeExercise(ex: ExerciseId) {
    if (!this.uid) return;
    const current = this.activePlan.filter(e => e !== ex);
    await setDoc(
      doc(this.db, 'trainingPlans', this.uid),
      { [this.activeDayKey]: { exercises: current } },
      { merge: true }
    );
  }

  getExerciseName(id: ExerciseId) { return EXERCISES[id]?.name ?? id; }
  getExerciseCategory(id: ExerciseId) { return EXERCISES[id]?.category ?? ''; }

  get groupedExercises() {
    const groups: Record<string, { id: ExerciseId; name: string }[]> = {};
    for (const ex of this.allExercises) {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push({ id: ex.id, name: ex.name });
    }
    return Object.entries(groups);
  }
}
