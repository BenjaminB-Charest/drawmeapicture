// tslint:disable: no-string-literal | Reason: used to access private variables
import { getTestBed, TestBed } from '@angular/core/testing';

import { ElementRef, Renderer2, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Color } from 'src/app/classes/color';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { DrawStackService } from 'src/app/services/draw-stack/draw-stack.service';
import { DrawablePropertiesService } from '../properties/drawable-properties.service';
import { PencilService } from './pencil.service';
// tslint:disable: no-magic-numbers no-any

describe('PencilService', () => {
  let service: PencilService;
  let manipulator: Renderer2;
  let image: ElementRef<SVGPolylineElement>;
  const colorSubject =  new BehaviorSubject<Color>(new Color('#FFFFFF'));
  const mockedRendered = (parentElement: any, name: string, debugInfo?: any): Element => {
    const element = new Element();
    parentElement.children.push(element);
    return element;
  };

  const eventMocker = (event: string, keyUsed: number) =>
      new MouseEvent(event, {button: keyUsed, clientX: 10, clientY: 10});
  let spyPushSVG: jasmine.Spy<InferableFunction>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Renderer2,
          useValue: {
              createElement: () => mockedRendered,
              setAttribute: () => null,
              appendChild: () => null,
              removeChild: () => null,
          },
      },
      {
        provide: ElementRef,
        useValue: {
            nativeElement: {
                getBoundingClientRect: () => {
                    const boundleft = 0;
                    const boundtop = 0;
                    const boundRect = {
                        left: boundleft,
                        top: boundtop,
                    };
                    return boundRect;
                },
            },
          },
        },
        {
          provide: ColorSelectorService,
          useValue: {
            primaryColor: colorSubject,
            primaryTransparency: new BehaviorSubject<number>(3)
          },
        },
        DrawStackService
      ],
    });
    service = getTestBed().get(PencilService);
    manipulator = getTestBed().get<Renderer2>(Renderer2 as Type<Renderer2>);
    image = getTestBed().get<ElementRef>(ElementRef as Type<ElementRef>);
    service.attributes = new DrawablePropertiesService();
    service.initialize(manipulator, image,
      getTestBed().get<ColorSelectorService>(ColorSelectorService as Type<ColorSelectorService>),
      getTestBed().get<DrawStackService>(DrawStackService as Type<DrawStackService>));

    spyPushSVG = (service['pushElement'] = jasmine.createSpy().and.callFake(() => null));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#initializeProperties should set default properties', () => {
    service.initializeProperties();
    expect(service.thickness).toEqual(service.attributes.thickness.value);
  });

  it('#initializeProperties should initialize subscriptions', () => {
    const randomTestValue = 10;
    service.initializeProperties();
    service.attributes.thickness.next(randomTestValue);
    expect(service.thickness).toEqual(randomTestValue);
  });

  it('#onMouseInCanvas should create circle', () => {
    service.onMouseInCanvas(eventMocker('mousemove', 0));
    expect(service['mousePointer']).not.toBeUndefined();
  });

  it('#onMouseOutCanvas should remove mouse pointer', () => {
    service.onMouseOutCanvas(eventMocker('mouseup', 0));
    expect(service['mousePointer']).toBeUndefined();
  });

  it('#onMousePress should remove mouse pointer', () => {
    service.onMouseMove(eventMocker('mousepress', 0));
    service.onMousePress(eventMocker('mousepress', 0));
    expect(service['mousePointer']).toBeUndefined();
  });

  it('#onMouseRelease should stop drawing with "l 0,0" with simple click', () => {
    service.onMousePress(eventMocker('mouserelease', 0));
    service.onMouseRelease(eventMocker('mouserelease', 0));
    expect(service.isDrawing).not.toBeTruthy();
    expect(service['path'].substr(-5, 5)).toEqual('l 0,0');
    expect(spyPushSVG).toHaveBeenCalled();
  });

  it('#onMouseRelease should do nothin when not drawing', () => {
    const spy = spyOn(manipulator, 'setAttribute');
    service.onMouseRelease(eventMocker('mouserelease', 0));
    expect(spy).not.toHaveBeenCalled();
  });

  it('#onMouseOutCanvas should stop drawing', () => {
    service.onMousePress(eventMocker('mouserelease', 0));
    service.onMouseOutCanvas(eventMocker('mouserelease', 0));
    expect(service.isDrawing).not.toBeTruthy();
    expect(spyPushSVG).toHaveBeenCalled();
  });

  it('#onMouseOutCanvas should remove mousePointer', () => {
    service.onMousePress(eventMocker('mouserelease', 0));
    service.onMouseOutCanvas(eventMocker('mouserelease', 0));
    expect(service['mousePointer']).toBeUndefined();
    service.onMouseInCanvas(eventMocker('mouserelease', 0));
    service.onMouseOutCanvas(eventMocker('mouserelease', 0));
    expect(service['mousePointer']).toBeUndefined();
  });

  it('#onMouseMove should update path, user is drawing', () => {
    service.isDrawing = true;
    service.onMouseMove(eventMocker('mousemouve', 0));
    expect(service['previousX']).toEqual(10);
    expect(service['previousY']).toEqual(10);
  });

  it('#onMouseMove should update mousepointer, user is previewing', () => {
    service.onMouseMove(eventMocker('mousemouve', 0));
    const spy = spyOn(manipulator, 'setAttribute');
    service.onMouseMove(eventMocker('mousemouve', 0));
    expect(service['previousX']).not.toBeDefined();
    expect(service['previousY']).not.toBeDefined();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('#endTool should remove everything', () => {
    const mockedRemoveChild = (el: SVGGElement): void => { /*Much Wow*/ };
    service.onMousePress(eventMocker('mousemouve', 0));
    const removeChild = (service['subElement'].remove = jasmine.createSpy().and.callFake(mockedRemoveChild));
    let removeCount = removeChild.calls.count();
    service.onMouseMove(eventMocker('mousemouve', 0));
    expect(service['subElement']).not.toBeUndefined();
    expect(service['mousePointer']).toBeUndefined();
    expect(removeChild.calls.count()).toEqual(removeCount);
    removeCount = removeChild.calls.count();

    service['endTool']();
    expect(service['subElement']).toBeUndefined();
    expect(service['mousePointer']).toBeUndefined();
    expect(removeChild.calls.count()).toBeGreaterThan(removeCount);
    removeCount = removeChild.calls.count();

    service.onMouseMove(eventMocker('mousemouve', 0));
    expect(service['subElement']).toBeUndefined();
    expect(service['mousePointer']).not.toBeUndefined();
    expect(removeChild.calls.count()).toEqual(removeCount);
    removeCount = removeChild.calls.count();

    service['endTool']();
    expect(service['subElement']).toBeUndefined();
    expect(service['mousePointer']).toBeUndefined();
    expect(removeChild.calls.count()).toBeGreaterThan(removeCount);
  });
});
