// tslint:disable: no-string-literal | Reason: used to access private variables
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { Color } from 'src/app/classes/color';
import { ColorType } from 'src/app/enums/color-types';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ColorPickerComponent } from './color-picker.component';

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;
  let service: ColorSelectorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorPickerComponent ],
      providers: [
        FormsModule,
        ColorSelectorService,
        {
          provide: MatDialogRef,
          useValue: {
            moduleDef: ColorPickerComponent,
            close: () => null,
          }
        },
        {
          provide: ColorPaletteComponent,
          useValue: {
            initialColor: new Color('#000000'),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.get<ColorSelectorService>(ColorSelectorService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#updateRed should set new red value', () => {
    const test = fixture.debugElement.queryAll(By.css('input'));
    test[0].triggerEventHandler('blur', {
      target: {
        value: 10
      }
    });
    expect(component.selectedColor.getRedHex()).toEqual('10');
  });

  it('#updateRed shouldn\'t set new red value', () => {
    const test = fixture.debugElement.queryAll(By.css('input'));
    test[0].triggerEventHandler('blur', null);
    expect(component.selectedColor.getGreenHex()).toEqual('00');
  });

  it('#updateGreen should set new green value', () => {
    const test = fixture.debugElement.queryAll(By.css('input'));
    test[1].triggerEventHandler('blur', {
      target: {
        value: 10
      }
    });
    expect(component.selectedColor.getGreenHex()).toEqual('10');
  });

  it('#updateGreen shouldn\'t set new green value', () => {
    const test = fixture.debugElement.queryAll(By.css('input'));
    test[1].triggerEventHandler('blur', null);
    expect(component.selectedColor.getGreenHex()).toEqual('00');
  });

  it('#updateBlue should set new blue value', () => {
    const test = fixture.debugElement.queryAll(By.css('input'));
    test[2].triggerEventHandler('blur', {
      target: {
        value: 10
      }
    });
    expect(component.selectedColor.getBlueHex()).toEqual('10');
  });

  it('#updateBlue shouldn\'t set new blue value', () => {
    const test = fixture.debugElement.queryAll(By.css('input'));
    test[2].triggerEventHandler('blur', null);
    expect(component.selectedColor.getGreenHex()).toEqual('00');
  });

  it('#onDialogClose should close dialog', () => {
    const spy = spyOn(component['dialogRef'], 'close');
    component.onDialogClose();
    expect(spy).toHaveBeenCalled();
  });

  it('#onConfirm should update color', () => {
    service['colorToChange'] = ColorType.Primary;
    service['primaryColor'] = new BehaviorSubject<Color>(new Color('#FFFFFF'));
    component.selectedColor = new Color('#ABCDEF');
    component.onConfirm();
    expect(service['primaryColor'].value.getHex()).toEqual('#ABCDEF');
  });

});
