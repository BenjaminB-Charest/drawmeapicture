// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';

import { Color } from '../../classes/color';
import { ColorType } from '../../enums/color-types';
import { ColorSelectorService } from './color-selector.service';

describe('ColorSelectorService', () => {

  let service: ColorSelectorService;
  const colors = ['#ABCDEF', '#ABCDE1', '#ABCDE2', '#ABCDE3'];
  const RECENT_COLORS_AMOUNT = 10;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(ColorSelectorService);

  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getCurrentlySelectedColor should return color of currently selected', () => {
    // tslint:disable: no-magic-numbers | Reason : testing with array indexes
    service['colorToChange'] = ColorType.Primary;
    service.updateColor(new Color(colors[0]));
    expect(service.getCurrentlySelectedColor().getHex()).toEqual(colors[0]);
    expect(service.getCurrentlySelectedColor().getHex()).toEqual(colors[1]);
    service['colorToChange'] = ColorType.Background;
    service.updateColor(new Color(colors[2]));
    expect(service.getCurrentlySelectedColor().getHex()).toEqual(colors[2]);
    service['colorToChange'] = ColorType.Preview;
    service.updateColor(new Color(colors[3]));
    expect(service.getCurrentlySelectedColor().getHex()).toEqual(colors[3]);
  });

  it('#updateColor should update all colors', () => {
    service['colorToChange'] = ColorType.Primary;
    service.updateColor(new Color(colors[0]));
    service['colorToChange'] = ColorType.Background;
    service.updateColor(new Color(colors[2]));
    service['colorToChange'] = ColorType.Preview;
    service.updateColor(new Color(colors[3]));
    expect(service['primaryColor'].value.getHex()).toEqual('#ABCDEF');
    expect(service['backgroundColor'].value.getHex()).toEqual('#ABCDE2');
    expect(service['temporaryColor'].value.getHex()).toEqual('#ABCDE3');
  });

});
