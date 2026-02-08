import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


export const STRENGTH_DATA = {
  bench: {
    exerciseId: 'bench',
    exerciseName: 'Bankdrücken',
    unit: 'kg',
    trainings: [
      { date: '2025-12-15', weight: 40, reps: 10, sets: 3 },
      { date: '2025-12-22', weight: 45, reps: 10, sets: 3 },
      { date: '2025-12-29', weight: 50, reps: 10, sets: 3 },
      { date: '2026-01-05', weight: 55, reps: 10, sets: 3 }
    ]
  },

  squat: {
    exerciseId: 'squat',
    exerciseName: 'Kniebeugen',
    unit: 'kg',
    trainings: [
      { date: '2025-12-15', weight: 60, reps: 8, sets: 4 },
      { date: '2025-12-16', weight: 60, reps: 8, sets: 4 },
      { date: '2025-12-17', weight: 62, reps: 8, sets: 4 },
      { date: '2025-12-22', weight: 65, reps: 8, sets: 4 },
      { date: '2025-12-25', weight: 68, reps: 8, sets: 4 },
      { date: '2025-12-27', weight: 75, reps: 8, sets: 4 },
      { date: '2025-12-29', weight: 70, reps: 8, sets: 4 },
      { date: '2026-01-05', weight: 75, reps: 8, sets: 4 }
    ]
  },

  bizeps: {
    exerciseId: 'squat',
    exerciseName: 'Bizep',
    unit: 'kg',
    trainings: [
      { date: '2025-12-15', weight: 60, reps: 8, sets: 4 },
      { date: '2025-12-16', weight: 60, reps: 8, sets: 4 },
      { date: '2025-12-17', weight: 62, reps: 8, sets: 4 },
      { date: '2025-12-22', weight: 65, reps: 8, sets: 4 },
      { date: '2025-12-25', weight: 68, reps: 8, sets: 4 },
      { date: '2025-12-27', weight: 75, reps: 8, sets: 4 },
      { date: '2025-12-29', weight: 70, reps: 8, sets: 4 },
      { date: '2026-01-05', weight: 75, reps: 8, sets: 4 }
    ]
  },
  
} as const; //damit TypeScript die Keys als Literal-Typen erkennt.


