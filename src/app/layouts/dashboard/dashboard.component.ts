import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HeaderComponent } from '../../shared/header/header.component';
import { NavBottomComponent } from '../../shared/nav-bottom/nav-bottom.component';
import { ProfileComponent } from '../profile/profile.component';
import { SkeletonComponent } from '../../shared/skeleton/skeleton.component';
import { RestTimerComponent } from '../../shared/rest-timer/rest-timer.component';
import { TrainingService, TrainingEntry } from '../training/service/training.service';
import { ToastService } from '../../shared/toast/toast.service';
import { resolveExerciseName } from '../../data/exercise.data';
import { CustomExerciseService, CustomExercise } from '../../data/custom-exercise.service';
import { CalorieLogService } from '../../shared/calorie/calorie-log.service';
import { UserProfileService } from '../../shared/services/user-profile.service';
import { getEffectiveCalorieGoal } from '../../shared/calorie/calorie-calculator';
import { AddCalorieDialogComponent } from '../../feature/calorie/add-calorie-dialog/add-calorie-dialog.component';
import { Subscription } from 'rxjs';

interface DashboardCard {
  entry: TrainingEntry;
  exerciseName: string;
  improvement: number | null;
  swipeX: number;
  swiping: boolean;
}

interface PR { exerciseName: string; weight: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, NavBottomComponent,
    ProfileComponent, SkeletonComponent, RestTimerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private trainingService = inject(TrainingService);
  private customExerciseService = inject(CustomExerciseService);
  private calorieLogService = inject(CalorieLogService);
  private userProfileService = inject(UserProfileService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private sub?: Subscription;
  private customExercisesSub?: Subscription;
  private calorieSub?: Subscription;
  private profileSub?: Subscription;
  private allTrainings: TrainingEntry[] = [];
  private customExercises: CustomExercise[] = [];

  isSheetOpen = false;
  loading = true;
  todayCards: DashboardCard[] = [];
  topPRs: PR[] = [];
  streak = 0;
  today = new Date().toISOString().split('T')[0];

  // ── Kalorien heute ──────────────────────────────────
  kcalToday = 0;
  calorieGoal: number | null = null;

  // Pull-to-Refresh
  refreshing = false;
  private touchStartY = 0;
  private pullDistance = 0;
  pullProgress = 0;

  ngOnInit() {
    this.sub = this.trainingService.getAllTrainings().subscribe(all => {
      this.loading = false;
      this.allTrainings = all;
      this.buildCards(all);
    });
    this.customExercisesSub = this.customExerciseService.getMyCustomExercises().subscribe(list => {
      this.customExercises = list;
      this.buildCards(this.allTrainings);
    });
    this.calorieSub = this.calorieLogService.getAllEntries().subscribe(entries => {
      this.kcalToday = entries.filter(e => e.date === this.today).reduce((sum, e) => sum + e.kcal, 0);
    });
    this.profileSub = this.userProfileService.profile$.subscribe(profile => {
      this.calorieGoal = getEffectiveCalorieGoal(profile);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.customExercisesSub?.unsubscribe();
    this.calorieSub?.unsubscribe();
    this.profileSub?.unsubscribe();
  }

  get calorieProgress(): number {
    if (!this.calorieGoal) return 0;
    return Math.min(100, Math.round((this.kcalToday / this.calorieGoal) * 100));
  }

  openAddCalorieDialog() {
    this.dialog.open(AddCalorieDialogComponent, { height: '460px', width: '600px' });
  }

  private buildCards(all: TrainingEntry[]) {
    const todayEntries = all.filter(t => t.date === this.today);
    this.todayCards = todayEntries.map(entry => ({
      entry,
      exerciseName: this.getExerciseName(entry),
      improvement: this.calcImprovement(entry, all),
      swipeX: 0,
      swiping: false,
    }));
    this.streak = this.calcStreak(all);
    this.topPRs = this.calcPRs(all).slice(0, 3);
  }

  toggleProfileSheet() { this.isSheetOpen = !this.isSheetOpen; }

  // ── Swipe to Delete ─────────────────────────────────
  private swipeStartX = 0;
  private activeCard: DashboardCard | null = null;

  onTouchStart(e: TouchEvent, card: DashboardCard) {
    this.swipeStartX = e.touches[0].clientX;
    this.activeCard = card;
    card.swiping = true;
  }

  onTouchMove(e: TouchEvent, card: DashboardCard) {
    const dx = e.touches[0].clientX - this.swipeStartX;
    if (dx < 0) card.swipeX = Math.max(dx, -80);
  }

  onTouchEnd(card: DashboardCard) {
    card.swiping = false;
    if (card.swipeX <= -60) {
      card.swipeX = -80;
    } else {
      card.swipeX = 0;
    }
  }

  async deleteCard(card: DashboardCard) {
    if (!card.entry.id) return;
    await this.trainingService.deleteTraining(card.entry.id);
    this.toast.success('Training gelöscht');
    card.swipeX = 0;
  }

  resetSwipe(card: DashboardCard) { card.swipeX = 0; }

  // ── Pull to Refresh ──────────────────────────────────
  onMainTouchStart(e: TouchEvent) {
    this.touchStartY = e.touches[0].clientY;
  }

  onMainTouchMove(e: TouchEvent) {
    const dy = e.touches[0].clientY - this.touchStartY;
    const atTop = (e.target as Element)?.closest('.app-content')?.scrollTop === 0;
    if (dy > 0 && atTop) {
      this.pullDistance = Math.min(dy, 80);
      this.pullProgress = this.pullDistance / 80;
    }
  }

  onMainTouchEnd() {
    if (this.pullDistance >= 70) {
      this.refresh();
    }
    this.pullDistance = 0;
    this.pullProgress = 0;
  }

  private refresh() {
    this.refreshing = true;
    if (navigator.vibrate) navigator.vibrate(50);
    setTimeout(() => {
      this.buildCards(this.allTrainings);
      this.refreshing = false;
      this.toast.success('Aktualisiert ✓');
    }, 800);
  }

  // ── Helpers ─────────────────────────────────────────
  private getExerciseName(entry: TrainingEntry): string {
    if (entry.type === 'body') return 'Körpergewicht';
    if (!entry.exerciseId) return '–';
    return resolveExerciseName(entry.exerciseId, this.customExercises);
  }

  private calcImprovement(entry: TrainingEntry, all: TrainingEntry[]): number | null {
    if (entry.type === 'strength' && entry.weight !== undefined) {
      const prev = all.filter(t => t.type === 'strength' && t.exerciseId === entry.exerciseId && t.date < entry.date).pop();
      if (prev?.weight !== undefined) return entry.weight - prev.weight;
    }
    if (entry.type === 'body' && entry.bodyWeight !== undefined) {
      const prev = all.filter(t => t.type === 'body' && t.date < entry.date).pop();
      if (prev?.bodyWeight !== undefined) return entry.bodyWeight - prev.bodyWeight;
    }
    return null;
  }

  private calcStreak(all: TrainingEntry[]): number {
    // Körpergewicht zählt nicht als Trainingstag
    const workouts = all.filter(t => t.type !== 'body');
    const dates = [...new Set(workouts.map(t => t.date))].sort().reverse();
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

  private calcPRs(all: TrainingEntry[]): PR[] {
    const bests: Record<string, number> = {};
    all.filter(t => t.type === 'strength' && t.exerciseId && t.weight)
       .forEach(t => { bests[t.exerciseId!] = Math.max(bests[t.exerciseId!] ?? 0, t.weight!); });
    return Object.entries(bests)
      .map(([id, weight]) => ({ exerciseName: resolveExerciseName(id, this.customExercises), weight }))
      .sort((a, b) => b.weight - a.weight);
  }

  getCardioText(entry: TrainingEntry): string {
    const parts: string[] = [];
    if (entry.duration) parts.push(`${entry.duration} min`);
    if (entry.distance) parts.push(`${entry.distance} km`);
    return parts.join(' · ') || '–';
  }
}
