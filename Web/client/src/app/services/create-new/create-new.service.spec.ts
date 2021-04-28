// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';

import { CreateNewService } from './create-new.service';

describe('CreateNewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateNewService = TestBed.get(CreateNewService);
    expect(service).toBeTruthy();
  });
});
