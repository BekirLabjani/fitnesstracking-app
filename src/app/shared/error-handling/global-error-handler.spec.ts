import { TestBed } from '@angular/core/testing';
import { TEST_PROVIDERS } from '../../../testing/test-providers';

import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TEST_PROVIDERS, GlobalErrorHandler],
    });
    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('should be created', () => {
    expect(handler).toBeTruthy();
  });

  it('logs to console and does not throw when no user is signed in', () => {
    spyOn(console, 'error');
    expect(() => handler.handleError(new Error('boom'))).not.toThrow();
    expect(console.error).toHaveBeenCalled();
  });

  it('does not throw for non-Error values', () => {
    spyOn(console, 'error');
    expect(() => handler.handleError('a plain string failure')).not.toThrow();
  });
});
