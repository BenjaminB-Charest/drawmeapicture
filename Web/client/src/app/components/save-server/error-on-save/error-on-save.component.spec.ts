// tslint:disable: no-string-literal | Reason: used to access private variables
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { ErrorOnSaveComponent } from './error-on-save.component';

describe('ErrorOnSaveComponent', () => {
  let component: ErrorOnSaveComponent;
  let fixture: ComponentFixture<ErrorOnSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorOnSaveComponent ],
      imports: [
        MatDialogModule,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ErrorOnSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
