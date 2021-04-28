// tslint:disable: no-string-literal | Reason: used to access private variables
import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from 'src/app/classes/color';
import { ColorPaletteComponent } from './color-palette.component';

describe('ColorPaletteComponent', () => {
  let component: ColorPaletteComponent;
  let fixture: ComponentFixture<ColorPaletteComponent>;
  const MAX_POSITION = 100;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorPaletteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorPaletteComponent);
    component = fixture.componentInstance;
    component.initialColor = new Color('#000000');
    component.ngAfterViewInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngOnChanges should setup changes', () => {
    const spy = spyOn(component['newColor'], 'emit');
    component['currentSelectedPosition'] = {x: 10, y: 10};
    component.ngOnChanges({
      initialColor: new SimpleChange(null, new Color('#ABCDEF'), true)
    });
    expect(spy).toHaveBeenCalled();
  });

  it('#ngOnChanges should setup changes not with new position', () => {
    const spy = spyOn(component['newColor'], 'emit');
    component['currentSelectedPosition'] = undefined as unknown as {x: number, y: number};
    component.ngOnChanges({
      initialColor: new SimpleChange(null, new Color('#ABCDEF'), true)
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('#emitColor should emit newly slected color', () => {
    const spy = spyOn(component.newColor, 'emit');
    component.emitColor(1, 1);
    expect(spy).toHaveBeenCalledWith(new Color('#FCFCFC'));
  });

  it('#onMouseUp should change mouse state', () => {
    component['isMouseDown'] = true;
    window.dispatchEvent(new MouseEvent('mouseup', {button: 0}));
    expect(component['isMouseDown']).not.toBeTruthy();
  });

  it('#onMouseMove should change color', () => {
    component['isMouseDown'] = true;
    const spy = spyOn(component, 'emitColor');
    component.onMouseMove(new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100
    }));
    expect(component['currentSelectedPosition'].x).toEqual(MAX_POSITION);
    expect(component['currentSelectedPosition'].y).toEqual(MAX_POSITION);
    expect(spy).toHaveBeenCalled();
  });

  it('#onMouseMove shouldn\'t change anything', () => {
    component['currentSelectedPosition'] = {x: 1, y: 1} ;
    component['isMouseDown'] = false;
    const spy = spyOn(component, 'emitColor');
    component.onMouseMove(new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100
    }));
    expect(component['currentSelectedPosition'].x).toEqual(1);
    expect(component['currentSelectedPosition'].y).toEqual(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('#onMouseDown should ', () => {
    component.onMouseDown(new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100
    }));
    expect(component['currentSelectedPosition'].x).toEqual(MAX_POSITION);
    expect(component['currentSelectedPosition'].y).toEqual(MAX_POSITION);
    expect(component['isMouseDown']).toBeTruthy();
  });

  it('#correctDigits should correct length is 1', () => {
    const res = component['correctDigits']('1');
    expect(res).toEqual('01');
  });

  it('#correctDigits should not correct length is ok', () => {
    const res = component['correctDigits']('11');
    expect(res).toEqual('11');
  });
});
