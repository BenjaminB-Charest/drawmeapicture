// tslint:disable: no-string-literal | Reason: used to access private variables
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { ExportService } from 'src/app/services/export/export.service';
import { ImageFilter } from 'src/app/enums/color-filter';
import { ImageExportType } from 'src/app/enums/export-type';
import { ImageFormat } from 'src/app/enums/image-format';
import { ExportComponent } from './export.component';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            moduleDef: ExportComponent,
            close: () => null,
          },
        },
        // ExportService,
      ],
      imports: [
        MatSnackBarModule,
        HttpClientModule,
        MatSnackBarModule,
        MatRadioModule,
        MatGridListModule
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#onFormatUpdate should update valid format', () => {
    component.onFormatUpdate('JPEG');
    expect(component['exportation'].currentFormat.value).toEqual(ImageFormat.JPEG);
  });

  it('#onFormatUpdate should not update not valid format', () => {
    component['exportation'].currentFormat.next(ImageFormat.JPEG);
    component.onFormatUpdate('bla');
    expect(component['exportation'].currentFormat.value).toEqual(ImageFormat.JPEG);
  });

  it('#onFilterUpdate should update valid filter', () => {
    const spy = spyOn(component['exportation'], 'drawPreview');
    component.onFilterUpdate('Sombre');
    expect(component['exportation'].currentFilter.value).toEqual(ImageFilter.Sombre);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('#onFilterUpdate should not update not valid filter', () => {
    component['exportation'].currentFilter.next(ImageFilter.Aucun);
    const spy = spyOn(component['exportation'], 'drawPreview');
    component.onFilterUpdate('bla' as unknown as ImageFilter);
    expect(component['exportation'].currentFilter.value).toEqual(ImageFilter.Aucun);
    expect(spy).not.toHaveBeenCalled();
  });

  it('#onExportTypeUpdate should update valid export type', () => {
    component['exportation'].currentExportType.next(ImageExportType.Téléchargement);
    expect(component['exportation'].currentExportType.value).toEqual(ImageExportType.Téléchargement);
    component.onExportTypeUpdate('Courriel');
    expect(component['exportation'].currentExportType.value).toEqual(ImageExportType.Courriel);
  });

  it('#onExportTypeUpdate should not update not valid export type', () => {
    component['exportation'].currentExportType.next(ImageExportType.Courriel);
    component.onExportTypeUpdate('bla');
    expect(component['exportation'].currentExportType.value).toEqual(ImageExportType.Courriel);
  });

  it('#onDialogClose shoud close dialog', () => {
    const spy = spyOn(component['dialogRef'], 'close');
    component.onDialogClose();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('#exportConfirmation should export if title is valid', () => {
    component['title'] = 'title';
    component['isTitleValid'] = true;
    component['selectedExportType'] = 'T\u00E9l\u00E9chargement';
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['exportation'], 'export');
    component.exportConfirmation();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledWith('title');
  });

  it('#exportConfirmation shoud show error if title is invalid', () => {
    component['title'] = 'titl!e';
    component['selectedExportType'] = 'T\u00E9l\u00E9chargement';
    component['isTitleValid'] = false;
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['exportation'], 'export');
    const spy3 = spyOn(component['snack'], 'open');
    component.exportConfirmation();
    expect(spy).toHaveBeenCalledTimes(0);
    expect(spy2).toHaveBeenCalledTimes(0);
    expect(spy3).toHaveBeenCalledTimes(1);
  });

  it('#exportConfirmation should email if title and email are valid', () => {
    component['title'] = 'title';
    component['email'] = 'test@email.com';
    component['isTitleValid'] = true;
    component['isEmailValid'] = true;
    component['selectedExportType'] = 'Courriel';
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['exportation'], 'email');
    component.exportConfirmation();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledWith('title', 'test@email.com');
  });

  it('#exportConfirmation should not email if title is invalid', () => {
    component['title'] = 'ti!tle';
    component['email'] = 'test@email.com';
    component['isTitleValid'] = false;
    component['isEmailValid'] = true;
    component['selectedExportType'] = 'Courriel';
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['exportation'], 'email');
    const spy3 = spyOn(component['snack'], 'open');
    component.exportConfirmation();
    expect(spy).toHaveBeenCalledTimes(0);
    expect(spy2).toHaveBeenCalledTimes(0);
    expect(spy3).toHaveBeenCalledTimes(1);
  });

  it('#exportConfirmation should not email if email is invalid', () => {
    component['title'] = 'title';
    component['email'] = 'testemail.com';
    component['isTitleValid'] = true;
    component['isEmailValid'] = false;
    component['selectedExportType'] = 'Courriel';
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['exportation'], 'email');
    const spy3 = spyOn(component['snack'], 'open');
    component.exportConfirmation();
    expect(spy).toHaveBeenCalledTimes(0);
    expect(spy2).toHaveBeenCalledTimes(0);
    expect(spy3).toHaveBeenCalledTimes(1);
  });

  it('#onTitleUpdate shoud validate title', () => {
    const spy = spyOn(component['exportation'], 'validateTitle');
    component.onTitleUpdate(
      {
        target: {
          value: 'titletest'
        } as HTMLInputElement
      } as unknown as KeyboardEvent
    );
    expect(spy).toHaveBeenCalledWith('titletest');
  });

  it('#onTitleUpdate shoud not validate title, target is null', () => {
    const spy = spyOn(component['exportation'], 'validateTitle');
    component.onTitleUpdate(
      {
        target: null
      } as unknown as KeyboardEvent
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('#onEmailUpdate shoud validate email', () => {
    const spy = spyOn(component['exportation'], 'validateEmail');
    component.onEmailUpdate(
      {
        target: {
          value: 'test@email.com'
        } as HTMLInputElement
      } as unknown as KeyboardEvent
    );
    expect(spy).toHaveBeenCalledWith('test@email.com');
  });

  it('#onEmailUpdate shoud not validate email, target is null', () => {
    const spy = spyOn(component['exportation'], 'validateEmail');
    component.onTitleUpdate(
      {
        target: null
      } as unknown as KeyboardEvent
    );
    expect(spy).not.toHaveBeenCalled();
  });
});
