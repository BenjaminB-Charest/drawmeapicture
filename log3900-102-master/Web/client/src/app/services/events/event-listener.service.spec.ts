// tslint:disable: no-string-literal | Reason: used to access private variables
import { getTestBed, TestBed } from '@angular/core/testing';

import { ElementRef, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tools } from 'src/app/enums/tools';
import { ColorSelectorService } from '../color-selector/color-selector.service';
import { LineService } from '../drawable/line/line.service';
import { ToolSelectorService } from '../tools-selector/tool-selector.service';
import { EventListenerService } from './event-listener.service';

describe('EventListenerService', () => {

  let service: EventListenerService;
  let manipulator: Renderer2;
  const line: LineService = new LineService();
  // tslint:disable-next-line: no-any | Reason : parentElement: Element creates an issue
  const mockedRendered = (parentElement: any, name: string, debugInfo?: string): Element => {
    const element = new Element();
    parentElement.children.push(element);
    return element;
  };
  // tslint:disable-next-line: no-any | Reason : parentElement: Element creates an issue
  const mockedEventListener = (parentElement: any, name: string, debugInfo: (event: Event) => void): void => {
    window.addEventListener(name, debugInfo);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [  ],
      providers: [
      {
        provide: Renderer2,
        useValue: {
          createElement: () => mockedRendered,
          setAttribute: () => mockedRendered,
          appendChild: () => mockedRendered,
          listen: () => mockedEventListener,
        },
      },
      {
        provide: ToolSelectorService,
        useValue: {
          drawerService: () => null,
          $currentTool: new BehaviorSubject<Tools>(Tools.Line),
          getLine: () => line,
          getCurrentTool: () => line,
          setCurrentTool: () => null
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
            },
        },
      ],
    }).compileComponents();
    const testBed = getTestBed();
    service = testBed.get(EventListenerService);
    manipulator = testBed.get(Renderer2);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#initializeEvents should initialize events', () => {
    const spyOnListen = spyOn(manipulator, 'listen');
    service.initializeEvents();
    // tslint:disable-next-line: no-magic-numbers | Reason : amount of event listeners
    expect(spyOnListen).toHaveBeenCalledTimes(11);
  });

  it('#initializeEvents should call window events', () => {
    service.currentTool = line;
    service.initializeEvents();
    service['toolSelector'].setCurrentTool(Tools.Line);
    const spy = spyOn(service['currentTool'], 'onKeyPressed');
    const spy2 = spyOn(service['currentTool'], 'onKeyReleased');
    window.dispatchEvent(new MouseEvent('keydown'));
    window.dispatchEvent(new MouseEvent('keyup'));
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });
});
