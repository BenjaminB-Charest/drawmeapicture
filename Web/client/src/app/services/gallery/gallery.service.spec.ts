// tslint:disable: no-string-literal | Reason: used to access private variables
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Image } from 'src/app/interfaces/image';
import { GalleryService } from './gallery.service';

describe('GalleryService', () => {
  let service: GalleryService;
  const validImage = {
    _id: '5e72ea0f7857dd3c0c2b5a13',
    title: 'MyImage',
    tags: ['tag1', 'tag2', 'tag3'],
    serial: 'data:image/svg+xml;base64,PHN2Z',
    innerHtml: '<defs...',
    width: 300,
    height: 300,
    background: 'rgb(255, 255, 255)'
  } as Image;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });
    service = TestBed.get(GalleryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#loadImage should update refToSvg', () => {
    spyOn(service, 'verifyImage').and.returnValue(true);
    service['refToSvg'] = {
      nativeElement: {
        getAttribute: () => 0,
        setAttribute: () => 0,
        style: {
          backgroundColor: ''
        },
        innerHtml: ''
      } as unknown as SVGElement
    };
    const spy = spyOn(service['refToSvg'].nativeElement, 'setAttribute');
    service.loadImage(validImage);
    expect(spy).toHaveBeenCalledTimes(2);

  });

  it('#getAllImages should retrieve all images', () => {
    const spy = spyOn(service['http'], 'get');
    service.getAllImages();
    expect(spy).toHaveBeenCalled();
  });

  it('#deleteImage should delete an image', () => {
    const spy = spyOn(service['http'], 'delete');
    service.deleteImage('imageToDelete');
    expect(spy).toHaveBeenCalled();
  });

  it('#verifyImage should accept a valid image', () => {
    expect(service.verifyImage({
      width: 100,
      height: 100,
      serial: 'data:image/svg+xml;base64,PHN2Z',
      innerHtml: '<defs...'
    } as Image)).toEqual(true);
  });

  it('#verifyImage should deny an invalid width', () => {
    const invalidImage = validImage;
    /*tslint:disable-next-line: no-magic-numbers */
    invalidImage.width = -5;
    const result = service.verifyImage(invalidImage);
    expect(result).toBeFalsy();
  });

  it('#verifyImage should deny an invalid height', () => {
    const invalidImage = validImage;
    /*tslint:disable-next-line: no-magic-numbers */
    invalidImage.height = -5;
    const result = service.verifyImage(invalidImage);
    expect(result).toBeFalsy();
  });

  it('#verifyImage should deny an empty serial', () => {
    const invalidImage = validImage;
    invalidImage.serial = '';
    const result = service.verifyImage(invalidImage);
    expect(result).toBeFalsy();
  });

  it('#verifyImage should deny an invalid serial', () => {
    const invalidImage = validImage;
    invalidImage.serial = 'invalid serial';
    const result = service.verifyImage(invalidImage);
    expect(result).toBeFalsy();
  });

  it('#verifyImage should deny an empty html', () => {
    const invalidImage = validImage;
    invalidImage.innerHtml = '';
    const result = service.verifyImage(invalidImage);
    expect(result).toBeFalsy();
  });

  it('#verifyImage should deny an invalid html', () => {
    const invalidImage = validImage;
    invalidImage.innerHtml = 'invalid html';
    const result = service.verifyImage(invalidImage);
    expect(result).toBeFalsy();
  });

});
