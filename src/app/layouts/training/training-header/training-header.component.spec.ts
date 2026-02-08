import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingHeaderComponent } from './training-header.component';

describe('TrainingHeaderComponent', () => {
  let component: TrainingHeaderComponent;
  let fixture: ComponentFixture<TrainingHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
