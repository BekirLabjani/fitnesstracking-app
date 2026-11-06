import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../testing/test-providers';

import { CustomExerciseService } from './custom-exercise.service';

describe('CustomExerciseService', () => {
  let service: CustomExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(CustomExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns an empty list when nobody is signed in', (done) => {
    service.getMyCustomExercises().subscribe(list => {
      expect(list).toEqual([]);
      done();
    });
  });
});
