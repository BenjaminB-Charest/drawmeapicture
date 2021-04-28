import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { Color } from 'src/app/classes/color';
import * as CONSTANT from 'src/app/classes/constants';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { Stroke } from 'src/app/classes/stroke';
import { Vec2 } from 'src/app/classes/vec2';
import { StrokeType } from 'src/app/enums/stroke-type.enum';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { DrawStackService } from 'src/app/services/draw-stack/draw-stack.service';
import { GameEngineService } from '../../game-engine/game-engine.service';
import { FirebaseApiService } from '../../server/firebase-api.service';
import { DrawableService } from '../drawable.service';
import { DrawablePropertiesService } from '../properties/drawable-properties.service';

@Injectable({
    providedIn: 'root',
})
// tslint:disable: deprecation
export class PencilService extends DrawableService {
    private path: string;
    private previousX: number;
    private previousY: number;
    thickness: number;
    isDrawing: boolean;
    protected line: SVGPathElement;
    protected mousePointer?: SVGCircleElement;
    color: Color;
    opacity: number;
    attributes: DrawablePropertiesService;
    colorSelectorService: ColorSelectorService;
    private pointPath: Vec2[];
    isReplaying: boolean;
    isPlayerDrawing: boolean;
    activeStroke: Stroke;
    pushValue: number;
    gameMode: string;
    instructions: Stroke[];

