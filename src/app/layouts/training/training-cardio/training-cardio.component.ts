import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { EXERCISES, resolveExerciseName } from '../../../data/exercise.data';
import { CustomExerciseService, CustomExercise } from '../../../data/custom-exercise.service';
import { TrainingService, TrainingEntry } from '../service/training.service';
import { TimeHeaderComponent } from '../time-header/time-header.component';
import { Subscription } from 'rxjs';

type Period = 'week' | 'month' | 'year';
interface ChartPoint { label: string; value: number; }

@Component({
  selector: 'app-training-cardio',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, TimeHeaderComponent],
  templateUrl: './training-cardio.component.html',
  styleUrl: './training-cardio.component.scss',
})
export class TrainingCardioComponent implements OnInit, OnDestroy {
  private trainingService = inject(TrainingService);
  private customExerciseService = inject(CustomExerciseService);
  private sub?: Subscription;
  private customExercisesSub?: Subscription;

  private customExercises: CustomExercise[] = [];

  private readonly builtInExercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category === 'Cardio')
    .map(([id, data]) => ({ id: id as string, name: data.name }));

  get exercises() {
    return [
      ...this.builtInExercises,
      ...this.customExercises.filter(c => c.isCardio).map(c => ({ id: c.id, name: c.name })),
    ];
  }

  private _selectedExerciseId: string = this.builtInExercises[0].id;
  get selectedExerciseId(): string { return this._selectedExerciseId; }
  set selectedExerciseId(val: string) {
    this._selectedExerciseId = val;
    this.loadTrainings();
  }

  selectedPeriod: Period = 'week';
  trainings: TrainingEntry[] = [];

  get selectedExercise() {
    return { name: resolveExerciseName(this.selectedExerciseId, this.customExercises) };
  }

  ngOnInit() {
    this.loadTrainings();
    this.customExercisesSub = this.customExerciseService.getMyCustomExercises()
      .subscribe(list => this.customExercises = list);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.customExercisesSub?.unsubscribe();
  }

  private loadTrainings() {
    this.sub?.unsubscribe();
    this.sub = this.trainingService.getCardioTrainings(this.selectedExerciseId)
      .subscribe(data => this.trainings = data);
  }

  onPeriodChange(period: Period) { this.selectedPeriod = period; }

  get periodData(): ChartPoint[] {
    switch (this.selectedPeriod) {
      case 'week': return this.getWeeklyMax();
      case 'month': return this.getMonthlyMax();
      default: return this.trainings.map(t => ({ label: t.date, value: t.duration ?? 0 }));
    }
  }

  private getWeekKey(dateStr: string): string {
    const date = new Date(dateStr);
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-KW${week}`;
  }

  private getWeeklyMax(): ChartPoint[] {
    const grouped: Record<string, number> = {};
    for (const t of this.trainings) {
      const key = this.getWeekKey(t.date);
      grouped[key] = Math.max(grouped[key] ?? 0, t.duration ?? 0);
    }
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }

  private getMonthlyMax(): ChartPoint[] {
    const grouped: Record<string, number> = {};
    for (const t of this.trainings) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      grouped[key] = Math.max(grouped[key] ?? 0, t.duration ?? 0);
    }
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }

  private createGradient(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, 'rgba(255, 107, 107, 0.95)');
    g.addColorStop(0.5, 'rgba(255, 142, 83, 0.85)');
    g.addColorStop(1, 'rgba(255, 65, 65, 0.7)');
    return g;
  }

  get chartData(): ChartData<'bar', number[], string> {
    return {
      labels: this.periodData.map(d => d.label),
      datasets: [{
        label: 'Dauer (min)',
        data: this.periodData.map(d => d.value),
        backgroundColor: (ctx) => this.createGradient(ctx.chart.ctx as CanvasRenderingContext2D),
        borderRadius: 10,
        borderSkipped: false,
      }],
    };
  }
}
