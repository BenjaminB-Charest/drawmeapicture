import { TestBed } from '@angular/core/testing';

import { NoneeService } from './nonee.service';

describe('NoneeService', () => {
  let service: NoneeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoneeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
