import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Color } from 'src/app/classes/color';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { Stack } from 'src/app/classes/stack';
import { Stroke } from 'src/app/classes/stroke';
import { Vec2 } from 'src/app/classes/vec2';
import { StrokeType } from 'src/app/enums/stroke-type.enum';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { SVGElementInfos } from 'src/app/interfaces/svg-element-infos';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { DrawStackService } from 'src/app/services/draw-stack/draw-stack.service';
import * as CONSTANTS from '../../../classes/constants';
import { GameEngineService } from '../../game-engine/game-engine.service';
import { FirebaseApiService } from '../../server/firebase-api.service';
import { DrawableService } from '../drawable.service';

// tslint:disable: deprecation

@Injectable({
    providedIn: 'root',
})
export class EraserService extends DrawableService {
    thickness: BehaviorSubject<number>;
    private selectedElement: SVGElementInfos;
    private oldBorder: string;
    elements: Stack<SVGElementInfos>;
    leftClick: boolean;
    private mousePointer?: SVGRectElement;
    private brushDelete: Stack<SVGElementInfos>;
    clicked: boolean;
    path: Vec2[];
    gameMode: string;
    isPlayerDrawing: boolean;
    isReplaying: boolean;

    constructor(private gameEngine: GameEngineService, private firebaseAPI: FirebaseApiService) {
        super();
        this.englishName = 'Eraser';
        this.leftClick = false;
        this.thickness = new BehaviorSubject(CONSTANTS.THICKNESS_MINIMUM_ERASER);
        this.clicked = false;
        this.path = [];
        this.gameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';
        if (this.gameMode === 'classic') {
            this.gameEngine.$isDrawing.subscribe((isDrawing: boolean) => {
                this.isPlayerDrawing = isDrawing;
            });
        } else if (this.gameMode === 'wordImagePair') {
            this.isPlayerDrawing = true;
        }
    }

    initialize(manipulator: Renderer2,
               image: ElementRef<SVGElement>,
               colorSelectorService: ColorSelectorService,
               drawStack: DrawStackService): void {
        this.assignParams(manipulator, image, colorSelectorService, drawStack);
        this.updateSVGElements();
        this.initializeProperties();
    }

    initializeProperties(): void {
        this.thickness.subscribe(() => {
            if (this.mousePointer !== undefined) {
                this.mousePointer.remove();
            }
            delete this.mousePointer;
        });
    }

    onMouseMove(event: MouseEvent): void {
        this.updatePreview(new CoordinatesXY(event.clientX, event.clientY));
        if (this.selectedElement !== undefined) {
            const elementBounds = this.selectedElement.target.getBoundingClientRect();
            if (!this.getInBounds(elementBounds as DOMRect, new CoordinatesXY(event.clientX, event.clientY))) {
                this.manipulator.setAttribute(this.selectedElement.target.firstChild, SVGProperties.color, this.oldBorder);
                this.selectedElement = (undefined as unknown) as SVGElementInfos;
            }
        }
    }

    onMouseOutCanvas(): void {
        if (this.mousePointer !== undefined) {
            this.mousePointer.remove();
            delete this.mousePointer;
        }
        this.leftClick = false;
    }

    onMouseInCanvas(event: MouseEvent): void {
        this.updatePreview(new CoordinatesXY(event.clientX, event.clientY));
    }

    onClick(event: MouseEvent): void {
        this.updatePreview(new CoordinatesXY(event.clientX, event.clientY));
        this.clicked = true;
        const target = event.target as SVGGElement;
        if (
            target !== this.image.nativeElement &&
            this.getInBounds(target.getBoundingClientRect() as DOMRect, new CoordinatesXY(event.clientX, event.clientY)) &&
            target.getAttribute(SVGProperties.fill) !== null
        ) {
            if (this.gameEngine.$isDrawing.getValue()) {
                this.path.push({ x: event.clientX, y: event.clientY } as Vec2);
            }
            this.deleteSelectedElement();
        }
    }

