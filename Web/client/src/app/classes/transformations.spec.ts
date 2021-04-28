// tslint:disable: no-string-literal | Reason: used to access private variables
/*tslint:disable: no-magic-numbers*/
import { Renderer2, Type } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { SVGProperties } from '../enums/svg-html-properties';
import { Stack } from './stack';
import { Transform } from './transformations';

describe('Transform', () => {

    let manipulator: Renderer2;
    let transform: string | null;
    let stack: Stack<SVGGElement>;

    const mockedSetAttribute = (el: SVGGElement, name: string, value: string, namespace?: string | null | undefined): void => {
        transform = value;
    };

    const mockedBBox = (): DOMRect => {
        return {
            x: 0,
            y: 0,
            width: 4,
            height: 4,
            top: 0,
            left: 0,
            right: 4,
            bottom: 4,
            toJSON: () =>  null
        };
    };

    const resetTransform = () => { transform = null; };

    beforeEach( () => {
        TestBed.configureTestingModule({
            providers: [Renderer2]
        });
        manipulator = getTestBed().get<Renderer2>(Renderer2 as Type<Renderer2>);

        manipulator.setAttribute = jasmine.createSpy().and.callFake(mockedSetAttribute);

        resetTransform();

        const element: SVGGElement = document.createElementNS(SVGProperties.nameSpace, SVGProperties.g);

        stack = new Stack<SVGGElement>();
        stack.pushBack(element);
        Transform.setElements(stack, manipulator);
    });

    it('#setElements should initialize class attributes', () => {
        // setElements is called in beforeEach to be used in all other tests
        // We will reset it only for this test

        // Reset on elements to transform
        stack = new Stack<SVGGElement>();
        Transform.elementsToTransform = [];
        expect(Transform.elementsToTransform.length).toBe(0);

        // Adding new element
        const element: SVGGElement = document.createElementNS(SVGProperties.nameSpace, SVGProperties.g);
        stack.pushBack(element);
        Transform.setElements(stack, manipulator);

        expect(Transform.elementsToTransform.length).toBe(1);
        expect(Transform['manipulator']).toEqual(manipulator);
    });

    it('#setElements should not do anything if given stack of elements is empty', () => {
        stack = new Stack<SVGGElement>();
        Transform.elementsToTransform = [];
        Transform.setElements(stack, manipulator);
        expect(Transform.elementsToTransform.length).toBe(0);
        expect(Transform['manipulator']).toEqual(manipulator);
    });

    it('#translate should add transform attribute to SVGGElement if it does not exist (positive values)', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, 20);
        expect(transform).toBe('translate(10, 20)');
    });

    it('#translate should add transform attribute to SVGGElement if it does not exist (origin)', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(0, 0);
        expect(transform).toBe('translate(0, 0)');
    });

    it('#translate should add transform attribute to SVGGElement if it does not exist (negative values)', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(-10, -20);
        expect(transform).toBe('translate(-10, -20)');
    });

    it('#translate should add transform attribute to SVGGElement if it does not exist (positive and negative values)', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, -20);
        expect(transform).toBe('translate(10, -20)');
    });

    it('#translate should add translate property to transform in front if transform exists but translate does not (positive)', () => {
        transform = 'rotate(-20)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, 20);
        expect(transform).toBe('translate(10, 20) rotate(-20)');
    });

    it('#translate should add translate property to transform in front if transform exists but translate does not (negative)', () => {
        transform = 'rotate(-20)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(-10, -20);
        expect(transform).toBe('translate(-10, -20) rotate(-20)');
    });

    it('#translate should update translate property if transform property and only translate attribute exist (positive)', () => {
        transform = 'translate(5, 15)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, 20);
        expect(transform).toBe('translate(15, 35)');
    });

    it('#translate should update translate property if transform property and translate/rotate attribute exist (positive)', () => {
        transform = 'translate(5, 15) rotate(-20)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, 20);
        expect(transform).toBe('translate(15, 35) rotate(-20)');
    });

    it('#translate should update translate property if transform property and rotate/translate attribute exist (positive)', () => {
        transform = 'rotate(-20) translate(5, 15)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, 20);
        expect(transform).toBe('rotate(-20) translate(15, 35)');
    });

    it('#translate should update translate property if transform property and only translate attribute exist (negative)', () => {
        transform = 'translate(5, 15)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(-10, 20);
        expect(transform).toBe('translate(-5, 35)');
    });

    it('#translate should update translate property if transform property and translate/rotate attribute exist (negative)', () => {
        transform = 'translate(5, 15) rotate(-20)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(-10, 20);
        expect(transform).toBe('translate(-5, 35) rotate(-20)');
    });

    it('#translate should update translate property if transform property and rotate/translate attribute exist (negative)', () => {
        transform = 'rotate(-20) translate(5, 15)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.translate(10, -20);
        expect(transform).toBe('rotate(-20) translate(15, -5)');
    });

    it('#translate should trigger observable on each translate', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        Transform.needsUpdate.next(false);
        Transform.translate(10, 10);
        expect(Transform.needsUpdate.getValue()).toBe(true);
    });

    it('#delete should remove all selected elements', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);

        // tslint:disable-next-line: no-any
        const spy = spyOn<any>(Transform.elementsToTransform[0], 'remove');
        Transform.delete();
        expect(spy).toHaveBeenCalled();
    });

    it('#rotateEach should add transform attribute if it does not exist (positive)', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);
        Transform.elementsToTransform[0].getBBox = jasmine.createSpy().and.callFake(mockedBBox);

        Transform.rotateEach(10);
        expect(transform).toBe('rotate(10, 2, 2)');
    });

    it('#rotateEach should add transform attribute if it does not exist (negative)', () => {
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);
        Transform.elementsToTransform[0].getBBox = jasmine.createSpy().and.callFake(mockedBBox);

        Transform.rotateEach(-10);
        expect(transform).toBe('rotate(-10, 2, 2)');
    });

    it('#rotateEach should add rotate property to transform if transform exists but rotate does not (positive)', () => {
        transform = 'translate(10, 10)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);
        Transform.elementsToTransform[0].getBBox = jasmine.createSpy().and.callFake(mockedBBox);

        Transform.rotateEach(12);
        expect(transform).toBe('translate(10, 10) rotate(12, 2, 2)');
    });

    it('#rotateEach should add rotate property to transform if transform exists but rotate does not (negative)', () => {
        transform = 'translate(10, 10)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);
        Transform.elementsToTransform[0].getBBox = jasmine.createSpy().and.callFake(mockedBBox);

        Transform.rotateEach(-12);
        expect(transform).toBe('translate(10, 10) rotate(-12, 2, 2)');
    });

    it('#rotateEach should add new rotation to rotate property if transform and rotate exist and is positive', () => {
        transform = 'translate(10, 10) rotate(22, 2, 2)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);
        Transform.elementsToTransform[0].getBBox = jasmine.createSpy().and.callFake(mockedBBox);

        Transform.rotateEach(20);
        expect(transform).toBe('translate(10, 10) rotate(42, 2, 2)');
    });

    it('#rotateEach should substract new rotation to rotate property if transform and rotate exist and is negative', () => {
        transform = 'translate(10, 10) rotate(4, 2, 2)';
        Transform.elementsToTransform[0].getAttribute = jasmine.createSpy().and.returnValue(transform);
        Transform.elementsToTransform[0].getBBox = jasmine.createSpy().and.callFake(mockedBBox);

        Transform.rotateEach(-10);
        expect(transform).toBe('translate(10, 10) rotate(-6, 2, 2)');
    });

    it('#rotate should execute a translate followed by a rotate on the element', () => {
        const secondElement: SVGGElement = document.createElementNS(SVGProperties.nameSpace, SVGProperties.g);
        stack.pushBack(secondElement);
        Transform.setElements(stack, manipulator);

        // tslint:disable-next-line: no-any
        const translateSpy = spyOn<any>(Transform, 'translateSingleElement').and.callThrough();
        // tslint:disable-next-line: no-any
        const rotateSpy = spyOn<any>(Transform, 'rotateEach').and.callThrough();

        Transform.rotate(10);
        expect(translateSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
    });

});
