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
import { EXERCISES, resolveExerciseName } from '../../data/exercise.data';
import { CustomExerciseService, CustomExercise } from '../../data/custom-exercise.service';
import { Subscription } from 'rxjs';

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface DayPlan { exercises: string[]; }
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
  private customExerciseService = inject(CustomExerciseService);
  private unsub?: () => void;
  private customExercisesSub?: Subscription;

  days = DAYS;
  dayKeys = DAY_KEYS;
  activeDay = 0;

  plan: WeekPlan = {};
  customExercises: CustomExercise[] = [];

  private readonly builtInExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category !== 'Cardio')
    .map(([id, ex]) => ({ id: id as string, name: ex.name, category: ex.category as string }));

  get allExercises() {
    return [
      ...this.builtInExercises,
      ...this.customExercises.filter(c => !c.isCardio).map(c => ({ id: c.id, name: c.name, category: c.category })),
    ];
  }

  selectedExercise: string | null = null;
  saving = false;

  get uid() { return this.auth.currentUser?.uid; }
  get activeDayKey() { return this.dayKeys[this.activeDay]; }
  get activePlan(): string[] { return this.plan[this.activeDayKey]?.exercises ?? []; }

  ngOnInit() {
    this.customExercisesSub = this.customExerciseService.getMyCustomExercises()
      .subscribe(list => this.customExercises = list);
    if (!this.uid) return;
    const ref = doc(this.db, 'trainingPlans', this.uid);
    this.unsub = onSnapshot(ref, snap => {
      this.plan = (snap.data() as WeekPlan) ?? {};
    });
  }

  ngOnDestroy() {
    this.unsub?.();
    this.customExercisesSub?.unsubscribe();
  }

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

  async removeExercise(ex: string) {
    if (!this.uid) return;
    const current = this.activePlan.filter(e => e !== ex);
    await setDoc(
      doc(this.db, 'trainingPlans', this.uid),
      { [this.activeDayKey]: { exercises: current } },
      { merge: true }
    );
  }

  getExerciseName(id: string) { return resolveExerciseName(id, this.customExercises); }
  getExerciseCategory(id: string) {
    if (id in EXERCISES) return EXERCISES[id as keyof typeof EXERCISES].category;
    return this.customExercises.find(c => c.id === id)?.category ?? '';
  }

  get groupedExercises() {
    const groups: Record<string, { id: string; name: string }[]> = {};
    for (const ex of this.allExercises) {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push({ id: ex.id, name: ex.name });
    }
    return Object.entries(groups);
  }
}
