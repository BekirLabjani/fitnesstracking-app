import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { FriendsService } from './friends.service';

describe('FriendsService', () => {
  let service: FriendsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TEST_PROVIDERS] });
    service = TestBed.inject(FriendsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns an empty leaderboard when no user is signed in', async () => {
    expect(await service.getWeeklyVolumeLeaderboard()).toEqual([]);
  });

  it('returns an empty friends list when no user is signed in', done => {
    service.getMyFriends().subscribe(friends => {
      expect(friends).toEqual([]);
      done();
    });
  });
});
