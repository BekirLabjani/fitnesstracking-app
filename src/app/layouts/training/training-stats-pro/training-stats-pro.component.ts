import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { TrainingService, TrainingEntry } from '../service/training.service';
import { CustomExerciseService, CustomExercise } from '../../../data/custom-exercise.service';
import { EXERCISES, resolveExerciseName } from '../../../data/exercise.data';
import { PremiumService } from '../../../shared/premium/premium.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-stats-pro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BaseChartDirective],
  templateUrl: './training-stats-pro.component.html',
  styleUrl: './training-stats-pro.component.scss',
})
export class TrainingStatsProComponent implements OnInit, OnDestroy {
  private trainingService = inject(TrainingService);
  private customExerciseService = inject(CustomExerciseService);
  premium = inject(PremiumService);

  private sub?: Subscription;
  private customExercisesSub?: Subscription;

  allTrainings: TrainingEntry[] = [];
  customExercises: CustomExercise[] = [];
  selectedExerciseId = '';

  ngOnInit() {
    this.sub = this.trainingService.getAllTrainings().subscribe(data => this.allTrainings = data);
    this.customExercisesSub = this.customExerciseService.getMyCustomExercises()
      .subscribe(list => this.customExercises = list);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.customExercisesSub?.unsubscribe();
  }

  private categoryOf(id: string): string {
    if (id in EXERCISES) return EXERCISES[id as keyof typeof EXERCISES].category;
    return this.customExercises.find(c => c.id === id)?.category ?? 'Sonstiges';
  }

  get strengthExerciseOptions(): { id: string; name: string }[] {
    const ids = new Set(
      this.allTrainings.filter(t => t.type === 'strength' && t.exerciseId).map(t => t.exerciseId!)
    );
    return [...ids].map(id => ({ id, name: resolveExerciseName(id, this.customExercises) }));
  }

  // ── Volumen-Trend (volle Historie, Wochen-Buckets) ──
  get volumeTrendChartData(): ChartData<'line', number[], string> {
    const weeks: Record<string, number> = {};
    this.allTrainings
      .filter(t => t.type === 'strength')
      .forEach(t => {
        const key = this.getWeekLabel(t.date);
        const vol = (t.weight ?? 0) * (t.reps ?? 0) * (t.sets ?? 0);
        weeks[key] = (weeks[key] ?? 0) + vol;
      });
    const sorted = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b));
    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: 'Volumen (kg)',
        data: sorted.map(([, v]) => v),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.15)',
        fill: true,
        tension: 0.3,
      }],
    };
  }

  // ── Muskelgruppen-Verteilung ──
  get muscleGroupChartData(): ChartData<'bar', number[], string> {
    const groups: Record<string, number> = {};
    this.allTrainings
      .filter(t => t.type === 'strength' && t.exerciseId)
      .forEach(t => {
        const cat = this.categoryOf(t.exerciseId!);
        const vol = (t.weight ?? 0) * (t.reps ?? 0) * (t.sets ?? 0);
        groups[cat] = (groups[cat] ?? 0) + vol;
      });
    const sorted = Object.entries(groups).sort(([, a], [, b]) => b - a);
    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: 'Volumen (kg)',
        data: sorted.map(([, v]) => v),
        backgroundColor: 'rgba(168,85,247,0.7)',
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  }

  // ── Fortschritt pro Übung ──
  get exerciseProgressChartData(): ChartData<'line', number[], string> {
    const entries = this.allTrainings
      .filter(t => t.type === 'strength' && t.exerciseId === this.selectedExerciseId && t.weight !== undefined);
    return {
      labels: entries.map(t => t.date),
      datasets: [{
        label: 'Gewicht (kg)',
        data: entries.map(t => t.weight!),
        borderColor: 'rgba(34,197,94,1)',
        backgroundColor: 'rgba(34,197,94,0.15)',
        fill: true,
        tension: 0.3,
      }],
    };
  }

  private getWeekLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-KW${week}`;
  }
}
