import { TestBed } from '@angular/core/testing';

import { WordChoiceService } from './word-choice.service';

describe('WordChoiceService', () => {
  let service: WordChoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordChoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
