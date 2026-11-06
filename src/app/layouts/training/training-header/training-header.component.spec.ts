import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { TrainingHeaderComponent } from './training-header.component';

describe('TrainingHeaderComponent', () => {
  let component: TrainingHeaderComponent;
  let fixture: ComponentFixture<TrainingHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingHeaderComponent],
      providers: [TEST_PROVIDERS]
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