    constructor(private firebaseAPI: FirebaseApiService,
                private gameEngine: GameEngineService) {
        super();
        this.englishName = 'Pencil';
        this.isDrawing = false;
        this.path = '';
        this.thickness = CONSTANT.THICKNESS_DEFAULT;
        this.pointPath = [];
        this.activeStroke = {} as Stroke;
        this.instructions = [];
        this.isReplaying = false;
        this.gameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';
        if (this.gameMode === 'classic') {
            this.gameEngine.$isDrawing.subscribe((playerIsDrawing: boolean) => {
                this.isPlayerDrawing = playerIsDrawing;
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
        this.initializeProperties();
    }

    initializeProperties(): void {
        this.colorSelectorService.primaryColor.subscribe((color: Color) => {
            this.color = color;
        });

        this.colorSelectorService.primaryTransparency.subscribe((opacity: number) => {
            this.opacity = opacity;
        });

        this.attributes.thickness.subscribe((element: number) => {
            this.thickness = element;
        });
    }

    onMouseInCanvas(event: MouseEvent): void {
        this.createCircle(CoordinatesXY.effectiveX(this.image, event.clientX), CoordinatesXY.effectiveY(this.image, event.clientY));
    }

    onMouseOutCanvas(event: MouseEvent): void {
        if (this.isDrawing) {
            this.addPath(event.clientX, event.clientY);
            this.isDrawing = false;
            this.pushElement();
            if (this.isPlayerDrawing) {
                this.sendStroke(StrokeType.Done);
                this.pointPath = [];
            }
        }
        if (this.mousePointer !== undefined) {
            this.manipulator.removeChild(this.image.nativeElement, this.mousePointer);
            delete (this.mousePointer);
        }
    }

    onMousePress(event: MouseEvent): void {
        if (this.mousePointer !== undefined) {
            this.manipulator.removeChild(this.image.nativeElement, this.mousePointer);
            delete (this.mousePointer);
        }
        this.isDrawing = true;
        this.beginDraw(event.clientX, event.clientY);
        this.subElement = this.manipulator.createElement(SVGProperties.g, SVGProperties.nameSpace);
        this.line = this.manipulator.createElement(SVGProperties.path, SVGProperties.nameSpace);
        this.manipulator.setAttribute(this.subElement, SVGProperties.title, 'pencil-path');
        this.manipulator.setAttribute(this.line, SVGProperties.fill, 'none');
        this.manipulator.setAttribute(this.line, SVGProperties.color, this.color.getHex());
        this.manipulator.setAttribute(this.line, SVGProperties.globalOpacity, this.opacity.toString());
        this.manipulator.setAttribute(this.line, SVGProperties.typeOfLine, 'round');
        this.manipulator.setAttribute(this.line, SVGProperties.endOfLine, 'round');
        this.manipulator.setAttribute(this.line, SVGProperties.d, this.path);
        this.manipulator.setAttribute(this.line, SVGProperties.thickness, this.thickness.toString());

        this.manipulator.appendChild(this.subElement, this.line);
        this.manipulator.appendChild(this.image.nativeElement, this.subElement);

        this.addPath(event.clientX, event.clientY);

        this.pointPath.push({
            x: event.clientX - CONSTANT.OFFSET_DRAWING_SIDEBAR_X,
            y: event.clientY - CONSTANT.OFFSET_DRAWING_TOPBAR_Y
        } as Vec2);
  }

    onMouseRelease(event: MouseEvent, type?: StrokeType, id?: number): void {
        if (this.isDrawing) {
            this.addPath(event.clientX, event.clientY);
            this.isDrawing = false;
            this.pointPath.push({
                x: event.clientX - CONSTANT.OFFSET_DRAWING_SIDEBAR_X,
                y: event.clientY - CONSTANT.OFFSET_DRAWING_TOPBAR_Y
            } as Vec2);
            this.updateCursor(event.clientX, event.clientY);
            if (this.isPlayerDrawing) {
                this.pushElement();
                this.sendStroke(StrokeType.Done);
            }
            if (type !== undefined && type === StrokeType.Done) {
                if (!this.isReplaying) {
                    this.pushElement();
                } else {
                    this.pushElementReplay(id as number);
                }
            }
            this.pointPath = [];
        }
  }

    sendStroke(strokeType: StrokeType): void {
        // ACTIVATE THIS TO DRAW IN REAL-TIME
        if (/*this.pushValue % 20 === 0 ||*/  strokeType === StrokeType.Done) {
            const newColor = this.color.getHex().slice(1);
            this.firebaseAPI.activeStroke.id = this.drawStack.getNextID() - 1;
            this.firebaseAPI.activeStroke.color = newColor;
            this.firebaseAPI.activeStroke.size = this.thickness;
            this.firebaseAPI.activeStroke.path = this.pointPath;
            this.firebaseAPI.activeStroke.opacity = this.opacity;
            this.firebaseAPI.activeStroke.type = strokeType;
            this.firebaseAPI.sendStroke();
            this.instructions.push({
                id: this.drawStack.getNextID() - 1,
                color: newColor,
                size: Number(this.thickness),
                path: this.pointPath,
                opacity: Number(this.opacity * 255),
                type: strokeType,
            } as Stroke);
        }
  }

    onMouseMove(event: MouseEvent): void {
        if (this.isDrawing) {
            this.addPath(event.clientX, event.clientY);
            this.pointPath.push({
                x: event.clientX - CONSTANT.OFFSET_DRAWING_SIDEBAR_X,
                y: event.clientY - CONSTANT.OFFSET_DRAWING_TOPBAR_Y
            } as Vec2);
        } else {
            this.updateCursor(event.clientX, event.clientY);
        }
    }

    endTool(): void {
        if (this.isDrawing) {
            (this.subElement as SVGGElement).remove();
            delete this.subElement;
        }
        if (this.mousePointer !== undefined) {
            this.mousePointer.remove();
            delete this.mousePointer;
        }
        this.isDrawing = false;
        this.path = '';
    }

    private beginDraw(clientX: number, clientY: number): void {
        this.previousX = clientX;
        this.previousY = clientY;
        this.path = `M ${CoordinatesXY.effectiveX(this.image, clientX)},${CoordinatesXY.effectiveY(this.image, clientY)}`;
    }

    private addPath(clientX: number, clientY: number): void {
        const pathToAdd = ` l ${clientX - this.previousX},${clientY - this.previousY}`;
        this.previousX = clientX;
        this.previousY = clientY;
        this.path = this.path + pathToAdd;
        this.manipulator.setAttribute(this.line, 'd', this.path);
    }

    private updateCursor(clientX: number, clientY: number): void {
        if (this.mousePointer === undefined) {
            this.createCircle(CoordinatesXY.effectiveX(this.image, clientX), CoordinatesXY.effectiveY(this.image, clientY));
        } else {
            this.manipulator.setAttribute(this.mousePointer, SVGProperties.centerX,
                CoordinatesXY.effectiveX(this.image, clientX).toString());
            this.manipulator.setAttribute(this.mousePointer,
                SVGProperties.centerY, CoordinatesXY.effectiveY(this.image, clientY).toString());
        }
    }

    protected createCircle(x: number, y: number): void {
        this.mousePointer = this.manipulator.createElement(SVGProperties.circle, SVGProperties.nameSpace);
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.fill, this.color.getHex());
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.globalOpacity, this.opacity.toString());
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.radius, (this.thickness / 2).toString());
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.centerX, x.toString());
        this.manipulator.setAttribute(this.mousePointer, SVGProperties.centerY, y.toString());
        this.manipulator.appendChild(this.image.nativeElement, this.mousePointer);
    }
}
