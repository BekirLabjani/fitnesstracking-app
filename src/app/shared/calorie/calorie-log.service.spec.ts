import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { CalorieLogService } from './calorie-log.service';

describe('CalorieLogService', () => {
  let service: CalorieLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(CalorieLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('emits an empty list when no user is signed in', done => {
    service.getAllEntries().subscribe(entries => {
      expect(entries).toEqual([]);
      done();
    });
  });

  it('rejects addEntry when no user is signed in', async () => {
    await expectAsync(service.addEntry(500)).toBeRejected();
  });
});
