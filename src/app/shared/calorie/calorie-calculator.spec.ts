import { calculateBmr, calculateTdee, getEffectiveCalorieGoal } from './calorie-calculator';

describe('calorie-calculator', () => {
  describe('calculateBmr', () => {
    it('adds 5 for male (Mifflin-St Jeor)', () => {
      const bmr = calculateBmr({ gender: 'male', age: 30, heightCm: 180, weightKg: 80 });
      // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBe(1780);
    });

    it('subtracts 161 for female (Mifflin-St Jeor)', () => {
      const bmr = calculateBmr({ gender: 'female', age: 30, heightCm: 165, weightKg: 60 });
      // 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      expect(bmr).toBeCloseTo(1320.25, 2);
    });
  });

  describe('calculateTdee', () => {
    const input = { gender: 'male' as const, age: 30, heightCm: 180, weightKg: 80 };

    it('applies the sedentary multiplier (1.2)', () => {
      expect(calculateTdee(input, 'sedentary')).toBe(Math.round(1780 * 1.2));
    });

    it('applies the very_active multiplier (1.9)', () => {
      expect(calculateTdee(input, 'very_active')).toBe(Math.round(1780 * 1.9));
    });

    it('higher activity levels yield higher calorie needs', () => {
      const sedentary = calculateTdee(input, 'sedentary');
      const moderate = calculateTdee(input, 'moderate');
      const veryActive = calculateTdee(input, 'very_active');
      expect(moderate).toBeGreaterThan(sedentary);
      expect(veryActive).toBeGreaterThan(moderate);
    });
  });

  describe('getEffectiveCalorieGoal', () => {
    it('returns the manual value when calorieMode is manual', () => {
      expect(getEffectiveCalorieGoal({ calorieMode: 'manual', manualCalories: 2200 })).toBe(2200);
    });

    it('returns null in manual mode without a manualCalories value', () => {
      expect(getEffectiveCalorieGoal({ calorieMode: 'manual' })).toBeNull();
    });

    it('returns null in auto mode when body data is incomplete', () => {
      expect(getEffectiveCalorieGoal({ calorieMode: 'auto', gender: 'male', age: 30 })).toBeNull();
    });

    it('calculates TDEE in auto mode once all body data is present', () => {
      const result = getEffectiveCalorieGoal({
        calorieMode: 'auto', gender: 'male', age: 30, heightCm: 180, weightKg: 80, activityLevel: 'moderate',
      });
      expect(result).toBe(calculateTdee({ gender: 'male', age: 30, heightCm: 180, weightKg: 80 }, 'moderate'));
    });
  });
});
