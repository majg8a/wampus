import { TestBed } from '@angular/core/testing';

import { HasParametersGuard } from './has-parameters.guard';

describe('HasParametersGuard', () => {
  let guard: HasParametersGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(HasParametersGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