    onMousePress(event: MouseEvent): void {
        this.updatePreview(new CoordinatesXY(event.clientX, event.clientY));
        if (event.button === CONSTANTS.LEFT_CLICK) {
            this.clicked = true;
            this.leftClick = true;
            this.brushDelete = new Stack<SVGElementInfos>();
            this.path = [];
        }
    }

    onMouseRelease(event: MouseEvent): void {
        this.updatePreview(new CoordinatesXY(event.clientX, event.clientY));
        if (event.button === CONSTANTS.LEFT_CLICK && this.clicked) {
            this.clicked = false;
            this.leftClick = false;
            if (!this.brushDelete.isEmpty()) {
                (this.mousePointer as SVGRectElement).remove();
                if (this.selectedElement !== undefined) {
                    this.manipulator.setAttribute(this.selectedElement.target.firstChild, SVGProperties.color, this.oldBorder);
                }
                this.drawStack.addSVGWithNewElement(this.image.nativeElement.cloneNode(true) as SVGElement);
                this.manipulator.appendChild(this.image.nativeElement, this.mousePointer);
            }
        }
    }

    endTool(): void {
        this.leftClick = false;
        if (this.mousePointer !== undefined) {
            this.mousePointer.remove();
            delete this.mousePointer;
        }
        if (this.selectedElement !== undefined) {
            this.manipulator.setAttribute(this.selectedElement.target.firstChild, SVGProperties.color, this.oldBorder);
            this.selectedElement = (undefined as unknown) as SVGElementInfos;
        }
        for (const element of this.elements.getAll()) {
            element.target.onmouseover = null;
        }
        delete this.mousePointer;
    }

    onSelect(): void {
        this.updateSVGElements();
        for (const element of this.elements.getAll()) {
            element.target.onmouseover = (elementSVGInfo) => {
                if (elementSVGInfo.target !== null) {
                    this.addingMouseMoveEvent((elementSVGInfo as unknown) as SVGElementInfos);
                }
            };
        }
    }

    selectElement(element: SVGGElement): void {
        const elementOnTop = { target: element, id: Number(element.getAttribute(SVGProperties.title)) };
        if (elementOnTop.target !== undefined) {
            if (this.leftClick) {
                const previous = this.brushDelete.popBack();
                if (previous !== undefined) {
                    previous.deleteWith = elementOnTop.id;
                    this.brushDelete.pushBack(previous);
                }
                this.brushDelete.pushBack(elementOnTop);
                elementOnTop.target.remove();
                this.drawStack.removeElement(elementOnTop.id);
                if (this.isPlayerDrawing) {
                    this.firebaseAPI.activeStroke.color = '000000';
                    this.firebaseAPI.activeStroke.opacity = CONSTANTS.OPACITY_CONSTANT;
                    this.firebaseAPI.activeStroke.size = 1;
                    this.firebaseAPI.activeStroke.id = elementOnTop.id;
                    this.firebaseAPI.activeStroke.type = StrokeType.Erased;
                    this.firebaseAPI.sendStroke();
                }
            } else {
                if (this.selectedElement === undefined) {
                    this.selectedElement = elementOnTop;
                    this.getColor();
                }
                if (this.selectedElement !== elementOnTop) {
                    this.manipulator.setAttribute(this.selectedElement.target.firstChild, SVGProperties.color, this.oldBorder);
                    this.selectedElement = elementOnTop;
                    this.getColor();
                }
                this.setOutline(
                    new Color(this.oldBorder).isSimilarTo(new Color(CONSTANTS.ERASER_OUTLINE))
                        ? CONSTANTS.ERASER_OUTLINE_RED_ELEMENTS
                        : CONSTANTS.ERASER_OUTLINE,
                );
            }
        }
    }

