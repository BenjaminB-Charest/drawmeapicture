import { TestBed } from '@angular/core/testing';

import { InstructionsStackService } from './instructions-stack.service';

describe('InstructionsStackService', () => {
    let service: InstructionsStackService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InstructionsStackService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
