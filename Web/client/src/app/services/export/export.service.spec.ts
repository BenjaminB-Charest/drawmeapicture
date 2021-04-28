// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';

import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Renderer2 } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { ImageFilter } from 'src/app/enums/color-filter';
import { ImageFormat } from 'src/app/enums/image-format';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;
  const mockedElement = {
    id: '100',
    setAttribute: () => null,
    cloneNode: () => mockedElement as unknown as Node,
    insertBefore: () => null,
  } as unknown as SVGElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,

      ]
    });
    service = TestBed.get(ExportService);
    service['image'] = {
      nativeElement: {
        id: '100',
        setAttribute: () => null,
        getAttribute: () => null,
        insertBefore: () => null,
        cloneNode: () => mockedElement,
        style: () => ({
          backgroundColor: 'red'
        })
      } as unknown as SVGElement
    };

    service['myDownload'] = {
      nativeElement: {
        id: '100',
        setAttribute: () => null,
        cloneNode: () => mockedElement,
      } as unknown as SVGElement
    };

    service['originalCanvas'] = {
      filter: null,
      width: 100,
      height: 100,
      toDataURL: () => 'url',
      drawImage: () => null,
      getContext: () => ({
        filter: '',
        drawImage: () => null
      } as unknown as CanvasRenderingContext2D)
    } as unknown as HTMLCanvasElement;

    service['manipulator'] = {
      createElement: () => null,
      setAttribute: () => null,

    } as unknown as Renderer2;

    service['canvas'] = {
      filter: null,
      toDataURL: () => 'url',
      drawImage: () => null,
      getContext: () => ({
        clearRect: () => null,
        filter: '',
        drawImage: () => null,
        scale: () => null,
        canvas: {
          width: 100,
          height: 100,
        }
      } as unknown as CanvasRenderingContext2D)
    } as unknown as HTMLCanvasElement;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#initialize should init reference image', () => {
    const mockedElementRef = { nativeElement: mockedElement };
    expect(service['image'].nativeElement.id).toEqual('100');
    service.initialize({} as unknown as Renderer2, mockedElementRef);
    expect(service['image']).toEqual(mockedElementRef);
  });

  it('#validateTitle should set valid title', () => {
    service.validateTitle('test1');
    expect(service['isTitleValid'].value).toEqual(true);
  });

  it('#validateTitle should not set invalid title', () => {
    service.validateTitle('1');
    expect(service['isTitleValid'].value).toEqual(false);
  });

  it('#export should export svg with filter', () => {
    const spy = spyOn(service['myDownload'].nativeElement, 'setAttribute');
    service['currentFormat'].next(ImageFormat.SVG);
    service['currentFilter'].next(ImageFilter.Négatif);
    const spy2 = spyOn(service['serialized'], 'serializeToString').and.callFake(() => {
      return 'string';
    });
    service.export('title');
    expect(spy.calls.allArgs()).toEqual([
      [ 'href', 'data:image/svg+xml;base64,' + btoa('string')],
      [ 'download', 'title.svg' ]
    ]);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalled();
  });

  it('#export should export jpeg without filter', () => {
    service['currentFormat'].next(ImageFormat.JPEG);
    service['currentFilter'].next(undefined as unknown as ImageFilter);
    const spy = spyOn(service['originalCanvas'], 'getContext');
    const spy2 = spyOn(service['myDownload'].nativeElement, 'setAttribute');
    spyOn(service['originalCanvas'], 'toDataURL').and.callFake( () => {
      return 'data';
    });
    service['imageAfterDeserialization'] = {
      src: '1',
    } as unknown as HTMLImageElement;
    service.export('title');
    expect(spy).toHaveBeenCalled();
    expect(service['imageAfterDeserialization'].src).toEqual('data');
    expect(spy2.calls.allArgs()).toEqual([
      [ 'href', 'data'],
      [ 'download', 'title.JPEG' ]
    ]);
    expect(spy2).toHaveBeenCalledTimes(2);
  });

  it('#email should send svg with filter', () => {
    service['currentFormat'].next(ImageFormat.SVG);
    service['currentFilter'].next(ImageFilter.Négatif);
    const spy = spyOn(service, 'sendEmail').and.callFake( () => new Observable() );
    const spy2 = spyOn(service['serialized'], 'serializeToString').and.callFake(() => {
      return 'string';
    });
    service.email('title', 'my@email.com');
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('#email should send png without filter', () => {
    service['currentFormat'].next(ImageFormat.JPEG);
    service['currentFilter'].next(undefined as unknown as ImageFilter);
    spyOn(service['originalCanvas'], 'toDataURL').and.callFake( () => {
      return 'data';
    });
    service['imageAfterDeserialization'] = {
      src: '1',
    } as unknown as HTMLImageElement;
    const spy = spyOn(service, 'sendEmail').and.callFake( () => new Observable() );

    service.email('title', 'my@email.com');
    expect(spy).toHaveBeenCalled();
    expect(service['imageAfterDeserialization'].src).toEqual('data');
  });

  it('#sendEmail should send an email', () => {
    const spy = spyOn(service['http'], 'post');
    const validEmail = 'test@email.com';
    const validTitle = 'My title';
    const validData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQA';
    const validExtension = 'jpeg';
    service.sendEmail(validTitle, validEmail, validData, validExtension);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if email was sent successfully', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_OK });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if email is missing', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_BAD_REQUEST });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if API key is missing', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_FORBIDDEN });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if payload is missing', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_UNPROCESSABLE });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if too many emails were sent', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_TOO_MANY });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if there was an internal error', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_INTERNAL_ERROR });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#handleError should tell if there was a communication error', () => {
    const spy = spyOn(service['snack'], 'open');
    const error = new HttpErrorResponse({ status: CONSTANTS.HTTP_STATUS_NOT_FOUND });
    service.handleError(error);
    expect(spy).toHaveBeenCalled();
  });

  it('#drawPreview should preview element on firstCall', () => {
    service['currentFilter'].next(ImageFilter.Négatif);
    service.drawPreview(true);
  });
});
