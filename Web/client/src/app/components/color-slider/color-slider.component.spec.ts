// tslint:disable: no-string-literal | Reason: used to access private variables
// tslint:disable: no-magic-numbers | Reason : testing arbitrary values
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Color } from 'src/app/classes/color';
import { ColorSliderComponent } from './color-slider.component';

describe('ColorSliderComponent', () => {
  let component: ColorSliderComponent;
  let fixture: ComponentFixture<ColorSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorSliderComponent);
    component = fixture.componentInstance;
    component.ngAfterViewInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngAfterViewInit should init ctx', () => {
    expect(component['ctx']).toBeTruthy();
  });

  it('#ngAfterViewInit should setup ctx', () => {
    component['currentSelectedHeight'] = 1;
    const spy = spyOn(component['ctx'], 'moveTo');
    const spy2 = spyOn(component['ctx'], 'lineTo');
    component.ngAfterViewInit();
    expect(spy).toHaveBeenCalledWith(0, 1);
    expect(spy2).toHaveBeenCalledWith(5, 1);
  });

  it('#emitHue should emit a new hue', () => {
    const spy = spyOn(component.newHue, 'emit');
    component.emitHue(10);
    expect(spy).toHaveBeenCalledWith(new Color('#FF3500'));
  });

  it('#onMouseUp should call function when event is emited', () => {
    const spy = spyOn(component, 'onMouseUp');
    window.dispatchEvent(new MouseEvent('mouseup', {}));
    expect(spy).toHaveBeenCalled();
    expect(component['isMouseDown']).not.toBeTruthy();
  });

  it('#onMouseUp should change mouse status', () => {
    component.onMouseUp(new MouseEvent('mouseup', {}));
    expect(component['isMouseDown']).not.toBeTruthy();
  });

  it('#onMouseMove should modify on mouse down', () => {
    const event = new MouseEvent('mousedown', {});
    component.onMouseDown(event);
    const spy = spyOn(component, 'emitHue');
    component.onMouseMove(event);
    expect(spy).toHaveBeenCalled();
  });

  it('#onMouseMove shouldn\'t modify on mouse up', () => {
    const spy = spyOn(component, 'emitHue');
    component.onMouseMove(new MouseEvent('mouseup', {}));
    expect(spy).not.toHaveBeenCalled();
  });

  it('#onMouseDown should emit a new hue', () => {
    const spy = spyOn(component.newHue, 'emit');
    component.onMouseDown(new MouseEvent('mousedown', {}));
    expect(spy).toHaveBeenCalled();
  });
});
