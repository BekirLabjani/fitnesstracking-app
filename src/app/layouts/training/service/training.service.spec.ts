import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../../testing/test-providers';

import { TrainingService } from './training.service';

describe('TrainingService', () => {
  let service: TrainingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(TrainingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