    private deleteSelectedElement(): void {
        if (this.selectedElement !== undefined) {
            this.manipulator.setAttribute(this.selectedElement.target.firstChild as SVGElement, SVGProperties.color, this.oldBorder);
            if (this.gameEngine.$isDrawing.getValue()) {
                this.firebaseAPI.activeStroke.color = '000000';
                this.firebaseAPI.activeStroke.opacity = CONSTANTS.OPACITY_CONSTANT;
                this.firebaseAPI.activeStroke.size = 1;
                this.firebaseAPI.activeStroke.id = this.selectedElement.id;
                this.firebaseAPI.activeStroke.type = StrokeType.Erased;
                this.firebaseAPI.activeStroke.path = this.path;
                this.firebaseAPI.sendStroke();
            }
            this.drawStack.removeElement(this.selectedElement.id);
            this.selectedElement.target.remove();
            (this.mousePointer as SVGRectElement).remove();
            this.drawStack.addSVGWithNewElement(this.image.nativeElement.cloneNode(true) as SVGElement);
            this.manipulator.appendChild(this.image.nativeElement, this.mousePointer);
        }
    }

    addingMouseMoveEvent(element: SVGElementInfos): void {
        this.selectElement((element.target.parentElement as unknown) as SVGGElement);
    }

    private getInBounds(elementBounds: DOMRect, mouse: CoordinatesXY): boolean {
        return (
            elementBounds.left < mouse.getX() + this.thickness.value / 2 &&
            elementBounds.right > mouse.getX() - this.thickness.value / 2 &&
            elementBounds.top < mouse.getY() + this.thickness.value / 2 &&
            elementBounds.bottom > mouse.getY() - this.thickness.value / 2
        );
    }

    private movePreview(mouse: CoordinatesXY): void {
        this.manipulator.setAttribute(
            this.mousePointer,
            SVGProperties.x,
            (CoordinatesXY.effectiveX(this.image, mouse.getX()) - this.thickness.value / 2).toString(),
        );
        this.manipulator.setAttribute(
            this.mousePointer,
            SVGProperties.y,
            (CoordinatesXY.effectiveY(this.image, mouse.getY()) - this.thickness.value / 2).toString(),
        );
    }

    private updatePreview(mouse: CoordinatesXY): void {
        if (this.mousePointer === undefined) {
            this.createPreview(mouse);
        } else {
            this.movePreview(mouse);
        }
    }

    protected createPreview(mouse: CoordinatesXY): void {
        this.mousePointer = this.manipulator.createElement(SVGProperties.rectangle, SVGProperties.nameSpace);
        this.manipulator.setAttribute(this.mousePointer, 'style', 'pointer-events:none;');
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.color, 'black');
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.fill, 'white');
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.thickness, '5');
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.height, this.thickness.value.toString());
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.width, this.thickness.value.toString());
        this.manipulator.appendChild(this.image.nativeElement, this.mousePointer);
        this.movePreview(mouse);
    }

    private setOutline(colorToSet: string): void {
        this.manipulator.setAttribute(this.selectedElement.target.firstChild, SVGProperties.color, colorToSet);
    }

    private getColor(): void {
        const color = (this.selectedElement.target.firstChild as SVGElement).getAttribute(SVGProperties.color);
        if (color !== null) {
            this.oldBorder = color;
        }
    }

    updateSVGElements(): void {
        const inSVG = this.image.nativeElement.querySelectorAll(SVGProperties.g);
        this.elements = new Stack<SVGElementInfos>();
        inSVG.forEach((element) => {
            const id = element.getAttribute(SVGProperties.title);
            if (id !== null) {
                this.elements.pushBack({
                    target: element,
                    id: Number(id),
                });
            }
        });
    }

    serverEraser(newStroke: Stroke): void {
        this.updateSVGElements();
        for (const stroke of this.elements.getAll()) {
            if (stroke.id === newStroke.id) {
                this.onMousePress({ clientX: 0, clientY: 0, button: CONSTANTS.LEFT_CLICK } as MouseEvent);
                this.leftClick = true;
                this.selectElement((stroke.target as unknown) as SVGGElement);
                this.onMouseRelease({ clientX: 0, clientY: 0, button: CONSTANTS.LEFT_CLICK } as MouseEvent);
                (this.mousePointer as SVGRectElement).remove();
                this.endTool();
            }
        }
    }
}
