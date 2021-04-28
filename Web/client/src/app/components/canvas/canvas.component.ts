import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { _MatTabGroupBase } from '@angular/material/tabs';
import * as confetti from 'canvas-confetti';
import { Subscription } from 'rxjs';
import { Color } from 'src/app/classes/color';
import { OFFSET_DRAWING_SIDEBAR_X, OFFSET_DRAWING_TOPBAR_Y, ONE_SECOND, OPACITY_CONSTANT } from 'src/app/classes/constants';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { Stroke } from 'src/app/classes/stroke';
import { GameStates } from 'src/app/enums/game-states';
import { PlayerStates } from 'src/app/enums/player-states';
import { StrokeType } from 'src/app/enums/stroke-type.enum';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { CanvasService } from 'src/app/services/canvas/canvas.service';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { CreateNewService } from 'src/app/services/create-new/create-new.service';
import { DrawStackService } from 'src/app/services/draw-stack/draw-stack.service';
import { GridService } from 'src/app/services/drawable/grid/grid.service';
import { EventListenerService } from 'src/app/services/events/event-listener.service';
import { ExportService } from 'src/app/services/export/export.service';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { InstructionsStackService } from 'src/app/services/instructions-stack/instructions-stack.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { VirtualPlayerHandlerService } from 'src/app/services/server/virtual-player-handler.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
import { SVGService } from 'src/app/services/svg/svg.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { WordImagePairService } from 'src/app/services/word-image-pair/word-image-pair.service';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';
import { SaveServerService } from '../../services/save-server/save-server.service';

