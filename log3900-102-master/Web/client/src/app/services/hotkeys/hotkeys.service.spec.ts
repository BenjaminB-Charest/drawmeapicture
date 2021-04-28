// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';
import { HotkeysService } from './hotkeys.service';

describe('HotkeysService', () => {

  let service: HotkeysService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(HotkeysService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
