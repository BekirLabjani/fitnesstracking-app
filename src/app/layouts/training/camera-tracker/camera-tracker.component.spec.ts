import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { CameraTrackerComponent } from './camera-tracker.component';

describe('CameraTrackerComponent', () => {
  let component: CameraTrackerComponent;
  let fixture: ComponentFixture<CameraTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraTrackerComponent],
      providers: [TEST_PROVIDERS],
    }).compileComponents();

    fixture = TestBed.createComponent(CameraTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts in idle state with zero reps', () => {
    expect(component.status).toBe('idle');
    expect(component.reps).toBe(0);
  });

  it('stop() resets status to idle', () => {
    component.stop();
    expect(component.status).toBe('idle');
  });
});
