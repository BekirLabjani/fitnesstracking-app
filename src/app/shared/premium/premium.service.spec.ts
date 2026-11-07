import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { PremiumService } from './premium.service';

describe('PremiumService', () => {
  let service: PremiumService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(PremiumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('emits false when nobody is signed in', (done) => {
    service.isPremium$.subscribe(isPremium => {
      expect(isPremium).toBe(false);
      done();
    });
  });
});
