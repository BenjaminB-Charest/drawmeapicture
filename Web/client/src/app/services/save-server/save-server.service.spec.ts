// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';

import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SaveServerService } from './save-server.service';

describe('SaveServerService', () => {
  let service: SaveServerService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        MatSnackBarModule,

      ]
    });
    service = TestBed.get(SaveServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#checkTitleValidity should check for a valid title', () => {
    expect(service.checkTitleValidity('test')).toEqual(true);
  });

  it('#checkTitleValidity should check for an unvalid title', () => {
    expect(service.checkTitleValidity('1')).toEqual(false);
  });

  it('#addTag should add valid tag', () => {
    const setOfData = new Set<string>();
    const etiquette = 'tag1';
    const ret = service.addTag(etiquette, setOfData);
    expect(setOfData.has(etiquette.toUpperCase())).toEqual(true);
    expect(ret).toEqual(true);
  });

  it('#addTag should not add invalid tag', () => {
    const setOfData = new Set<string>();
    const ret = service.addTag('!!!!!!', setOfData);
    expect(setOfData.has('!!!!!!')).toEqual(false);
    expect(ret).toEqual(false);
  });

  it('#removeTag should remove tag', () => {
    const setOfData = new Set<string>();
    setOfData.add('tag');
    expect(setOfData.has('tag')).toEqual(true);
    service.removeTag('tag', setOfData);
    expect(setOfData.has('tag')).toEqual(false);
  });

  it('#handleError should return success message', () => {
    const spy = spyOn(service['snacks'], 'open');
    service.handleError(new HttpErrorResponse({
      status: 201
    }));
    expect(spy).toHaveBeenCalledWith('Votre image a été sauvegardé avec succès', '', {duration: 1500});
  });

  it('#handleError should return error message', () => {
    const spy = spyOn(service['snacks'], 'open');
    service.handleError(new HttpErrorResponse({
      status: 404
    }));
    expect(spy).toHaveBeenCalledWith('Une erreur de communication a occuré, votre image n\'a pas pu être sauvegardé', '', {duration: 1800});
  });

  it('#addImage should add image', () => {
    const spy = spyOn(service['http'], 'post');
    service['refToSvg'] = {
      nativeElement: {
        // tslint:disable-next-line: no-magic-numbers | testing with arbitrary value
        getAttribute: () => 100,
        style: {
          backgroundColor: 'red'
        },
        outerHTML: '<svg><g></g></svg>'
      } as unknown as SVGElement
    };
    const tags = new Set<string>();
    tags.add('tag1');
    tags.add('tag2');
    tags.add('tag3');
    service.addImage('iamge', tags, 'src/img/');
    expect(spy).toHaveBeenCalled();
  });
});
