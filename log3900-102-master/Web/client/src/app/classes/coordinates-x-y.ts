// tslint:disable: no-magic-numbers | Reason : quadrant and angle manipulations
import { ElementRef } from '@angular/core';

export class CoordinatesXY {

  constructor(x: number, y: number) {
    this.setX(x);
    this.setY(y);
  }
  private x: number;
  private y: number;

  static getCoords(pointer: MouseEvent): CoordinatesXY {
    return new CoordinatesXY(pointer.clientX, pointer.clientY);
  }

  static getEffectiveCoords(referenceElement: ElementRef<SVGElement>, pointer: MouseEvent): CoordinatesXY {
    const effectiveX = CoordinatesXY.effectiveX(referenceElement, pointer.clientX);
    const effectiveY = CoordinatesXY.effectiveY(referenceElement, pointer.clientY);
    return new CoordinatesXY(effectiveX, effectiveY);
  }

  static effectiveX(referenceElement: ElementRef<SVGElement>, onScreenX: number): number {
    return onScreenX - referenceElement.nativeElement.getBoundingClientRect().left;
  }

  static effectiveY(referenceElement: ElementRef<SVGElement>, onScreenY: number): number {
    return onScreenY - referenceElement.nativeElement.getBoundingClientRect().top;
  }

  static computeCoordinates(origin: CoordinatesXY, angle: number, distance: number): CoordinatesXY {
    const radian = CoordinatesXY.toRadian(angle);
    return new CoordinatesXY(
      origin.getX() + distance * Math.cos(radian),
      origin.getY() + distance * Math.sin(radian)
    );
  }

  static toRadian(degree: number): number {
    return degree * (Math.PI / 180);
  }

  private static findQuadrantFromDelta(distanceX: number, distanceY: number): 1 | 2 | 3 | 4 {
    if (distanceX >= 0 && distanceY >= 0) {
      return 1;
    }
    if (distanceX < 0 && distanceY > 0) {
      return 2;
    }
    if (distanceX < 0 && distanceY <= 0) {
      return 3;
    }
    return 4;
  }

  getX(): number  { return this.x; }
  getY(): number  { return this.y; }

  clone(): CoordinatesXY {
    return new CoordinatesXY(this.x, this.y);
  }

  setX(x: number): void {
    this.x = x;
  }

  setY(y: number): void {
    this.y = y;
  }

  getClosestPoint(pointerX: number, pointerY: number, verticalLimit: number): CoordinatesXY {
    const distanceX = pointerX - this.x;
    const distanceY = pointerY - this.y;
    const foundQuadrant = CoordinatesXY.findQuadrantFromDelta(distanceX, distanceY);
    const angle = (Math.atan(distanceY / distanceX) * 180) / Math.PI;

    if (foundQuadrant === 1  || foundQuadrant === 3) {
      return this.getShiftedPoint(angle, pointerX, pointerY, this.y + this.findYDifferenceForBisectrix(pointerX), verticalLimit);
    } else {
      return this.getShiftedPoint(-angle, pointerX, pointerY, this.y - this.findYDifferenceForBisectrix(pointerX), verticalLimit);
    }
  }

  private getShiftedPoint(angle: number, pointerX: number, pointerY: number, bisectrixY: number, verticalLimit: number): CoordinatesXY {
    if (angle < 45 / 2 || this.isOutOfBounds(bisectrixY, verticalLimit)) {
      return new CoordinatesXY(pointerX, this.y);
    } else {
      if (angle <  3 * (90 / 4)) {
        return new CoordinatesXY(pointerX, bisectrixY);
      }
      return new CoordinatesXY(this.x, pointerY);
    }
  }

  private isOutOfBounds(value: number, verticalLimit: number): boolean {
    return (value <= 0 || value >= verticalLimit);
  }

  private findYDifferenceForBisectrix(pointerX: number): number {
    return pointerX - this.x;
  }

  getQuadrant(origin: CoordinatesXY): 1 | 2 | 3 | 4 {
    const isTop = this.y < origin.y;
    const isLeft = this.x < origin.x;

    return isTop ? (isLeft ? 2 : 1) : (isLeft ? 3 : 4);
  }

  inRadius(element: DOMRect | ClientRect): boolean {
    return (
     element.right > this.x &&
     element.left < this.x &&
     element.top < this.y &&
     element.bottom > this.y
    );
  }

  distanceTo(point: CoordinatesXY): number {
    return Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2);
  }
}
