import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { resolveExerciseName } from '../../../data/exercise.data';
import { WORKOUT_TEMPLATES, WorkoutTemplate } from '../../../data/workout-templates.data';
import { ToastService } from '../../../shared/toast/toast.service';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './templates.component.html',
  styleUrl: './templates.component.scss',
})
export class TemplatesComponent {
  private auth = inject(Auth);
  private db = inject(Firestore);
  private router = inject(Router);
  private toast = inject(ToastService);

  templates = WORKOUT_TEMPLATES;

  exerciseNames(t: WorkoutTemplate): string[] {
    const ids = new Set(Object.values(t.days).flat());
    return [...ids].map(id => resolveExerciseName(id));
  }

  trainingDaysCount(t: WorkoutTemplate): number {
    return Object.keys(t.days).length;
  }

  async applyTemplate(template: WorkoutTemplate) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(this.db, 'trainingPlans', uid);
    const existing = await getDoc(ref);
    if (existing.exists() && Object.keys(existing.data() ?? {}).length > 0) {
      const confirmed = confirm(`"${template.name}" übernehmen und deinen bestehenden Trainingsplan überschreiben?`);
      if (!confirmed) return;
    }

    const plan: Record<string, { exercises: string[] }> = {};
    for (const [day, exercises] of Object.entries(template.days)) {
      plan[day] = { exercises: exercises ?? [] };
    }

    await setDoc(ref, plan);
    this.toast.success(`"${template.name}" übernommen`);
    this.router.navigate(['/trainingsplan']);
  }
}
