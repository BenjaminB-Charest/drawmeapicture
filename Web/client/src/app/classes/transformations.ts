import { Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SVGProperties } from '../enums/svg-html-properties';
import { TransformType } from '../enums/transform-type';
import { Stack } from './stack';

export class Transform {
  static needsUpdate: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  static needsButtonDisable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  static elementsToTransform: SVGGElement[] = [];
  private static manipulator: Renderer2;

  private static centerX: number;
  private static centerY: number;

  static setElements(elements: Stack<SVGGElement>, manipulator: Renderer2): void {
    Transform.elementsToTransform = elements.getAll();
    Transform.manipulator = manipulator;

    if (Transform.elementsToTransform.length > 0) {
      let top: number = Transform.elementsToTransform[0].getBoundingClientRect().top;
      let left: number = Transform.elementsToTransform[0].getBoundingClientRect().left;
      let bot: number = Transform.elementsToTransform[0].getBoundingClientRect().bottom;
      let right: number = Transform.elementsToTransform[0].getBoundingClientRect().right;
      for (let i = 1; i < Transform.elementsToTransform.length; i++) {
        top = Math.min(top, Transform.elementsToTransform[i].getBoundingClientRect().top);
        left = Math.min(left, Transform.elementsToTransform[i].getBoundingClientRect().left);
        bot = Math.max(bot, Transform.elementsToTransform[i].getBoundingClientRect().bottom);
        right = Math.max(right, Transform.elementsToTransform[i].getBoundingClientRect().right);
      }
      Transform.centerX = (left + right) / 2;
      Transform.centerY = (top + bot) / 2;
    }
  }

  static translate(translationX: number, translationY: number): void {
    for (const element of Transform.elementsToTransform) {
      Transform.translateSingleElement(translationX, translationY, element);
    }
    Transform.needsUpdate.next(true);
  }

  static translateSingleElement(translationX: number, translationY: number, element: SVGGElement): void {
      const initialElementTransform = element.getAttribute(SVGProperties.transform);
      if (initialElementTransform === null) {
        const newTransform = `${TransformType.translation}(${translationX}, ${translationY})`;
        Transform.manipulator.setAttribute(element, SVGProperties.transform, newTransform);
      } else {
        const indexOfOldTranslate = initialElementTransform.indexOf('translate(');
        /*tslint:disable-next-line: no-magic-numbers*/
        if (indexOfOldTranslate === -1) {
          const newTransform = `${TransformType.translation}(${translationX}, ${translationY}) ${initialElementTransform}`;
          Transform.manipulator.setAttribute(element, SVGProperties.transform, newTransform);
        } else {
          const indexOfOldX = initialElementTransform.indexOf('(', indexOfOldTranslate) + 1;
          const indexOfOldY = initialElementTransform.indexOf(')', indexOfOldTranslate);
          const oldTranslate = initialElementTransform.substring(indexOfOldX, indexOfOldY);
          const oldTranslationX = oldTranslate.split(',')[0];
          const oldTranslationY = oldTranslate.split(',')[1];
          const textBeforeParenthesis = initialElementTransform.substring(0, indexOfOldX);
          const textAfterParenthesis = initialElementTransform.substring(indexOfOldY);
          const newCoordinates = `${+oldTranslationX + translationX}, ${+oldTranslationY + translationY}`;
          const newTransform = textBeforeParenthesis + newCoordinates + textAfterParenthesis;
          Transform.manipulator.setAttribute(element, SVGProperties.transform, newTransform);
        }
      }
  }

  static rotateEach(rotation: number): void {
    for (const element of Transform.elementsToTransform) {
      const initialElementTransform = element.getAttribute(SVGProperties.transform);
      const bBox = element.getBBox();
      if (initialElementTransform === null) {
        const newTransform = `${TransformType.rotation}(${rotation}, ${bBox.x + bBox.width / 2}, ${bBox.y + bBox.height / 2})`;
        Transform.manipulator.setAttribute(element, SVGProperties.transform, newTransform);
      } else {
        const indexOfOldTranslate = initialElementTransform.indexOf('rotate(');
        /*tslint:disable-next-line: no-magic-numbers*/
        if (indexOfOldTranslate === -1) {
          const newTransform = `${initialElementTransform} ` +
          `${TransformType.rotation}(${rotation}, ${bBox.x + bBox.width / 2}, ${bBox.y + bBox.height / 2})`;
          Transform.manipulator.setAttribute(element, SVGProperties.transform, newTransform);
        } else {
          const indexOfOldX = initialElementTransform.indexOf('(', indexOfOldTranslate) + 1;
          const indexOfOldY = initialElementTransform.indexOf(',', indexOfOldTranslate);
          const oldRotate = initialElementTransform.substring(indexOfOldX, indexOfOldY);
          const textBeforeParenthesis = initialElementTransform.substring(0, indexOfOldX);
          const textAfterParenthesis = initialElementTransform.substring(indexOfOldY);
          const newRotate = `${+oldRotate + rotation}`;
          const newTransform = textBeforeParenthesis + newRotate + textAfterParenthesis;
          Transform.manipulator.setAttribute(element, SVGProperties.transform, newTransform);
        }
      }
    }
    Transform.needsUpdate.next(true);
  }

  static rotate(rotation: number): void {
    for (const element of Transform.elementsToTransform) {
      const deltaX = (element.getBoundingClientRect().left + element.getBoundingClientRect().right) / 2 - Transform.centerX;
      const deltaY = (element.getBoundingClientRect().top + element.getBoundingClientRect().bottom) / 2 - Transform.centerY;
      const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // tslint:disable-next-line: no-magic-numbers | Reason: 180 degrees = half a circle
      const angle = Math.atan2(deltaY, deltaX) + rotation / 180 * Math.PI;
      const translationX = radius * Math.cos(angle) - deltaX;
      const translationY = radius * Math.sin(angle) - deltaY;
      Transform.translateSingleElement(translationX, translationY, element);
    }
    Transform.rotateEach(rotation);
  }

  static delete(): void {
    for (const element of Transform.elementsToTransform) {
      element.remove();
    }
    Transform.needsUpdate.next(true);
    Transform.needsButtonDisable.next(true);
  }
}
