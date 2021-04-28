// tslint:disable: no-string-literal | Reason: used to access private variables
// tslint:disable: no-magic-numbers | Reason : testing arbitrary values
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { REGEX_TAG } from 'src/app/classes/regular-expressions';
import { SaveServerService } from 'src/app/services/save-server/save-server.service';
import { GalleryComponent } from './gallery.component';

describe('GalleryComponent', () => {
  let component: GalleryComponent;
  let fixture: ComponentFixture<GalleryComponent>;

  const mockedImage = {
    _id: '1',
    title: 'title',
    tags: ['tag1', 'tag2'],
    serial: 'data:image/svg+xml;12345',
    innerHtml: '<svg></svg>',
    width: 100,
    height: 100,
    background: 'red'
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GalleryComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            moduleDef: GalleryComponent,
            close: () => null,
          }
        },
        {
          provide: SaveServerService,
          useValue: {
            removeTag: (etiquette: string, data: Set<string>) => data.delete(etiquette),
            addTag:  (etiquette: string, data: Set<string>) => {
              if (REGEX_TAG.test(etiquette)) {
                data.add(etiquette);
                return true;
              }
              return false;
            }
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: () => null,
          }
        },
        [{provide: APP_BASE_HREF, useValue : '/' }]
      ],
      imports: [
        MatFormFieldModule,
        MatChipsModule,
        MatGridListModule,
        HttpClientModule,
        MatSnackBarModule,
        MatDialogModule,
        MatInputModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(
          [{
            path : '' , component : GalleryComponent
          }]
        ),
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
    fixture = TestBed.createComponent(GalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#onDialogClose should close dialog', () => {
    history.pushState({
      comingFromEntryPoint: false
    }, 'mockState');
    const spy = spyOn(component['dialogRef'], 'close');
    component.onDialogClose();
    expect(spy).toHaveBeenCalled();
  });

  it('#onDialogClose should close dialog', () => {
    history.pushState({
      comingFromEntryPoint: true
    }, 'mockState');
    const spy = spyOn(component['dialogRef'], 'close');
    const spy2 = spyOn(component['router'], 'navigateByUrl');
    component.onDialogClose();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith('/');
  });

  it('#addTag should add valid tag', () => {
    component['images'] = [
      mockedImage
    ];
    component.addTag('tag1');
    expect(component['tagName']).toEqual('');
    expect(component['resultImages'][0]).toEqual(mockedImage);
  });

  it('#addTag should not add invalid tag', () => {
    component['tagName'] = 'tag1';
    component.addTag('!');
    expect(component['tagName']).toEqual('tag1');
  });

  it('#addTag should not add valid tag, but doesnt match result', () => {
    const spy = spyOn(component['snacks'], 'open');
    component['images'] = [
      mockedImage
    ];
    component.addTag('oneTag');
    expect(component['tagName']).toEqual('');
    expect(component['resultImages'][0]).not.toEqual(mockedImage);
    expect(spy).toHaveBeenCalledWith('Aucun résultat ne correspond à votre recherche.', '', {duration: 3500});
  });

  it('#removeTag should remove valid tag', () => {
    const setOfTags = new Set<string>();
    setOfTags.add('tag1');
    component['tags'] = setOfTags;
    expect(component['tags'].size).toEqual(1);
    component.removeTag('tag1');
    expect(component['tags'].size).toEqual(0);
  });

  it('#removeTag should not remove inexistant tag', () => {
    const setOfTags = new Set<string>();
    setOfTags.add('tag1');
    component['tags'] = setOfTags;
    component['images'] = [];
    expect(component['tags'].size).toEqual(1);
    component.removeTag('tag2');
    expect(component['tags'].size).toEqual(1);
  });

  it('#deleteImage should not delete invalid image id', () => {
    const mocked2 = mockedImage;
    mocked2._id = '4';
    component['images'] = [mockedImage, mocked2];
    component['resultImages'] = [mockedImage, mocked2];
    component.deleteImage('6');
    expect(component['images'].length).toEqual(2);
    expect(component['resultImages'].length).toEqual(2);
  });

  it('#deleteImage should delete valid image id', () => {
    const mocked2 = mockedImage;
    mocked2._id = '4';
    component['images'] = [mockedImage, mocked2];
    component['resultImages'] = [mockedImage, mocked2];
    const spy = spyOn(component['galleryService'], 'deleteImage').and.callFake((id) => {
      for (let i = 0 ; i < component['images'].length ; ++i) {
        if (id === component['images'][i]._id) {
          component['images'].splice(i, 1);
        }
      }
      for (let i = 0 ; i < component['resultImages'].length ; ++i) {
        if (id === component['resultImages'][i]._id) {
          component['resultImages'].splice(i, 1);
        }
      }
      return new Observable();
    });
    component.deleteImage('4');
    expect(component['images'].length).toEqual(1);
    expect(component['resultImages'].length).toEqual(1);
    expect(spy).toHaveBeenCalled();
  });

  it('#loadImage should load image successfully, not currently drawing', () => {
    history.pushState({
      comingFromEntryPoint: false
    }, 'mockState');
    const spy = spyOn(component['galleryService'], 'loadImage').and.callFake((image) => true);
    const spy2 = spyOn(component['snacks'], 'open');
    component.loadImage(mockedImage);
    expect(spy).toHaveBeenCalledWith(mockedImage);
    expect(spy2).toHaveBeenCalledWith('Image chargée avec succès.', '', {duration: 2000});
  });

  it('#loadImage should load image unsuccessfully, not currently drawing', () => {
    const spy = spyOn(component['galleryService'], 'loadImage').and.callFake((image) => false);
    const spy2 = spyOn(component['snacks'], 'open');
    const mocked2 = mockedImage;
    mocked2.serial = '1';
    component.loadImage(mocked2);
    expect(spy).toHaveBeenCalledWith(mockedImage);
    expect(spy2).toHaveBeenCalledWith('Image corrompue. SVP effacer celle-ci et choisir une autre.', '', {duration: 3500});
  });

  it('#loadImage should load image, currently drawing', () => {
    history.pushState({
      comingFromEntryPoint: false
    }, 'mockState');
    component['drawStackService'].addElementWithInfos({
      target: {} as unknown as SVGGElement,
      id: 10
    });
    const spy = spyOn(component['dialog'], 'open');
    component.loadImage(mockedImage);
    expect(spy).toHaveBeenCalled();
  });

  it('#getTableWidth should return table width in px', () => {
    component['resultImages'] = [mockedImage, mockedImage];
    expect(component.getTableWidth()).toEqual('250px');
  });

  it('#onMouseEnter should update hoverIndex', () => {
    component['hoveredIndex'] = 5;
    component.onMouseEnter(1);
    expect(component['hoveredIndex']).toEqual(1);
  });

  it('#onMouseLeave should change hoverIndex', () => {
    component['hoveredIndex'] = 5;
    component.onMouseLeave();
    expect(component['hoveredIndex']).toEqual(-1);
  });

  it('#formatTagArray should format tags', () => {
    expect(component.formatTagsArray([
      'tag1',
      'tag2'
    ])).toEqual('tags : tag1, tag2');
  });
});
