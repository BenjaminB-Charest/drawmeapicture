import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    beforeEach(() => {
    });

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        providers: [
          {
          }
        ],
        declarations: [ AppComponent ],
        schemas: [NO_ERRORS_SCHEMA]
      });
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'LOG2990'", () => {
        expect(component.title).toEqual('LOG2990');
    });
});
