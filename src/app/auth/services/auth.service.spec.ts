import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { AuthServiceService } from './auth.service.service';

describe('AuthServiceService', () => {
  let service: AuthServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(AuthServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
