import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../shared/services/theme.service';
import { PremiumService } from '../../shared/premium/premium.service';
import { ExportService } from '../../shared/export/export.service';
import { TrainingService, TrainingEntry } from '../training/service/training.service';
import { CustomExerciseService, CustomExercise } from '../../data/custom-exercise.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit, OnDestroy {
  theme = inject(ThemeService);
  premium = inject(PremiumService);
  private exportService = inject(ExportService);
  private trainingService = inject(TrainingService);
  private customExerciseService = inject(CustomExerciseService);
  private toast = inject(ToastService);

  private allTrainings: TrainingEntry[] = [];
  private customExercises: CustomExercise[] = [];
  private trainingsSub?: Subscription;
  private customExercisesSub?: Subscription;

  ngOnInit() {
    this.trainingsSub = this.trainingService.getAllTrainings().subscribe(t => this.allTrainings = t);
    this.customExercisesSub = this.customExerciseService.getMyCustomExercises()
      .subscribe(list => this.customExercises = list);
  }

  ngOnDestroy() {
    this.trainingsSub?.unsubscribe();
    this.customExercisesSub?.unsubscribe();
  }

  exportCsv() {
    if (this.allTrainings.length === 0) {
      this.toast.error('Keine Trainingsdaten zum Exportieren vorhanden');
      return;
    }
    this.exportService.exportTrainingsCsv(this.allTrainings, this.customExercises);
    this.toast.success('Export gestartet');
  }
}
