import { ExerciseId } from './exercise.data';

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  /** Record<dayKey, exerciseIds> — nur Tage mit Training brauchen einen Eintrag. */
  days: Partial<Record<typeof DAY_KEYS[number], ExerciseId[]>>;
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'ppl',
    name: 'Push/Pull/Legs',
    description: '6 Tage/Woche, klassische Dreiteilung für Fortgeschrittene.',
    days: {
      mon: ['bench_press', 'shoulder_press', 'triceps_pushdown', 'lateral_raise'],
      tue: ['pullups', 'barbell_row', 'lat_pulldown', 'biceps_curl'],
      wed: ['squat', 'leg_press', 'leg_curl', 'calf_raise'],
      thu: ['incline_bench_press', 'chest_fly', 'shoulder_press', 'skull_crushers'],
      fri: ['seated_row', 'lat_pulldown', 'rear_delt_fly', 'hammer_curl'],
      sat: ['squat', 'leg_extension', 'leg_curl', 'calf_raise'],
    },
  },
  {
    id: 'fullbody3',
    name: 'Ganzkörper 3x/Woche',
    description: 'Effizient für Einsteiger und alle mit wenig Zeit — 3 Trainingstage, alle Muskelgruppen.',
    days: {
      mon: ['squat', 'bench_press', 'barbell_row', 'plank'],
      wed: ['leg_press', 'shoulder_press', 'lat_pulldown', 'crunches'],
      fri: ['squat', 'incline_bench_press', 'seated_row', 'leg_raises'],
    },
  },
  {
    id: 'strength5x5',
    name: '5x5 Kraftaufbau',
    description: 'Fokus auf Grundübungen mit wenig Wiederholungen, viel Gewicht — für reinen Kraftaufbau.',
    days: {
      mon: ['squat', 'bench_press', 'barbell_row'],
      wed: ['squat', 'shoulder_press', 'pullups'],
      fri: ['squat', 'bench_press', 'barbell_row'],
    },
  },
  {
    id: 'beginner-fullbody',
    name: 'Anfänger Fullbody',
    description: 'Einfacher Einstieg mit Maschinen statt freien Gewichten — ideal für die ersten Monate.',
    days: {
      mon: ['leg_press', 'chest_fly', 'seated_row', 'plank'],
      thu: ['leg_extension', 'shoulder_press', 'lat_pulldown', 'crunches'],
    },
  },
];
