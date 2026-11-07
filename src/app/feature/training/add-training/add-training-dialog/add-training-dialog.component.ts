import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import confetti from 'canvas-confetti';
import { EXERCISES, resolveExerciseName } from '../../../../data/exercise.data';
import { CustomExerciseService, CustomExercise } from '../../../../data/custom-exercise.service';
import { TrainingService, TrainingEntry } from '../../../../layouts/training/service/training.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { Subscription } from 'rxjs';

type TrainingType = 'strength' | 'cardio' | 'body';
const WEIGHT_INCREMENT_KG = 2.5;

@Component({
  selector: 'app-add-training-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatProgressSpinnerModule,
  ],
  templateUrl: './add-training-dialog.component.html',
  styleUrl: './add-training-dialog.component.scss',
})
export class AddTrainingDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<AddTrainingDialogComponent>);
  private trainingService = inject(TrainingService);
  private customExerciseService = inject(CustomExerciseService);
  private toast = inject(ToastService);

  private customExercises: CustomExercise[] = [];
  private customExercisesSub?: Subscription;
  private lastEntrySub?: Subscription;

  activeType: TrainingType = 'strength';

  private readonly builtInStrengthExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category !== 'Cardio')
    .map(([id, ex]) => ({ id: id as string, label: ex.name }));

  private readonly builtInCardioExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category === 'Cardio')
    .map(([id, ex]) => ({ id: id as string, label: ex.name }));

  get strengthExercises() {
    return [
      ...this.builtInStrengthExercises,
      ...this.customExercises.filter(c => !c.isCardio).map(c => ({ id: c.id, label: c.name })),
    ];
  }

  get cardioExercises() {
    return [
      ...this.builtInCardioExercises,
      ...this.customExercises.filter(c => c.isCardio).map(c => ({ id: c.id, label: c.name })),
    ];
  }

  selectedStrengthExercise: string = this.builtInStrengthExercises[0].id;
  kg = 0; wdh = 0; saetze = 0;
  rpe: number | null = null;
  readonly rpeScale = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  selectedCardioExercise: string = this.builtInCardioExercises[0].id;
  dauer = 0; distanz = 0;

  koerpergewicht = 0;
  notes = '';
  saving = false;
  error = '';

  // ── Eigene Übung anlegen ──────────────────────────────
  showAddExercise = false;
  newExerciseName = '';

  // ── Progressions-Vorschlag ────────────────────────────
  lastStrengthEntry: TrainingEntry | null = null;

  ngOnInit() {
    this.customExercisesSub = this.customExerciseService.getMyCustomExercises()
      .subscribe(list => this.customExercises = list);
    this.loadLastStrengthEntry();
  }

  ngOnDestroy() {
    this.customExercisesSub?.unsubscribe();
    this.lastEntrySub?.unsubscribe();
  }

  get pace(): string {
    if (!this.distanz || !this.dauer) return '–';
    const mPerKm = this.dauer / this.distanz;
    const min = Math.floor(mPerKm);
    const sec = Math.round((mPerKm - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  setType(type: TrainingType) { this.activeType = type; this.error = ''; }
  close() { this.dialogRef.close(); }

  onStrengthExerciseChange() {
    this.loadLastStrengthEntry();
  }

  private loadLastStrengthEntry() {
    this.lastEntrySub?.unsubscribe();
    this.lastStrengthEntry = null;
    this.lastEntrySub = this.trainingService.getStrengthTrainings(this.selectedStrengthExercise)
      .subscribe(entries => this.lastStrengthEntry = entries.length ? entries[entries.length - 1] : null);
  }

  get suggestedWeight(): number | null {
    const last = this.lastStrengthEntry;
    if (last?.weight === undefined) return null;
    return last.weight + WEIGHT_INCREMENT_KG;
  }

  applySuggestion() {
    const last = this.lastStrengthEntry;
    if (!last) return;
    this.kg = this.suggestedWeight ?? last.weight ?? this.kg;
    this.wdh = last.reps ?? this.wdh;
    this.saetze = last.sets ?? this.saetze;
  }

  toggleAddExercise() {
    this.showAddExercise = !this.showAddExercise;
    this.newExerciseName = '';
    this.error = '';
  }

  async saveNewExercise() {
    if (!this.newExerciseName.trim()) return;
    const isCardio = this.activeType === 'cardio';
    try {
      const id = await this.customExerciseService.addCustomExercise(
        this.newExerciseName, isCardio ? 'Cardio' : 'Eigene', isCardio
      );
      if (isCardio) {
        this.selectedCardioExercise = id;
      } else {
        this.selectedStrengthExercise = id;
        this.onStrengthExerciseChange();
      }
      this.toast.success('Übung hinzugefügt!');
      this.toggleAddExercise();
    } catch {
      this.error = 'Übung konnte nicht gespeichert werden.';
    }
  }

  async save() {
    this.error = '';
    this.saving = true;
    try {
      if (this.activeType === 'strength') {
        if (!this.kg || !this.wdh || !this.saetze) { this.error = 'Bitte alle Felder ausfüllen.'; return; }
        const isPR = await this.checkIfPR(this.selectedStrengthExercise, this.kg);
        await this.trainingService.addStrengthTraining(
          this.selectedStrengthExercise, this.kg, this.wdh, this.saetze, this.notes, this.rpe ?? undefined
        );
        if (isPR) {
          this.firePRConfetti();
          this.toast.pr(`🏆 Neues PR! ${this.kg} kg ${resolveExerciseName(this.selectedStrengthExercise, this.customExercises)}`);
        } else {
          this.toast.success('Training gespeichert!');
        }
      } else if (this.activeType === 'cardio') {
        if (!this.dauer) { this.error = 'Bitte Dauer eingeben.'; return; }
        await this.trainingService.addCardioTraining(
          this.selectedCardioExercise, this.dauer, this.distanz, this.notes
        );
        this.toast.success('Cardio gespeichert!');
      } else {
        if (!this.koerpergewicht) { this.error = 'Bitte Gewicht eingeben.'; return; }
        await this.trainingService.addBodyWeight(this.koerpergewicht, this.notes);
        this.toast.success('Gewicht gespeichert!');
      }
      this.dialogRef.close(true);
    } catch {
      this.error = 'Fehler beim Speichern.';
    } finally {
      this.saving = false;
    }
  }

  private async checkIfPR(exerciseId: string, weight: number): Promise<boolean> {
    return new Promise(resolve => {
      const sub = this.trainingService.getStrengthTrainings(exerciseId).subscribe(entries => {
        sub.unsubscribe();
        const maxPrev = Math.max(0, ...entries.map(e => e.weight ?? 0));
        resolve(weight > maxPrev);
      });
    });
  }

  private firePRConfetti() {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#FBBF24','#F59E0B','#FCD34D','#FEF3C7'] });
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.4 } }), 300);
  }
}
