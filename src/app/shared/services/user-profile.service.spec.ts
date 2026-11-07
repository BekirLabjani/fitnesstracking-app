import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { UserProfileService } from './user-profile.service';

describe('UserProfileService', () => {
  let service: UserProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(UserProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('emits an empty profile when no user is signed in', done => {
    service.profile$.subscribe(profile => {
      expect(profile).toEqual({});
      done();
    });
  });

  it('rejects updateProfile when no user is signed in', async () => {
    await expectAsync(service.updateProfile({ heightCm: 180 })).toBeRejected();
  });
});
