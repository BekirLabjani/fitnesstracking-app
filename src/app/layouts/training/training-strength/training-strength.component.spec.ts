import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { TrainingStrengthComponent } from './training-strength.component';

describe('TrainingStrengthComponent', () => {
  let component: TrainingStrengthComponent;
  let fixture: ComponentFixture<TrainingStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStrengthComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingStrengthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
