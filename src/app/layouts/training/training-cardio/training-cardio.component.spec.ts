import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCardioComponent } from './training-cardio.component';

describe('TrainingCardioComponent', () => {
  let component: TrainingCardioComponent;
  let fixture: ComponentFixture<TrainingCardioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingCardioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingCardioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
