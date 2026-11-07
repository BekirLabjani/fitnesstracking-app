import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CalorieLogService } from '../../../shared/calorie/calorie-log.service';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-add-calorie-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './add-calorie-dialog.component.html',
  styleUrl: './add-calorie-dialog.component.scss',
})
export class AddCalorieDialogComponent {
  private dialogRef = inject(MatDialogRef<AddCalorieDialogComponent>);
  private calorieLogService = inject(CalorieLogService);
  private toast = inject(ToastService);

  kcal: number | null = null;
  protein: number | null = null;
  carbs: number | null = null;
  fat: number | null = null;
  note = '';

  showMacros = false;
  saving = false;
  error = '';

  close() { this.dialogRef.close(); }
  toggleMacros() { this.showMacros = !this.showMacros; }

  async save() {
    this.error = '';
    if (!this.kcal || this.kcal <= 0) {
      this.error = 'Bitte Kalorien eingeben.';
      return;
    }
    this.saving = true;
    try {
      await this.calorieLogService.addEntry(
        this.kcal,
        this.protein ?? undefined,
        this.carbs ?? undefined,
        this.fat ?? undefined,
        this.note
      );
      this.toast.success('Kalorien eingetragen!');
      this.dialogRef.close(true);
    } catch {
      this.error = 'Fehler beim Speichern.';
    } finally {
      this.saving = false;
    }
  }
}
