import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { TrainingService, TrainingEntry } from '../service/training.service';
import { EXERCISES } from '../../../data/exercise.data';
import { Subscription } from 'rxjs';

interface PR { exerciseName: string; weight: number; date: string; }

type StatsTab = 'overview' | 'history' | 'calendar';

@Component({
  selector: 'app-training-stats',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './training-stats.component.html',
  styleUrl: './training-stats.component.scss',
})
export class TrainingStatsComponent implements OnInit, OnDestroy {
  private trainingService = inject(TrainingService);
  private sub?: Subscription;

  allTrainings: TrainingEntry[] = [];
  activeTab: StatsTab = 'overview';

  // Calendar
  calendarDate = new Date();

  ngOnInit() {
    this.sub = this.trainingService.getAllTrainings()
      .subscribe(data => this.allTrainings = data);
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  setTab(tab: StatsTab) { this.activeTab = tab; }

  // Nur echte Trainings (kein Körpergewicht)
  private get workouts(): TrainingEntry[] {
    return this.allTrainings.filter(t => t.type !== 'body');
  }

  // ── Streak ────────────────────────────────────────────
  get streak(): number {
    const dates = [...new Set(this.workouts.map(t => t.date))].sort().reverse();
    if (!dates.length) return 0;
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dates.includes(d.toISOString().split('T')[0])) count++;
      else if (i > 0) break;
    }
    return count;
  }

  get totalVolumeTons(): string {
    const vol = this.allTrainings
      .filter(t => t.type === 'strength')
      .reduce((s, t) => s + (t.weight ?? 0) * (t.reps ?? 0) * (t.sets ?? 0), 0);
    return (vol / 1000).toFixed(1);
  }

  get totalDays(): number { return new Set(this.workouts.map(t => t.date)).size; }

  get topExercise(): string {
    const counts: Record<string, number> = {};
    this.allTrainings.filter(t => t.type === 'strength' && t.exerciseId)
      .forEach(t => { counts[t.exerciseId!] = (counts[t.exerciseId!] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? (EXERCISES[top[0] as keyof typeof EXERCISES]?.name ?? top[0]) : '–';
  }

  get personalRecords(): PR[] {
    const bests: Record<string, PR> = {};
    this.allTrainings.filter(t => t.type === 'strength' && t.exerciseId && t.weight)
      .forEach(t => {
        const id = t.exerciseId!;
        if (!bests[id] || t.weight! > bests[id].weight)
          bests[id] = { exerciseName: EXERCISES[id as keyof typeof EXERCISES]?.name ?? id, weight: t.weight!, date: t.date };
      });
    return Object.values(bests).sort((a, b) => b.weight - a.weight);
  }

  get weeklyChartData(): ChartData<'bar', number[], string> {
    const weeks: Record<string, Set<string>> = {};
    this.workouts.forEach(t => {
      const key = this.getWeekLabel(t.date);
      if (!weeks[key]) weeks[key] = new Set();
      weeks[key].add(t.date);
    });
    const sorted = Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
    return {
      labels: sorted.map(([k]) => k),
      datasets: [{
        label: 'Trainingstage',
        data: sorted.map(([, v]) => v.size),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderRadius: 8,
        borderSkipped: false,
      }],
    };
  }

  private getWeekLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `KW${week}`;
  }

  // ── History (letzte 50 Einträge, Gewicht separat markiert) ──
  get recentHistory(): TrainingEntry[] {
    return [...this.allTrainings].reverse().slice(0, 50);
  }

  isBodyEntry(entry: TrainingEntry): boolean {
    return entry.type === 'body';
  }

  getExerciseName(entry: TrainingEntry): string {
    if (entry.type === 'body') return 'Körpergewicht';
    return EXERCISES[entry.exerciseId as keyof typeof EXERCISES]?.name ?? entry.exerciseId ?? '–';
  }

  getEntryDetail(entry: TrainingEntry): string {
    if (entry.type === 'strength') return `${entry.weight}kg × ${entry.reps} × ${entry.sets}`;
    if (entry.type === 'cardio')   return `${entry.duration} min${entry.distance ? ` · ${entry.distance} km` : ''}`;
    return `${entry.bodyWeight} kg`;
  }

  getTypeIcon(type: string): string {
    return type === 'strength' ? '💪' : type === 'cardio' ? '🏃' : '⚖️';
  }

  // ── Kalender ─────────────────────────────────────────
  get calendarMonthLabel(): string {
    return this.calendarDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }

  prevMonth() {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() - 1, 1);
  }
  nextMonth() {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 1);
  }

  get calendarDays(): { date: Date | null; hasTraining: boolean; isToday: boolean }[] {
    const year  = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7; // Monday first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = new Date().toISOString().split('T')[0];
    const trainingDates = new Set(this.workouts.map(t => t.date));

    const cells: { date: Date | null; hasTraining: boolean; isToday: boolean }[] = [];
    for (let i = 0; i < offset; i++) cells.push({ date: null, hasTraining: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split('T')[0];
      cells.push({ date, hasTraining: trainingDates.has(dateStr), isToday: dateStr === todayStr });
    }
    return cells;
  }

  readonly weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
}
