import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { UserProfileService, UserProfileData } from '../../../shared/services/user-profile.service';
import { AuthServiceService } from '../../../auth/services/auth.service.service';
import { ToastService } from '../../../shared/toast/toast.service';
import {
  ACTIVITY_LEVEL_OPTIONS,
  ActivityLevel,
  Gender,
  getEffectiveCalorieGoal,
} from '../../../shared/calorie/calorie-calculator';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthServiceService);
  private auth = inject(Auth);
  private toast = inject(ToastService);

  private sub?: Subscription;
  private loadedFromServer = false;

  activityOptions = ACTIVITY_LEVEL_OPTIONS;
  saving = false;

  displayName = '';
  gender: Gender | '' = '';
  age: number | null = null;
  heightCm: number | null = null;
  weightKg: number | null = null;
  activityLevel: ActivityLevel | '' = '';
  calorieMode: 'auto' | 'manual' = 'auto';
  manualCalories: number | null = null;

  ngOnInit() {
    this.displayName = this.auth.currentUser?.displayName ?? '';
    this.sub = this.userProfileService.profile$.subscribe(profile => {
      if (this.loadedFromServer) return; // don't clobber in-progress edits on a later snapshot tick
      this.loadedFromServer = true;
      this.applyProfile(profile);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private applyProfile(profile: UserProfileData) {
    if (profile.displayName) this.displayName = profile.displayName;
    this.gender = profile.gender ?? '';
    this.age = profile.age ?? null;
    this.heightCm = profile.heightCm ?? null;
    this.weightKg = profile.weightKg ?? null;
    this.activityLevel = profile.activityLevel ?? '';
    this.calorieMode = profile.calorieMode ?? 'auto';
    this.manualCalories = profile.manualCalories ?? null;
  }

  get canCalculateCalories(): boolean {
    return !!this.gender && !!this.age && !!this.heightCm && !!this.weightKg;
  }

  get calculatedCalories(): number | null {
    if (!this.canCalculateCalories || !this.activityLevel) return null;
    return getEffectiveCalorieGoal({
      calorieMode: 'auto',
      gender: this.gender as Gender,
      age: this.age!,
      heightCm: this.heightCm!,
      weightKg: this.weightKg!,
      activityLevel: this.activityLevel as ActivityLevel,
    });
  }

  async save() {
    this.saving = true;
    try {
      if (this.displayName.trim() && this.displayName.trim() !== this.auth.currentUser?.displayName) {
        await this.authService.updateDisplayName(this.displayName.trim());
      }

      await this.userProfileService.updateProfile({
        displayName: this.displayName.trim() || undefined,
        gender: this.gender || undefined,
        age: this.age ?? undefined,
        heightCm: this.heightCm ?? undefined,
        weightKg: this.weightKg ?? undefined,
        activityLevel: this.activityLevel || undefined,
        calorieMode: this.calorieMode,
        manualCalories: this.calorieMode === 'manual' ? (this.manualCalories ?? undefined) : undefined,
      });

      this.toast.success('Profil gespeichert');
    } catch {
      this.toast.error('Profil konnte nicht gespeichert werden');
    } finally {
      this.saving = false;
    }
  }
}
