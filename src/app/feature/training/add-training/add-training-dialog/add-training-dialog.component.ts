import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import confetti from 'canvas-confetti';
import { EXERCISES, ExerciseId } from '../../../../data/exercise.data';
import { TrainingService } from '../../../../layouts/training/service/training.service';
import { ToastService } from '../../../../shared/toast/toast.service';

type TrainingType = 'strength' | 'cardio' | 'body';

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
export class AddTrainingDialogComponent {
  private dialogRef = inject(MatDialogRef<AddTrainingDialogComponent>);
  private trainingService = inject(TrainingService);
  private toast = inject(ToastService);

  activeType: TrainingType = 'strength';

  strengthExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category !== 'Cardio')
    .map(([id, ex]) => ({ id: id as ExerciseId, label: ex.name }));

  cardioExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category === 'Cardio')
    .map(([id, ex]) => ({ id: id as ExerciseId, label: ex.name }));

  selectedStrengthExercise: ExerciseId = this.strengthExercises[0].id;
  kg = 0; wdh = 0; saetze = 0;

  selectedCardioExercise: ExerciseId = this.cardioExercises[0].id;
  dauer = 0; distanz = 0;

  koerpergewicht = 0;
  notes = '';
  saving = false;
  error = '';

  get pace(): string {
    if (!this.distanz || !this.dauer) return '–';
    const mPerKm = this.dauer / this.distanz;
    const min = Math.floor(mPerKm);
    const sec = Math.round((mPerKm - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  setType(type: TrainingType) { this.activeType = type; this.error = ''; }
  close() { this.dialogRef.close(); }

  async save() {
    this.error = '';
    this.saving = true;
    try {
      if (this.activeType === 'strength') {
        if (!this.kg || !this.wdh || !this.saetze) { this.error = 'Bitte alle Felder ausfüllen.'; return; }
        const isPR = await this.checkIfPR(this.selectedStrengthExercise, this.kg);
        await this.trainingService.addStrengthTraining(
          this.selectedStrengthExercise, this.kg, this.wdh, this.saetze, this.notes
        );
        if (isPR) {
          this.firePRConfetti();
          this.toast.pr(`🏆 Neues PR! ${this.kg} kg ${EXERCISES[this.selectedStrengthExercise].name}`);
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
