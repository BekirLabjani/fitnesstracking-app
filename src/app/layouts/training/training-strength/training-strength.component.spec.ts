import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingStrengthComponent } from './training-strength.component';

describe('TrainingStrengthComponent', () => {
  let component: TrainingStrengthComponent;
  let fixture: ComponentFixture<TrainingStrengthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStrengthComponent]
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
