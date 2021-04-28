// tslint:disable: no-string-literal | Reason: used to access private variables
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { WorkspaceComponent } from './workspace.component';

describe('WorkspaceComponent', () => {
  let component: WorkspaceComponent;
  let fixture: ComponentFixture<WorkspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkspaceComponent ],
      imports: [
        HttpClientModule,
        MatSnackBarModule,
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(WorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#onResize should resize workspace', () => {
    component.onResize({
      target: {
        offsetWidth: 100,
        offsetHeight: 200
      }
    });
    // tslint:disable-next-line: no-magic-numbers | Reason : testing arbitrary values
    expect(component['workspaceService'].size.value).toEqual(new CoordinatesXY(100, 200));
  });
});
