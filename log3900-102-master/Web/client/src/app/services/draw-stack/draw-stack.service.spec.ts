// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';
import { DrawStackService } from './draw-stack.service';
// tslint:disable: no-magic-numbers no-any

describe('DrawStackService', () => {
  let service: DrawStackService;
  const mockedSVGElementInfo = {
    target: {
      getBoundingClientRect: () => new DOMRect(100, 100, 50, 50)
    } as unknown as SVGGElement,
    id: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({

    });
    service = TestBed.get(DrawStackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#addElementWithInfos should add first element', () => {
    mockedSVGElementInfo.id = 0;
    const spy = spyOn(service['elements'], 'insert');
    service.addElementWithInfos(mockedSVGElementInfo);
    expect(service.changeAt.value).toEqual(-1);
    expect(service['nextId']).toEqual(1);
    expect(spy).toHaveBeenCalled();
  });

  it('#addElementWithInfos should not add duplicated element', () => {
    mockedSVGElementInfo.id = 0;
    service['elements'].pushBack(mockedSVGElementInfo);
    const spy = spyOn(service['elements'], 'insert');
    service.addElementWithInfos(mockedSVGElementInfo);
    expect(service['elements'].getAll().length).toEqual(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('#addElementWithInfos should add first element with good id', () => {
    const spy = spyOn(service['elements'], 'insert');
    service['nextId'] = 2;
    mockedSVGElementInfo.id = 1;
    service.addElementWithInfos(mockedSVGElementInfo);
    expect(service.changeAt.value).toEqual(1);
    expect(spy).toHaveBeenCalled();
  });

  it('#removeElement should remove valid element', () => {
    mockedSVGElementInfo.id = 15;
    service['elements'].pushBack(mockedSVGElementInfo);
    expect(service['elements'].getAll().length).not.toEqual(0);
    service.removeElement(15);
    expect(service['elements'].getAll().length).toEqual(0);
  });

  it('#removeElement shouldn\'t remove non valid element', () => {
    mockedSVGElementInfo.id = 0;
    service['elements'].pushBack(mockedSVGElementInfo);
    expect(service['elements'].getAll().length).toEqual(1);
    service.removeElement(15);
    expect(service['elements'].getAll().length).toEqual(1);
  });

  it('#removeLastElement should return undefined, stack is empty', () => {
    expect(service.removeLastElement()).toEqual(undefined);
  });

  it('#removeLastElement should last inserted element', () => {
    mockedSVGElementInfo.id = 11;
    service['nextId'] = 4;
    service['elements'].pushBack(mockedSVGElementInfo);
    expect(service.removeLastElement()).toEqual(mockedSVGElementInfo);
    expect(service['nextId']).toEqual(3);
  });

  it('#removeElements shouldn\'t remove, stack is empty', () => {
    expect(service.removeElements(0).getAll().length).toEqual(0);
  });

  it('#removeElements should remove all elements from 0', () => {
    mockedSVGElementInfo.id = 1;
    service['elements'].pushBack(mockedSVGElementInfo);
    mockedSVGElementInfo.id = 2;
    service['elements'].pushBack(mockedSVGElementInfo);
    mockedSVGElementInfo.id = 3;
    service['elements'].pushBack(mockedSVGElementInfo);
    expect(service.removeElements(0).getAll().length).toEqual(3);
    expect(service['elements'].getAll().length).toEqual(0);
  });

  it('#removeElements should remove elements from 1', () => {
    mockedSVGElementInfo.id = 0;
    service['elements'].pushBack(mockedSVGElementInfo);
    const mockedSVGElementInfo1 = { target: { } as SVGGElement, id: 1 };
    const mockedSVGElementInfo2 = { target: { } as SVGGElement, id: 2 };
    service['elements'].pushBack(mockedSVGElementInfo1);
    service['elements'].pushBack(mockedSVGElementInfo2);

    expect(service.removeElements(1).getAll().length).toEqual(2);
    expect(service['elements'].getAll().length).toEqual(1);
  });

  it('#addSVGWithNewElement should add svg and reset redo stack', () => {
    expect(service.addedSVG.value).toEqual(undefined);
    expect(service.reset.value).toEqual(false);
    service.addSVGWithNewElement(mockedSVGElementInfo.target as SVGElement);
    expect(service.addedSVG.value).not.toEqual(undefined);
    expect(service.addedSVG.value).not.toEqual(undefined);
    expect(service.reset.value).toEqual(true);
    if (service.addedSVG.value !== undefined) {
      expect(service.addedSVG.value.getBoundingClientRect()).toEqual(new DOMRect(100, 100, 50, 50));
    }
  });

  it('#isEmpty should get empty array', () => {
    expect(service.isEmpty()).toEqual(true);
  });

  it('#isEmpty should get false array is not empty', () => {
    service['elements'].pushBack(mockedSVGElementInfo);
    expect(service.isEmpty()).toEqual(false);
  });

  it('#size should get current size of array', () => {
    expect(service.size()).toEqual(0);
    service['elements'].pushBack(mockedSVGElementInfo);
    expect(service.size()).toEqual(1);
  });

  it('#getRoot should get first as undefined, stack is empty', () => {
    expect(service.getRoot()).toEqual(undefined);
  });

  it('#getRoot should get first element', () => {
    mockedSVGElementInfo.id = 99;
    service['elements'].pushBack(mockedSVGElementInfo);
    const popedRoot = service.getRoot();
    if (popedRoot !== undefined) {
      expect(popedRoot.id).toEqual(99);
    } else {
      expect(false).toBeTruthy();
    }
  });
});
