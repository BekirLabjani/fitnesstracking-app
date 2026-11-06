import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TrainingService, TrainingEntry } from '../service/training.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-training-body',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './training-body.component.html',
  styleUrl: './training-body.component.scss',
})
export class TrainingBodyComponent implements OnInit, OnDestroy {
  private trainingService = inject(TrainingService);
  private fireAuth = inject(Auth);
  private db = inject(Firestore);
  private sub?: Subscription;
  private profileUnsub?: () => void;

  entries: TrainingEntry[] = [];
  heightCm = 0;
  editingHeight = false;
  heightInput = 0;

  ngOnInit() {
    this.sub = this.trainingService.getBodyWeights()
      .subscribe(data => this.entries = data);
    this.loadHeight();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.profileUnsub?.();
  }

  private loadHeight() {
    const uid = this.fireAuth.currentUser?.uid;
    if (!uid) return;
    this.profileUnsub = onSnapshot(doc(this.db, 'userProfiles', uid), snap => {
      this.heightCm = snap.data()?.['heightCm'] ?? 0;
    });
  }

  async saveHeight() {
    const uid = this.fireAuth.currentUser?.uid;
    if (!uid || !this.heightInput) return;
    await setDoc(doc(this.db, 'userProfiles', uid), { heightCm: this.heightInput }, { merge: true });
    this.editingHeight = false;
  }

  get latest(): number | null {
    return this.entries.length > 0
      ? this.entries[this.entries.length - 1].bodyWeight ?? null
      : null;
  }

  get bmi(): number | null {
    if (!this.latest || !this.heightCm) return null;
    const h = this.heightCm / 100;
    return Math.round((this.latest / (h * h)) * 10) / 10;
  }

  get bmiCategory(): { label: string; color: string } {
    const b = this.bmi;
    if (b === null) return { label: '', color: '' };
    if (b < 18.5) return { label: 'Untergewicht', color: '#f59e0b' };
    if (b < 25)   return { label: 'Normalgewicht ✓', color: '#22c55e' };
    if (b < 30)   return { label: 'Übergewicht', color: '#f97316' };
    return             { label: 'Adipositas', color: '#ef4444' };
  }

  get chartData(): ChartData<'line', number[], string> {
    return {
      labels: this.entries.map(e => e.date),
      datasets: [{
        label: 'Körpergewicht (kg)',
        data: this.entries.map(e => e.bodyWeight ?? 0),
        borderColor: '#5bbcff',
        backgroundColor: 'rgba(91,188,255,0.15)',
        pointBackgroundColor: '#5bbcff',
        pointRadius: 5,
        tension: 0.3,
        fill: true,
      }],
    };
  }

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#fff' } } },
    scales: {
      x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };
}
