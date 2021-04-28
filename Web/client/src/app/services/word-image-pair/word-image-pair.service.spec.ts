import { TestBed } from '@angular/core/testing';

import { WordImagePairService } from './word-image-pair.service';

describe('WordImagePairService', () => {
    let service: WordImagePairService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WordImagePairService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
