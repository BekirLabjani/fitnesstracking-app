export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface BmrInput {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LEVEL_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sitzend', description: 'Wenig bis keine Bewegung (Bürojob, kein Sport)' },
  { value: 'light', label: 'Leicht aktiv', description: '1–3× Sport pro Woche' },
  { value: 'moderate', label: 'Moderat aktiv', description: '3–5× Sport pro Woche' },
  { value: 'active', label: 'Sehr aktiv', description: '6–7× Sport pro Woche' },
  { value: 'very_active', label: 'Extrem aktiv', description: 'Täglich hartes Training oder körperliche Arbeit' },
];

/** Grundumsatz (Mifflin-St Jeor) in kcal/Tag. */
export function calculateBmr({ gender, age, heightCm, weightKg }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

/** Gesamtumsatz (Grundumsatz × Aktivitätsfaktor) in kcal/Tag, gerundet. */
export function calculateTdee(input: BmrInput, activityLevel: ActivityLevel): number {
  return Math.round(calculateBmr(input) * ACTIVITY_MULTIPLIERS[activityLevel]);
}
