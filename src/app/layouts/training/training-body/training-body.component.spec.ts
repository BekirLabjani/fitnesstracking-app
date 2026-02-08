import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingBodyComponent } from './training-body.component';

describe('TrainingBodyComponent', () => {
  let component: TrainingBodyComponent;
  let fixture: ComponentFixture<TrainingBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingBodyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
