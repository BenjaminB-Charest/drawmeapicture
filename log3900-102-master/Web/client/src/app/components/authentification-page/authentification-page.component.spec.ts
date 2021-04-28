import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthentificationPageComponent } from './authentification-page.component';

describe('AuthentificationPageComponent', () => {
    let component: AuthentificationPageComponent;
    let fixture: ComponentFixture<AuthentificationPageComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AuthentificationPageComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthentificationPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
