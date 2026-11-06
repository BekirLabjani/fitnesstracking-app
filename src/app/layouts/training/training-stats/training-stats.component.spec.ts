import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { TrainingStatsComponent } from './training-stats.component';

describe('TrainingStatsComponent', () => {
  let component: TrainingStatsComponent;
  let fixture: ComponentFixture<TrainingStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStatsComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainingStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
