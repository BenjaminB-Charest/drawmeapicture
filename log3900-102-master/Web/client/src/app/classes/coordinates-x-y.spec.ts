// tslint:disable: no-string-literal | Reason: used to access private variables
// tslint:disable: no-magic-numbers | Reason : testing arbitrary values
import { ElementRef } from '@angular/core';
import { CoordinatesXY } from './coordinates-x-y';

describe('CoordinatedXY', () => {

  let point: CoordinatesXY;
  const verticalLimit = 1000;

  beforeEach( () => { point = new CoordinatesXY(0, 0); } );

  it('should create an instance', () => {
    expect(new CoordinatesXY(0, 0)).toBeTruthy();
  });

  it('#getCoords should get coordinates', () => {
    expect(CoordinatesXY.getCoords(new MouseEvent('push', {
      clientX: 100,
      clientY: 100
    }))).toEqual(new CoordinatesXY(100, 100));
  });

  it('#getEffectiveCoords should get coordinates', () => {
    expect(CoordinatesXY.getEffectiveCoords({
      nativeElement: {
        getBoundingClientRect: () => ({
          left: 10,
          top: 10
        } as unknown as DOMRect)
      } as unknown as SVGElement
    }, new MouseEvent('click', {
      clientX: 100,
      clientY: 100
    }))).toEqual(new CoordinatesXY(90, 90));
  });

  it('#effectiveX should get effective x', () => {
    expect(
      CoordinatesXY.effectiveX(
        {
          nativeElement: {
            getBoundingClientRect: () => (
              {
                left: 100,
                top: 100
              }
            )
          } as unknown as SVGElement
        } as unknown as ElementRef<SVGElement>,
        1000
      )
    ).toEqual(900);
  });

  it('#effectiveY should get effective y', () => {
    expect(
      CoordinatesXY.effectiveY(
        {
          nativeElement: {
            getBoundingClientRect: () => (
              {
                left: 100,
                top: 100
              }
            )
          } as unknown as SVGElement
        } as unknown as ElementRef<SVGElement>,
        1000
      )
    ).toEqual(900);
  });

  it('#computeCoordinates should reeturn new coordinates', () => {
    const ret = CoordinatesXY.computeCoordinates(new CoordinatesXY(10, 10), 90, 10);
    expect(ret.getX()).toEqual(10);
    expect(ret.getY()).toEqual(20);
  });

  it('#getCoords should get coordinates', () => {
    expect(CoordinatesXY.getCoords(new MouseEvent('push', {
      clientX: 100,
      clientY: 100
    }))).toEqual(new CoordinatesXY(100, 100));
  });

  it('#getX should get coordinates', () => {
    expect(point.getX()).toBe(0);
    expect(point.getY()).toBe(0);
  });

  it('#clone should clone current point', () => {
    const pt = new CoordinatesXY(10, 10);
    const res = pt.clone();
    expect(res.getX()).toEqual(pt.getX());
    expect(res.getY()).toEqual(pt.getY());
  });

  it('#setX should change coordinates', () => {
    point.setX(1);
    point.setY(1);
    expect(point.getX()).toBe(1);
    expect(point.getY()).toBe(1);
  });

  it('#getClosestPoint should get the same point', () => {
    const closest = point.getClosestPoint(100, 100, verticalLimit);
    expect(closest).toEqual(new CoordinatesXY(100, 100));
  });

  it('#getClosestPoint should get on a 45degree angle point', () => {
    const closest = point.getClosestPoint(100, 90, verticalLimit);
    expect(closest).toEqual(new CoordinatesXY(100, 100));
  });

  it('#getClosestPoint should get on a 45degree angle point negativ', () => {
    const closest = point.getClosestPoint(-100, 90, verticalLimit);
    expect(closest).toEqual(new CoordinatesXY(-100, 100));
  });

  it('#getQuadrant should return correct quadrant from the giving origin coordinates', () => {
    expect(point.getQuadrant(new CoordinatesXY(-5, 15))).toBe(1);
    expect(point.getQuadrant(new CoordinatesXY(15, 15))).toBe(2);
    expect(point.getQuadrant(new CoordinatesXY(15, -5))).toBe(3);
    expect(point.getQuadrant(new CoordinatesXY(-5, -5))).toBe(4);
  });

  it('#getClosestPoint should get on a 0degree angle point', () => {
    const closest = point.getClosestPoint(100, 5, verticalLimit);
    expect(closest).toEqual(new CoordinatesXY(100, 0));
  });

  it('#getClosestPoint should get on a 90degree angle point', () => {
    const closest = point.getClosestPoint(5, 100, verticalLimit);
    expect(closest).toEqual(new CoordinatesXY(0, 100));
  });

  it('#getClosestPoint should get on a 90degree angle point in 3rd quadrant', () => {
    const closest = point.getClosestPoint(-100, -100, verticalLimit);
    expect(closest.getX()).toEqual(-100);
    expect(closest.getY()).toEqual(0);
  });

  it('#getClosestPoint should get on a 90degree angle point in 4th quadrant', () => {
    const closest = point.getClosestPoint(100, -100, verticalLimit);
    expect(closest.getX()).toEqual(100);
    expect(closest.getY()).toEqual(0);
  });

  it('#inRadius should be in radius', () => {
    point = new CoordinatesXY(100, 100);
    expect(
      point.inRadius({
        right: 101,
        left: 99,
        top: 99,
        bottom: 101
      } as DOMRect)
    ).toEqual(true);
  });

  it('#inRadius should NOT be in radius', () => {
    point = new CoordinatesXY(100, 100);
    expect(
      point.inRadius({
        right: 99,
        left: 99,
        top: 99,
        bottom: 101
      } as DOMRect)
    ).toEqual(false);
  });

  it('#distanceTo should return distance between 2 ponts', () => {
    const ret = new CoordinatesXY(10, 10).distanceTo(new CoordinatesXY(100, 100));
    expect(ret).toEqual(16200);
  });
});
