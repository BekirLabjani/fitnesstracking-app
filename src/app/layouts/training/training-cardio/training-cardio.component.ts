import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { EXERCISES } from '../../../data/exercise.data';
import { TrainingService, TrainingEntry } from '../service/training.service';
import { TimeHeaderComponent } from '../time-header/time-header.component';
import { Subscription } from 'rxjs';

type ExerciseId = keyof typeof EXERCISES;
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
  private sub?: Subscription;

  exercises = Object.entries(EXERCISES)
    .filter(([, ex]) => ex.category === 'Cardio')
    .map(([id, data]) => ({ id: id as ExerciseId, name: data.name }));

  private _selectedExerciseId: ExerciseId = this.exercises[0].id;
  get selectedExerciseId(): ExerciseId { return this._selectedExerciseId; }
  set selectedExerciseId(val: ExerciseId) {
    this._selectedExerciseId = val;
    this.loadTrainings();
  }

  selectedPeriod: Period = 'week';
  trainings: TrainingEntry[] = [];

  get selectedExercise() { return EXERCISES[this.selectedExerciseId]; }

  ngOnInit() { this.loadTrainings(); }
  ngOnDestroy() { this.sub?.unsubscribe(); }

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
