export interface UserProfile {
  // Identität
  uid: string;
  displayName: string;
  email: string;

  // Körperdaten
  heightCm: number;
  weightKg: number;
  age: number;
  gender?: 'male' | 'female' | 'other';

  // Optional
  phoneNumber?: string;

  // Fitness-Ziele
  goal?: 'muscle' | 'weight_loss' | 'strength';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';

  // Meta
  createdAt: string;
  updatedAt?: string;
}