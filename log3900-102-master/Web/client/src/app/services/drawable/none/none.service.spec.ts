import { TestBed } from '@angular/core/testing';

import { NoneService } from './none.service';

describe('NoneService', () => {
  let service: NoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
