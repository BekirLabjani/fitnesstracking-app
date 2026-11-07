import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { TrainingStatsProComponent } from './training-stats-pro.component';

describe('TrainingStatsProComponent', () => {
  let component: TrainingStatsProComponent;
  let fixture: ComponentFixture<TrainingStatsProComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStatsProComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingStatsProComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
