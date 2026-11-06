import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { TrainingsplanComponent } from './trainingsplan.component';

describe('TrainingsplanComponent', () => {
  let component: TrainingsplanComponent;
  let fixture: ComponentFixture<TrainingsplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingsplanComponent],
      providers: [TEST_PROVIDERS]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingsplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