// tslint:disable: deprecation
@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit, OnDestroy {
    @ViewChild('drawing', { static: true }) image: ElementRef<SVGElement>;
    @ViewChild('grid', { static: true }) grid: ElementRef<SVGElement>;
    @ViewChild('rect', { static: true }) rectangle: ElementRef<SVGRectElement>;
    @ViewChild('canvas', { static: true }) invisibleCanvas: ElementRef<HTMLCanvasElement>;
    filters: string;
    width: number;
    height: number;
    stack: SVGService;
    thickness: number;
    opacity: number;
    gridService: GridService;
    visible: boolean;
    private eventListener: EventListenerService;
    strokeSubscription: Subscription;
    isOnAccelerateSubscription: Subscription;
    gameSubscription: Subscription;
    classicGameSubscription: Subscription;
    soloGameSubscription: Subscription;
    soloSprintGameEnded: Subscription;
    classicGameEnded: Subscription;
    gameMode: string;
    counter: number;
    instructionStack: Stroke[] = [];
    soloTimeout: NodeJS.Timeout;
    classicTimeout: NodeJS.Timeout;
    soloInterval: NodeJS.Timeout;
    classicInterval: NodeJS.Timeout;

    constructor(
        private manipulator: Renderer2,
        private toolSelector: ToolSelectorService,
        private colorSelectorService: ColorSelectorService,
        private createNewService: CreateNewService,
        private drawStack: DrawStackService,
        private canvasService: CanvasService,
        private workspaceService: WorkspaceService,
        private exportService: ExportService,
        private saveService: SaveServerService,
        private firebaseAPI: FirebaseApiService,
        private gameEngine: GameEngineService,
        private soloGameEngine: SoloSprintEngineService,
        private wordImagePairService: WordImagePairService,
        private instructionStackService: InstructionsStackService,
        private virtualPlayerHandler: VirtualPlayerHandlerService,
        private renderer2: Renderer2,
        private elementRef: ElementRef,
    ) {
        this.visible = true;
    }

    async ngOnInit(): Promise<void> {
        setTimeout(() => {
            this.createNewService.resetCanvas();
        }, 100);
        this.filters = this.image.nativeElement.innerHTML;
        if (localStorage.getItem('mode') !== 'classic') {
            this.drawStack.resetStack();
        }
        this.toolSelector.initialize(this.manipulator, this.image, this.colorSelectorService, this.drawStack);
        this.exportService.initialize(this.manipulator, this.image);
        this.eventListener = new EventListenerService(this.image, this.toolSelector, this.manipulator);
        this.eventListener.initializeEvents();
        this.colorSelectorService.primaryColor.next(new Color('#000000'));
        this.gridService = this.toolSelector.getGrid();
        this.saveService.refToSvg = this.image;
        this.gameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';
        if (localStorage.getItem('mode') === 'classic') {
            this.firebaseAPI.getStrokes();
        } else if (localStorage.getItem('mode') === 'wordImagePair') {
            this.toolSelector.getPencil().isPlayerDrawing = true;
        }
        this.colorSelectorService.backgroundColor.subscribe((color: Color) => {
            const isSameColor = this.workspaceService.checkIfSameBackgroundColor(color);
            const border = isSameColor ? '1px dashed black' : 'none';
            this.manipulator.setAttribute(
                this.image.nativeElement,
                'style',
                `background-color: ${color.getHex()};
                border-bottom: ${border};
                border-right: ${border}`,
            );
            this.manipulator.setAttribute(this.grid.nativeElement, SVGProperties.color, color.getInvertedColor(true).getHex());
        });

        this.createNewService.canvasSize.subscribe((canvasSize: CoordinatesXY) => {
            this.manipulator.setAttribute(this.image.nativeElement, SVGProperties.width, `${canvasSize.getX()}`);
            this.manipulator.setAttribute(this.image.nativeElement, SVGProperties.height, `${canvasSize.getY()}`);
            this.manipulator.setAttribute(this.grid.nativeElement, SVGProperties.width, `${canvasSize.getX()}`);
            this.manipulator.setAttribute(this.grid.nativeElement, SVGProperties.height, `${canvasSize.getY()}`);
            this.manipulator.setAttribute(this.rectangle.nativeElement, SVGProperties.width, `${canvasSize.getX()}`);
            this.manipulator.setAttribute(this.rectangle.nativeElement, SVGProperties.height, `${canvasSize.getY()}`);
            this.resetCanvas();
            if (this.toolSelector.memory !== undefined) {
                this.toolSelector.memory.clear();
            }
        });

        this.gridService.thickness.subscribe(value => {
            this.thickness = value;
        });

        this.gridService.opacity.subscribe(value => {
            this.opacity = value;
        });

        this.gridService.visible.subscribe(value => {
            if (value) {
                this.grid.nativeElement.setAttribute(SVGProperties.visibility, 'visible');
            } else {
                this.grid.nativeElement.setAttribute(SVGProperties.visibility, 'hidden');
            }
        });

        this.canvasService.askForLayerCount.subscribe((value: boolean) => {
            if (value) {
                this.canvasService.layerCount = this.image.nativeElement.children.length - 1;
            }
        });

        this.strokeSubscription = this.firebaseAPI.newStroke.subscribe(stroke => {
            if (this.gameMode === 'classic') {
                if (!this.gameEngine.$isDrawing.getValue() && !this.virtualPlayerHandler.drawingVP.getValue()) {
                    this.serverAction(stroke);
                }
            }
        });

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // We verify that our element has been created
                if (this.image.nativeElement.getAttribute(SVGProperties.width) !== '0') {
                    localStorage.setItem('myInnerSvg', this.image.nativeElement.innerHTML);
                    localStorage.setItem('myWidth', this.image.nativeElement.getAttribute(SVGProperties.width) as string);
                    localStorage.setItem('myHeight', this.image.nativeElement.getAttribute(SVGProperties.height) as string);
                    localStorage.setItem('myColor', this.image.nativeElement.style.backgroundColor as string);
                }
            });
        });

        observer.observe(this.image.nativeElement, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        });

        this.isOnAccelerateSubscription = this.wordImagePairService.isOnAccelerateSubject.subscribe(async () => {
            if (!this.wordImagePairService.isOnAccelerateSubject.getValue()) {
                return;
            }
            this.resetCanvas();
            this.counter = 0;
            this.instructionStackService.isReplaying = true;
            this.instructionStack = [];
            this.toolSelector.getPencil().isReplaying = true;
            this.instructionStack = this.instructionStackService.processStack();
            setTimeout(() => {
                this.virtualReplayDrawing(this.instructionStack, this.counter, ONE_SECOND * 5);
            }, 500);
        });

        this.gameSubscription = this.virtualPlayerHandler.drawingVP.subscribe(val => {
            this.gameEngine.stopDrawing.next(false);
            if (val && this.gameEngine.$currentImage.getValue().paths.length > 0 && localStorage.getItem('mode') === 'classic') {
                this.virtualPlayerDrawingClassic(
                    this.gameEngine.$currentImage.getValue().paths,
                    0,
                    ONE_SECOND * 5,
                    this.gameEngine.$game.getValue().currentImageId,
                    this.gameEngine.$currentImage.getValue().difficulty,
                );
            }
        });

        this.soloGameSubscription = this.virtualPlayerHandler.soloDrawingVP.subscribe(val => {
            this.soloGameEngine.stopDrawing.next(false);
            if (
                val &&
                this.soloGameEngine.$currentImage.getValue().paths.length > 0 &&
                localStorage.getItem('mode') === 'solo' &&
                !this.soloGameEngine.gameEnded.getValue()
            ) {
                this.virtualPlayerDrawingSolo(
                    this.soloGameEngine.$currentImage.getValue().paths,
                    0,
                    ONE_SECOND * 5,
                    this.soloGameEngine.$game.getValue().currentImageId,
                    this.soloGameEngine.$currentImage.getValue().difficulty,
                );
            }
        });

        window.addEventListener('beforeunload', () => {
            this.isOnAccelerateSubscription.unsubscribe();
            this.strokeSubscription.unsubscribe();
            this.gameSubscription.unsubscribe();
            this.soloGameSubscription.unsubscribe();
            this.classicGameSubscription.unsubscribe();
            this.firebaseAPI.updateLogoutTime();
            if (localStorage.getItem('mode') === 'classic') {
                this.gameEngine.quitGameCloseWindow();
            } else if (localStorage.getItem('mode') === 'solo') {
                this.soloGameEngine.quitGameCloseWindow();
            }
        });

        this.classicGameSubscription = this.gameEngine.$game.subscribe(game => {
            if (
                game.state === GameStates.RoundStart &&
                game.roles.get(localStorage.getItem('username') as string) === PlayerStates.DrawingPlayer &&
                this.gameEngine.canOpenChoice.getValue()
            ) {
                const dialogConfig = new MatDialogConfig();
                dialogConfig.width = 'auto';
                dialogConfig.height = 'auto';
                dialogConfig.disableClose = true;
                dialogConfig.position = { top: '160px', left: '400px' };
                this.toolSelector.getEraser().clicked = false;
                this.toolSelector.getPencil().endTool();
                this.toolSelector.getEraser().endTool();
            } else if (game.state === GameStates.RoundStart) {
                this.toolSelector.getEraser().clicked = false;
                this.toolSelector.getPencil().endTool();
                this.toolSelector.getEraser().endTool();
            } else if (
                game.state === GameStates.NoneHasGuessed ||
                game.state === GameStates.DrawAndGuessFirstWon ||
                game.state === GameStates.DrawAndGuessSecondWon
            ) {
                this.gameEngine.stopDrawing.next(true);
                setTimeout(() => {
                    clearInterval(this.classicInterval);
                    this.virtualPlayerHandler.drawingVP.next(false);
                    this.gameEngine.stopDrawing.next(false);
                }, 7000);
            } else if (game.state === GameStates.RoundEnd) {
                this.gameEngine.$isDrawing.next(false);
                setTimeout(() => {
                    this.initializeEverything();
                    this.createNewService.resetCanvas();
                }, 4000);
            }
        });

        this.soloSprintGameEnded = this.soloGameEngine.gameEnded.subscribe(val => {
            if (val) {
                this.celebrate();
                setTimeout(() => {
                    clearInterval(this.soloInterval);
                    this.soloGameEngine.resetValuesEndGame();
                    this.virtualPlayerHandler.soloDrawingVP.next(false);
                    this.initializeEverything();
                }, 4000);
            }
        });

        this.classicGameEnded = this.gameEngine.gameEnded.subscribe(val => {
            if (val) {
                this.celebrate();
                setTimeout(() => {
                    this.drawStack.resetStack();
                    this.gameEngine.gameEnded.next(false);
                    this.virtualPlayerHandler.drawingVP.next(false);
                }, 4000);
            }
        });
    }

    initializeEverything(): void {
        this.toolSelector.getPencil().initialize(this.manipulator, this.image, this.colorSelectorService, this.drawStack);
        this.toolSelector.getEraser().initialize(this.manipulator, this.image, this.colorSelectorService, this.drawStack);
    }

    // Used to Replay Word-image pair
    virtualReplayDrawing(instructionStack: Stroke[], counter: number, intervalPresent: number): void {
        const stroke = instructionStack[counter];
        this.toolSelector.getPencil().thickness = stroke.size;
        this.toolSelector.getPencil().color.setHex('#' + stroke.color);
        const numPoints = this.calculateNextInterval(instructionStack);
        this.colorSelectorService.primaryTransparency.next(stroke.opacity / OPACITY_CONSTANT);
        this.drawOnCanvasReplay(stroke, 1).then(() => {
            counter++;
            if (instructionStack.length !== counter) {
                const nextInterval = (stroke.path.length / numPoints) * 10000;
                setTimeout(() => {
                    this.virtualReplayDrawing(instructionStack, counter, nextInterval);
                }, nextInterval);
            } else {
                setTimeout(() => {
                    this.instructionStackService.isReplaying = false;
                    this.instructionStackService.isDoneSubject.next(true);
                    this.wordImagePairService.isOnAccelerateSubject.next(false);
                    this.toolSelector.getPencil().isReplaying = false;
                    this.colorSelectorService.primaryColor.next(new Color('#000000'));
                    this.colorSelectorService.primaryTransparency.next(1);
                }, intervalPresent * 2);
            }
        });
    }

    // Used to Draw for Virtual Player
    virtualPlayerDrawingClassic(strokeStack: Stroke[], counter: number, intervalPresent: number, id: string, difficulty: string): void {
        const maxTime = this.calculateDrawingTime(difficulty);
        clearInterval(this.classicTimeout);
        const stroke = strokeStack[counter];
        const numPoints = this.calculateNextInterval(strokeStack);
        const timePerPoint = stroke.path.length / numPoints;
        this.toolSelector.getPencil().thickness = stroke.size;
        this.toolSelector.getPencil().color.setHex('#' + stroke.color);
        this.colorSelectorService.primaryTransparency.next(stroke.opacity / OPACITY_CONSTANT);
        this.drawOnCanvasVirtualPlayerClassic(stroke, timePerPoint).then(() => {
            counter++;
            if (strokeStack.length !== counter && !this.gameEngine.stopDrawing.getValue()) {
                const nextInterval = (stroke.path.length / numPoints) * maxTime;
                this.classicTimeout = setTimeout(() => {
                    this.virtualPlayerDrawingClassic(strokeStack, counter, nextInterval, id, difficulty);
                }, nextInterval);
            } else {
                setTimeout(() => {
                    this.gameEngine.stopDrawing.next(false);
                }, intervalPresent);
            }
        });
    }

    calculateDrawingTime(difficulty: string): number {
        switch (difficulty) {
            case 'easy':
                return 15000;
            case 'normal':
                return 20000;
            case 'hard':
                return 25000;
            default:
                return 15000;
        }
    }

    // Used to Draw for Virtual Player
    virtualPlayerDrawingSolo(strokeStack: Stroke[], counter: number, intervalPresent: number, id: string, difficulty: string): void {
        clearInterval(this.soloTimeout);
        const stroke = strokeStack[counter];
        const numPoints = this.calculateNextInterval(strokeStack);
        const maxTime = this.calculateDrawingTime(difficulty);
        const timePerPoint = stroke.path.length / numPoints;
        this.toolSelector.getPencil().thickness = stroke.size;
        this.toolSelector.getPencil().color.setHex('#' + stroke.color);
        this.colorSelectorService.primaryTransparency.next(stroke.opacity / OPACITY_CONSTANT);
        this.drawOnCanvasVirtualPlayerSolo(stroke, timePerPoint).then(() => {
            counter++;
            if (strokeStack.length > counter - 1 && !this.soloGameEngine.stopDrawing.getValue() && !this.soloGameEngine.gameEnded.getValue()) {
                const nextInterval = (stroke.path.length / numPoints) * maxTime;
                this.soloTimeout = setTimeout(() => {
                    this.virtualPlayerDrawingSolo(strokeStack, counter, nextInterval, id, difficulty);
                }, nextInterval);
            } else {
                setTimeout(() => {
                    console.log('SET TIEMOUT');
                    this.soloGameEngine.stopDrawing.next(false);
                }, intervalPresent);
            }
        });
    }

    calculateNextInterval(strokeStack: Stroke[]): number {
        let numPoints = 0;
        for (const stroke of strokeStack) {
            numPoints += stroke.path.length;
        }
        return numPoints;
    }

    ngOnDestroy(): void {
        this.isOnAccelerateSubscription.unsubscribe();
        this.strokeSubscription.unsubscribe();
        this.gameSubscription.unsubscribe();
        this.soloGameSubscription.unsubscribe();
        this.classicGameSubscription.unsubscribe();
        if (this.soloSprintGameEnded) {
            this.soloSprintGameEnded.unsubscribe();
        }
        if (this.classicGameEnded) {
            this.classicGameEnded.unsubscribe();
        }
        this.gridService.visible.next(false);
        clearInterval(this.soloInterval);
        clearInterval(this.classicInterval);
    }

    serverAction(stroke: Stroke): void {
        switch (stroke.type) {
            case StrokeType.Done:
            case StrokeType.Added:
                this.drawStroke(stroke);
                break;
            case StrokeType.Erased:
                this.eraseStroke(stroke);
                break;
            case StrokeType.Undo:
                this.toolSelector.memory.undo();
                break;
            case StrokeType.Redo:
                this.toolSelector.memory.redo();
                break;
            default:
                break;
        }
    }

    drawStroke(stroke: Stroke): void {
        this.toolSelector.getPencil().thickness = stroke.size;
        this.toolSelector.getPencil().color.setHex('#' + stroke.color);
        this.colorSelectorService.primaryTransparency.next(stroke.opacity / OPACITY_CONSTANT);
        this.toolSelector.getPencil().onMousePress({
            clientX: stroke.path[0].x + OFFSET_DRAWING_SIDEBAR_X,
            clientY: stroke.path[0].y + OFFSET_DRAWING_TOPBAR_Y,
        } as MouseEvent);
        this.drawOnCanvas(stroke);
    }

    eraseStroke(stroke: Stroke): void {
        this.toolSelector.getEraser().thickness.next(stroke.size);
        this.toolSelector.getEraser().serverEraser(stroke);
        this.toolSelector.getEraser().endTool();
    }

    drawOnCanvas(stroke: Stroke): void {
        for (let i = 1; i < stroke.path.length - 1; i++) {
            this.toolSelector.getPencil().onMouseMove({
                clientX: stroke.path[i].x + OFFSET_DRAWING_SIDEBAR_X,
                clientY: stroke.path[i].y + OFFSET_DRAWING_TOPBAR_Y,
            } as MouseEvent);
        }
        this.toolSelector.getPencil().onMouseRelease(
            {
                clientX: stroke.path[stroke.path.length - 1].x + OFFSET_DRAWING_SIDEBAR_X,
                clientY: stroke.path[stroke.path.length - 1].y + OFFSET_DRAWING_TOPBAR_Y,
            } as MouseEvent,
            stroke.type,
        );
        this.toolSelector.getPencil().endTool();
    }

    // Used for replay
    async drawOnCanvasReplay(stroke: Stroke, baseInterval: number): Promise<void> {
        const timeInterval = baseInterval; // 1ms
        let counter = 1;
        const factor = 2; // We consider every 3 pts
        this.toolSelector.getPencil().onMousePress({
            clientX: stroke.path[0].x + OFFSET_DRAWING_SIDEBAR_X,
            clientY: stroke.path[0].y + OFFSET_DRAWING_TOPBAR_Y,
        } as MouseEvent);
        const intervalStroke = setInterval(async () => {
            this.toolSelector.getPencil().onMouseMove({
                clientX: stroke.path[counter].x + OFFSET_DRAWING_SIDEBAR_X,
                clientY: stroke.path[counter].y + OFFSET_DRAWING_TOPBAR_Y,
            } as MouseEvent);
            counter += factor;
            if (counter > stroke.path.length - 1) {
                this.toolSelector.getPencil().onMouseRelease(
                    {
                        clientX: stroke.path[stroke.path.length - 1].x + OFFSET_DRAWING_SIDEBAR_X,
                        clientY: stroke.path[stroke.path.length - 1].y + OFFSET_DRAWING_TOPBAR_Y,
                    } as MouseEvent,
                    stroke.type,
                    stroke.id, // Important for replay
                );
                clearInterval(intervalStroke);
            }
        }, timeInterval);
    }

    async drawOnCanvasVirtualPlayerClassic(stroke: Stroke, baseInterval: number): Promise<void> {
        const timeInterval = baseInterval;
        let counter = 1;
        const factor = 2; // We consider every 2 pts
        this.toolSelector.getPencil().onMousePress({
            clientX: stroke.path[0].x + OFFSET_DRAWING_SIDEBAR_X,
            clientY: stroke.path[0].y + OFFSET_DRAWING_TOPBAR_Y,
        } as MouseEvent);
        this.classicInterval = setInterval(() => {
            if (this.gameEngine.stopDrawing.getValue()) {
                clearInterval(this.classicInterval);
                this.toolSelector.getPencil().onMouseRelease(
                    {
                        clientX: stroke.path[counter].x + OFFSET_DRAWING_SIDEBAR_X,
                        clientY: stroke.path[counter].y + OFFSET_DRAWING_TOPBAR_Y,
                    } as MouseEvent,
                    stroke.type,
                );
            }
            this.toolSelector.getPencil().onMouseMove({
                clientX: stroke.path[counter].x + OFFSET_DRAWING_SIDEBAR_X,
                clientY: stroke.path[counter].y + OFFSET_DRAWING_TOPBAR_Y,
            } as MouseEvent);
            counter += factor;
            if (counter > stroke.path.length - 1) {
                this.toolSelector.getPencil().onMouseRelease(
                    {
                        clientX: stroke.path[stroke.path.length - 1].x + OFFSET_DRAWING_SIDEBAR_X,
                        clientY: stroke.path[stroke.path.length - 1].y + OFFSET_DRAWING_TOPBAR_Y,
                    } as MouseEvent,
                    stroke.type,
                );
                clearInterval(this.classicInterval);
            }
        }, timeInterval);
    }

    async drawOnCanvasVirtualPlayerSolo(stroke: Stroke, baseInterval: number): Promise<void> {
        const timeInterval = baseInterval;
        let counter = 1;
        const factor = 2;
        if (!this.soloGameEngine.gameEnded.getValue() && !this.soloGameEngine.stopDrawing.getValue()) {
            this.toolSelector.getPencil().onMousePress({
                clientX: stroke.path[0].x + OFFSET_DRAWING_SIDEBAR_X,
                clientY: stroke.path[0].y + OFFSET_DRAWING_TOPBAR_Y,
            } as MouseEvent);
            this.soloInterval = setInterval(() => {
                if (!this.soloGameEngine.gameEnded.getValue()) {
                    if (this.soloGameEngine.stopDrawing.getValue()) {
                        clearInterval(this.soloInterval);
                        this.toolSelector.getPencil().onMouseRelease(
                            {
                                clientX: stroke.path[counter].x + OFFSET_DRAWING_SIDEBAR_X,
                                clientY: stroke.path[counter].y + OFFSET_DRAWING_TOPBAR_Y,
                            } as MouseEvent,
                            stroke.type,
                        );
                        return;
                    }
                    this.toolSelector.getPencil().onMouseMove({
                        clientX: stroke.path[counter].x + OFFSET_DRAWING_SIDEBAR_X,
                        clientY: stroke.path[counter].y + OFFSET_DRAWING_TOPBAR_Y,
                    } as MouseEvent);
                    counter += factor;
                    if (counter > stroke.path.length - 1) {
                        this.toolSelector.getPencil().onMouseRelease(
                            {
                                clientX: stroke.path[stroke.path.length - 1].x + OFFSET_DRAWING_SIDEBAR_X,
                                clientY: stroke.path[stroke.path.length - 1].y + OFFSET_DRAWING_TOPBAR_Y,
                            } as MouseEvent,
                            stroke.type,
                        );
                        clearInterval(this.soloInterval);
                    }
                } else {
                    clearInterval(this.soloInterval);
                }
            }, timeInterval);
        }
    }

    resetCanvas(): void {
        this.image.nativeElement.innerHTML = '';
    }

    celebrate(): void {
        const canvas = this.renderer2.createElement('canvas') as HTMLCanvasElement;
        canvas.width = 1005;
        canvas.height = 675;
        canvas.style.backgroundColor = 'white';
        this.renderer2.appendChild(this.elementRef.nativeElement, canvas); // append the canvas
        const end = Date.now() + 1000 * 30; // set the end time
        const interval = setInterval(() => {
            if (Date.now() > end) {
                // if time reached then clear the interval
                clearInterval(interval);

                return this.renderer2.removeChild(this.elementRef.nativeElement, canvas); // remove the canvas from the DOM
            }
            confetti.create(canvas, { resize: true })({
                // create the confetti
                particleCount: 250,
                startVelocity: 100,
                spread: 100,
                ticks: 1000,
                shapes: ['circle'],
                origin: {
                    x: Math.random() - 0.1,
                    // since they fall down, start a bit higher than random
                    y: Math.random() + 0.5,
                },
            });
        }, 1000);
    }
}
