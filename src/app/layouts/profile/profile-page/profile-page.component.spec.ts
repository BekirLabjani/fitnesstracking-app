import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { ProfilePageComponent } from './profile-page.component';

describe('ProfilePageComponent', () => {
  let component: ProfilePageComponent;
  let fixture: ComponentFixture<ProfilePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cannot calculate calories before body data is filled in', () => {
    expect(component.canCalculateCalories).toBeFalse();
    expect(component.calculatedCalories).toBeNull();
  });

  it('calculates calories once gender, age, height, weight and activity level are set', () => {
    component.gender = 'male';
    component.age = 30;
    component.heightCm = 180;
    component.weightKg = 80;
    component.activityLevel = 'moderate';
    expect(component.canCalculateCalories).toBeTrue();
    expect(component.calculatedCalories).toBeGreaterThan(0);
  });
});
