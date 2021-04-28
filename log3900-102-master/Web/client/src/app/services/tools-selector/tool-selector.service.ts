import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tools } from '../../enums/tools';
import { DrawerService } from '../../services/side-nav-drawer/drawer.service';
import { ColorSelectorService } from '../color-selector/color-selector.service';
import { DrawStackService } from '../draw-stack/draw-stack.service';
import { DrawableService } from '../drawable/drawable.service';
import { EraserService } from '../drawable/eraser/eraser.service';
import { GridService } from '../drawable/grid/grid.service';
import { NoneService } from '../drawable/none/none.service';
import { NoneeService } from '../drawable/none/nonee.service';
import { PencilService } from '../drawable/pencil/pencil.service';
import { GameEngineService } from '../game-engine/game-engine.service';
import { FirebaseApiService } from '../server/firebase-api.service';
import { UndoRedoService } from '../undo-redo/undo-redo.service';
// tslint:disable: deprecation
@Injectable({
    providedIn: 'root',
})
export class ToolSelectorService {
    $currentTool: BehaviorSubject<Tools>;
    memory: UndoRedoService;
    private tools: Map<Tools, DrawableService>;
    private tool: DrawableService | undefined;
    private pencil: PencilService;
    private grid: GridService;
    private eraser: EraserService;
    private none: NoneService;
    private nonee: NoneeService;

    gameMode: string;

    disableUndo: boolean;
    disableRedo: boolean;

    constructor(private drawerService: DrawerService,
                private firebaseAPI: FirebaseApiService,
                private gameEngineService: GameEngineService) {
        this.tools = new Map<Tools, DrawableService>();
        this.pencil = new PencilService(firebaseAPI, gameEngineService);
        this.eraser = new EraserService(gameEngineService, firebaseAPI);
        this.grid = new GridService();
        this.none = new NoneService();
        this.nonee = new NoneeService();

        this.tools.set(Tools.Pencil, this.pencil);
        this.tools.set(Tools.Eraser, this.eraser);
        this.tools.set(Tools.Grid, this.grid);
        this.tools.set(Tools.Info, this.none);
        this.tools.set(Tools.WordImagePair, this.nonee);

        this.$currentTool = new BehaviorSubject<Tools>(Tools.Pencil);
        this.gameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';

        if (this.gameMode === 'wordImagePair') {
            this.setCurrentTool(Tools.WordImagePair);
        } else {
            gameEngineService.$isDrawing.subscribe((isDrawing: boolean) => {
                if (isDrawing) {
                    this.setCurrentTool(Tools.Pencil);
                } else {
                    this.setCurrentTool(Tools.Info);
                }
            });
        }

        this.disableRedo = true;
        this.disableUndo = true;
    }

    initialize(
        manipulator: Renderer2,
        image: ElementRef<SVGElement>,
        colorSelectorService: ColorSelectorService,
        drawStack: DrawStackService,
    ): void {
        this.memory = new UndoRedoService(drawStack, manipulator, image, this.firebaseAPI, this.gameEngineService);
        for (const element of this.tools) {
            element[1].initialize(manipulator, image, colorSelectorService, drawStack);
        }
        this.memory.changed.subscribe(() => {
            if (this.memory.changed.value) {
                this.memory.changed.next(false);
                if (this.tool !== undefined) {
                    this.tool.endTool();
                    this.tool.onSelect();
                }
            }
        });
        this.memory.undoElements.subscribe(() => {
            this.disableUndo = this.memory.undoElements.value <= 1;
        });
        this.memory.redoElements.subscribe(() => {
            this.disableRedo = this.memory.redoElements.value === 0;
        });
    }

    getCurrentTool(): DrawableService | undefined {
        return this.tool;
    }

    getPencil(): PencilService {
        return this.pencil;
    }
    getEraser(): EraserService {
        return this.eraser;
    }
    getGrid(): GridService {
        return this.grid;
    }
    getNone(): NoneService {
        return this.none;
    }
    getNonee(): NoneeService {
        return this.nonee;
    }

    setCurrentTool(tool: Tools): void {
        const foundTool = this.getTool(tool);
        if (foundTool !== undefined) {
            if (this.tool !== undefined) {
                this.tool.endTool();
            }
            this.tool = foundTool;
            this.tool.onSelect();
            this.$currentTool.next(tool);
            this.drawerService.updateDrawer(this.$currentTool.getValue());
        } else if (tool === Tools.None) {
            if (this.tool !== undefined) {
                this.tool.endTool();
            }
            this.$currentTool.next(tool);
            this.drawerService.navIsOpened = true;
        }
    }

    getTool(toFind: Tools): DrawableService | undefined {
        if (this.tools.has(toFind)) {
            return this.tools.get(toFind);
        }
        return undefined;
    }
}
