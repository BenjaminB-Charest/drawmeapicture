import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordImagePairComponent } from './word-image-pair.component';

describe('WordImagePairComponent', () => {
    let component: WordImagePairComponent;
    let fixture: ComponentFixture<WordImagePairComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [WordImagePairComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WordImagePairComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
