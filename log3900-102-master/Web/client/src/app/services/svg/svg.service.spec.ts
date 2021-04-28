// tslint:disable: no-string-literal | Reason: used to access private variables
import { Renderer2, Type } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { SVGService } from './svg.service';

describe('SVGService', () => {

  let stack: SVGService;
  let manipulator: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SVGService,
        {
          provide: Renderer2,
          useValue: {
              setAttribute: () => null,
              createElement: () => ({} as unknown) as SVGElement,
              appendChild: () => null,
              removeChild: () => null,
          },
      },
    ]
    });
    stack = getTestBed().get(SVGService);
    manipulator = getTestBed().get<Renderer2>(Renderer2 as Type<Renderer2>);
  });

  it('should be created', () => {
    expect(stack).toBeTruthy();
  });

  it('#getStack should return empty stack', () => {
    expect(stack.getStack().getAll().length).toEqual(0);
  });

  it('#getStack should return non empty stack', () => {
    const element: SVGGElement = manipulator.createElement(SVGProperties.g, SVGProperties.nameSpace);
    manipulator.setAttribute(element, SVGProperties.title, 'test');
    stack.addElement(element);
    expect(stack.getStack().getAll().length).toEqual(1);
  });

  it('#addElement should add element at the end', () => {
    const toAdd: SVGGElement = manipulator.createElement(SVGProperties.g);
    manipulator.setAttribute(toAdd, SVGProperties.title, 'test');
    stack.addElement(toAdd);
    const toAdd2: SVGGElement = manipulator.createElement(SVGProperties.g);
    manipulator.setAttribute(toAdd, SVGProperties.title, 'test22');
    stack.addElement(toAdd);
    expect(stack.getStack().getLast()).toEqual(toAdd2);
  });

  it('#removeLastElement should remove all elements', () => {
    while (stack.removeLastElement() !== undefined) {
      // While not empty
    }
    expect(stack.getStack().getAll().length).toEqual(0);
  });

  it('#removeLastElement should be get undefined last element', () => {
    expect(stack.removeLastElement()).toBe(undefined);
  });
});
