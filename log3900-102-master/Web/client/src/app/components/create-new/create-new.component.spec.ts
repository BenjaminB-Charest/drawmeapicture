// tslint:disable: no-string-literal | Reason: used to access private variables
// tslint:disable: no-magic-numbers | Reason : testing arbitrary values
import { APP_BASE_HREF } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Color } from 'src/app/classes/color';
import { ColorType } from 'src/app/enums/color-types';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { CreateNewComponent } from './create-new.component';

describe('CreateNewComponent', () => {
  let component: CreateNewComponent;
  let fixture: ComponentFixture<CreateNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewComponent ],
      providers: [
        ColorPickerComponent,
        {
          provide: MatDialogRef,
          useValue: {
            moduleDef: CreateNewComponent,
            close: () => null,
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => null,
            closeAll: () => null,
          }
        },
        {provide: APP_BASE_HREF, useValue : '/' }
      ],
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        RouterModule.forRoot(
          [{
            path : '' , component : CreateNewComponent
          }]
        ),
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(CreateNewComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#setCanvasSizeX should set canvas X', () => {
    const mockedEvent: KeyboardEvent = new KeyboardEvent('keypress', {key: 'c'});
    Object.defineProperty(mockedEvent, 'target', { value: { value: '2' } });
    component.setcanvasSizeX(mockedEvent);
    expect(component['workspaceSizeX']).toEqual(2);
  });

  it('#setCanvasSizeY should set canvas Y', () => {
    const mockedEvent: KeyboardEvent = new KeyboardEvent('keypress', {key: 'c'});
    Object.defineProperty(mockedEvent, 'target', { value: { value: '2' } });
    component.setcanvasSizeY(mockedEvent);
    expect(component['workspaceSizeY']).toEqual(2);
  });

  it('#onColorSelect should be able to select color', () => {
    component['previewColor'] = new Color('#FFFFFF');
    const spy2 = spyOn(component['dialog'], 'open')
    .and
    .returnValue({
      afterClosed: () => new Observable()
    } as unknown as MatDialogRef<{}, {}>);
    const spy = spyOn(component['colorSelectorService'], 'updateColor');
    component.onColorSelect();
    expect(spy).toHaveBeenCalledWith(new Color('#FFFFFF'));
    expect(spy2).toHaveBeenCalledWith(ColorPickerComponent, { disableClose: true });
    expect(component['colorSelectorService'].colorToChange).toEqual(ColorType.Preview);
  });

  it('#onConfirm should update color', () => {
    history.pushState({
      comingFromEntryPoint: false
    }, 'mockState');
    component.onConfirm();
    expect(history.state['comingFromEntryPoint']).not.toBeTruthy();
    expect(component['colorSelectorService'].colorToChange).toEqual(ColorType.Background);
  });

  it('#onConfirm should open warning message', () => {
    component['canvasService']['layerCount'] = 1;
    const spy = (component.openDialogWarning = jasmine.createSpy().and.callFake(() => null));
    component.onConfirm();
    expect(spy).toHaveBeenCalled();
  });

  it('#onCloseDialog should close', () => {
    const spy = spyOn(component['dialogRef'], 'close');
    history.pushState({
      comingFromEntryPoint: false
    }, 'mockState');
    component.onCloseDialog();
    expect(spy).toHaveBeenCalled();
    expect(history.state['comingFromEntryPoint']).not.toBeTruthy();
  });

  it('#onCloseDialog should close', () => {
    history.pushState({
      comingFromEntryPoint: true
    }, 'mockState');
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['router'], 'navigateByUrl');
    component.onCloseDialog();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith('/');
    expect(history.state['comingFromEntryPoint']).toBeTruthy();
   });

  it('#openDialogWarning should open warning dialog', () => {
    const spy = spyOn(component['dialog'], 'open');
    component.openDialogWarning();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
