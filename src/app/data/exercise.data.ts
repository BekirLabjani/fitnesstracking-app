export const EXERCISES = {
  // Brust
  bench_press: { name: 'Bankdrücken', unit: 'kg', category: 'Brust' },
  incline_bench_press: { name: 'Schrägbankdrücken', unit: 'kg', category: 'Brust' },
  chest_fly: { name: 'Butterfly', unit: 'kg', category: 'Brust' },
  pushups: { name: 'Liegestütze', unit: 'reps', category: 'Brust' },

  // Beine
  squat: { name: 'Kniebeugen', unit: 'kg', category: 'Beine' },
  leg_press: { name: 'Beinpresse', unit: 'kg', category: 'Beine' },
  leg_extension: { name: 'Beinstrecker', unit: 'kg', category: 'Beine' },
  leg_curl: { name: 'Beinbeuger', unit: 'kg', category: 'Beine' },
  calf_raise: { name: 'Wadenheben', unit: 'kg', category: 'Beine' },

  // Rücken
  lat_pulldown: { name: 'Latzug', unit: 'kg', category: 'Rücken' },
  pullups: { name: 'Klimmzüge', unit: 'reps', category: 'Rücken' },
  barbell_row: { name: 'Langhantelrudern', unit: 'kg', category: 'Rücken' },
  seated_row: { name: 'Rudern sitzend', unit: 'kg', category: 'Rücken' },

  // Schulter
  shoulder_press: { name: 'Schulterdrücken', unit: 'kg', category: 'Schulter' },
  lateral_raise: { name: 'Seitheben', unit: 'kg', category: 'Schulter' },
  front_raise: { name: 'Frontheben', unit: 'kg', category: 'Schulter' },
  rear_delt_fly: { name: 'Reverse Butterfly', unit: 'kg', category: 'Schulter' },

  // Arme
  biceps_curl: { name: 'Bizepscurls', unit: 'kg', category: 'Arme' },
  hammer_curl: { name: 'Hammercurls', unit: 'kg', category: 'Arme' },
  triceps_pushdown: { name: 'Trizepsdrücken', unit: 'kg', category: 'Arme' },
  skull_crushers: { name: 'Skull Crushers', unit: 'kg', category: 'Arme' },

  // Core
  plank: { name: 'Plank', unit: 'seconds', category: 'Core' },
  crunches: { name: 'Crunches', unit: 'reps', category: 'Core' },
  leg_raises: { name: 'Beinheben', unit: 'reps', category: 'Core' },

  // Cardio / Sonstiges
  treadmill: { name: 'Laufband', unit: 'minutes', category: 'Cardio' },
  cycling: { name: 'Fahrrad', unit: 'minutes', category: 'Cardio' },
  rowing_machine: { name: 'Rudergerät', unit: 'minutes', category: 'Cardio' },
  jumping_jacks: { name: 'Hampelmänner', unit: 'reps', category: 'Cardio' },
  burpees: { name: 'Burpees', unit: 'reps', category: 'Cardio' },
} as const;

export type ExerciseId = keyof typeof EXERCISES;
