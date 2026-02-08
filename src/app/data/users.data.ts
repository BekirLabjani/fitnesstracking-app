export interface UserProfile {
  id: string;
  displayName: string;
  email: string;

  // Körperdaten
  heightCm?: number;
  weightKg?: number;
  age?: number;
  goal?: 'muscle' | 'weight_loss' | 'strength';

  // Optional
  phoneNumber?: string;
  updatedAt?: string;
  createdAt: string; // ISO oder Firestore Timestamp
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export const USERS: Record<string, UserProfile> = {
  uid_bekir_001: {
    id: 'uid_bekir_001',
    displayName: 'Bekir Labjani',
    email: 'bekir@example.com',

    heightCm: 178,
    weightKg: 99,
    age: 18,
    goal: 'strength',
    experienceLevel: "intermediate",
    phoneNumber: '+43 660 1234567',
    createdAt: '2026-01-01',
  },
};
export type UserId = keyof typeof USERS;
