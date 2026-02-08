import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingNavBarComponent } from './training-nav-bar.component';

describe('TrainingNavBarComponent', () => {
  let component: TrainingNavBarComponent;
  let fixture: ComponentFixture<TrainingNavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingNavBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
