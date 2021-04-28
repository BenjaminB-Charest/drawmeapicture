// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';
import * as CONSTANT from 'src/app/classes/constants';
import { DrawablePropertiesService } from './drawable-properties.service';

describe('DrawablePropertiesService', () => {

  let service: DrawablePropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({

    });
    service = TestBed.get(DrawablePropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get default values', () => {
    expect(service.thickness.value).toEqual(CONSTANT.THICKNESS_DEFAULT);
    expect(service.dotDiameter.value).toEqual(CONSTANT.DIAMETER_DEFAULT);
    expect(service.junction.value).toBe(false);
  });

  it('should change thickness', () => {
    let thickness = 0;
    const testValue = 10;
    service.thickness.subscribe((newThickness) => {
      thickness = newThickness;
    });
    service.thickness.next(testValue);
    expect(thickness).toEqual(testValue);
  });

  it('should change junction type', () => {
    let junction = false;
    service.junction.subscribe((newJunction) => {
      junction = newJunction;
    });
    service.junction.next(true);
    expect(junction).toBe(true);
  });
});
