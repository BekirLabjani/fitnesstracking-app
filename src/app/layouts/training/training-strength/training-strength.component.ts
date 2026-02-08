import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeHeaderComponent } from '../time-header/time-header.component';
import { BaseChartDirective } from 'ng2-charts';
import { TRAININGS } from '../../../data/training';
import { EXERCISES } from '../../../data/exercise.data';
import { ChartData } from 'chart.js';

const CURRENT_USER_ID = 'uid_bekir_001';

/* ----------------------------------------
   Typen
---------------------------------------- */

type ExerciseId = keyof typeof EXERCISES;

type Period =  'week' | 'month' | 'year';

interface ChartPoint {
  label: string;
  weight: number;
}

/* ----------------------------------------
   Component
---------------------------------------- */

@Component({
  selector: 'app-training-strength',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeHeaderComponent, BaseChartDirective],
  templateUrl: './training-strength.component.html',
  styleUrl: './training-strength.component.scss',
})
export class TrainingStrengthComponent {
  /* ----------------------------------------
     Dropdown
  ---------------------------------------- */

  exercises = Object.entries(EXERCISES).map(([id, data]) => ({
    id: id as ExerciseId,
    name: data.name,
  }));

  private exerciseKeys = Object.keys(EXERCISES) as ExerciseId[];

  selectedExerciseId: ExerciseId = this.exerciseKeys[0];
  selectedPeriod: Period = 'week';

  /* ----------------------------------------
     Getter – sicher
  ---------------------------------------- */

  get selectedExercise() {
    const exercise = EXERCISES[this.selectedExerciseId];
    if (!exercise) {
      throw new Error('Exercise not found');
    }
    return exercise;
  }

  /* ----------------------------------------
     Trainings
  ---------------------------------------- */

  get trainingsForExercise() {
    return TRAININGS.filter(
      (t) =>
        t.userId === CURRENT_USER_ID &&
        t.exerciseId === this.selectedExerciseId,
    );
  }

  /* ----------------------------------------
     Period Data – EINHEITLICH
  ---------------------------------------- */

  get periodData(): ChartPoint[] {
    switch (this.selectedPeriod) {
 
      case 'week':
        return this.getWeeklyMaxWeights();

      case 'month':
        return this.getMonthlyMaxWeights();

      case 'year':
      default:
        return this.mapTrainings(this.trainingsForExercise);
    }
  }

  private mapTrainings(trainings: typeof TRAININGS): ChartPoint[] {
    return trainings.map((t) => ({
      label: t.date,
      weight: t.weight,
    }));
  }

  onPeriodChange(period: Period) {
    this.selectedPeriod = period;
  }

  /* ----------------------------------------
     Grouping
  ---------------------------------------- */

  private getWeekKey(dateString: string): string {
    const date = new Date(dateString);
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const isoYear = d.getUTCFullYear();
    const yearStart = new Date(Date.UTC(isoYear, 0, 1));
    const week = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return `${isoYear}-KW${week}`;
  }

  private getWeeklyMaxWeights(): ChartPoint[] {
    const grouped: Record<string, number> = {};

    for (const t of this.trainingsForExercise) {
      const key = this.getWeekKey(t.date);
      grouped[key] = Math.max(grouped[key] ?? 0, t.weight);
    }

    return Object.entries(grouped).map(([label, weight]) => ({
      label,
      weight,
    }));
  }

  private getMonthKey(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private getMonthlyMaxWeights(): ChartPoint[] {
    const grouped: Record<string, number> = {};

    for (const t of this.trainingsForExercise) {
      const key = this.getMonthKey(t.date);
      grouped[key] = Math.max(grouped[key] ?? 0, t.weight);
    }

    return Object.entries(grouped).map(([label, weight]) => ({
      label,
      weight,
    }));
  }

  /* ----------------------------------------
     Chart
  ---------------------------------------- */

  private createBlueGradient(ctx: CanvasRenderingContext2D) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0.2, 'rgba(0, 194, 243, 0.95)');
    gradient.addColorStop(0.4, 'rgba(0, 217, 255, 0.81)');
    gradient.addColorStop(1, 'rgba(0, 108, 180, 0.9)');
    return gradient;
  }

  get chartData(): ChartData<'bar', number[], string> {
    return {
      labels: this.periodData.map((d) => d.label),
      datasets: [
        {
          label: 'Max Gewicht',
          data: this.periodData.map((d) => d.weight),
          type: 'bar',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx as CanvasRenderingContext2D;
            return this.createBlueGradient(ctx);
          },
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    };
  }
}
