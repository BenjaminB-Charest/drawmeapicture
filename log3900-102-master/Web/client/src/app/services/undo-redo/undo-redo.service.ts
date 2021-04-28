import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OPACITY_CONSTANT } from 'src/app/classes/constants';
import { Stack } from 'src/app/classes/stack';
import { StrokeType } from 'src/app/enums/stroke-type.enum';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { DrawStackService } from '../draw-stack/draw-stack.service';
import { GameEngineService } from '../game-engine/game-engine.service';
import { FirebaseApiService } from '../server/firebase-api.service';
// tslint:disable: deprecation

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {

  private removed: Stack<SVGElement>;
  private elements: Stack<SVGElement>;
  private currentSVG: SVGElement;
  changed: BehaviorSubject<boolean>;
  undoElements: BehaviorSubject<number>;
  redoElements: BehaviorSubject<number>;

  constructor(
    private drawStack: DrawStackService,
    private manipulator: Renderer2,
    private image: ElementRef<SVGElement>,
    private firebaseAPI: FirebaseApiService,
    private gameEngineService: GameEngineService) {
      this.changed = new BehaviorSubject<boolean>(false);
      this.removed = new Stack<SVGElement>();
      this.elements = new Stack<SVGElement>();
      this.undoElements = new BehaviorSubject<number>(0);
      this.redoElements = new BehaviorSubject<number>(0);
      this.setCurrent(this.image.nativeElement.cloneNode(true) as SVGElement);
      this.drawStack.addedSVG.subscribe(
        () => {
          const svg = this.drawStack.addedSVG.value;
          if (svg !== undefined) {
            this.setCurrent(svg);
            this.drawStack.addedSVG.next(undefined);
          }
        }
      );
      this.drawStack.addedToRedo.subscribe(
        () => {
          const svg = this.drawStack.addedToRedo.value;
          if (svg !== undefined) {
            this.removed.pushBack(this.currentSVG);
            this.redoElements.next(this.redoElements.value + 1);
            this.currentSVG = svg;
            this.drawStack.addedToRedo.next(undefined);
          }
        }
      );
      this.drawStack.reset.subscribe(
        () => {
          if (this.drawStack.reset.value) {
            this.removed.clear();
            this.drawStack.reset.next(false);
          }
        }
      );
      this.drawStack.newSVG.subscribe(
        () => {
          if (this.drawStack.newSVG.value) {
            this.clear();
            this.drawStack.newSVG.next(false);
          }
        }
      );
  }

  resetStack(): void {
      this.changed.next(false);
      this.removed = new Stack<SVGElement>();
      this.elements = new Stack<SVGElement>();
      this.undoElements = new BehaviorSubject<number>(0);
      this.redoElements = new BehaviorSubject<number>(0);
  }

  undo(): void {
    const toUndo = this.elements.popBack();
    if (toUndo !== undefined) {
      this.undoElements.next(this.undoElements.value - 1);
      if (this.currentSVG.childElementCount > 1) {
        this.removed.pushBack(this.currentSVG);
        this.redoElements.next(this.redoElements.value + 1);
      }
      this.currentSVG = toUndo;
      if (this.gameEngineService.$isDrawing.getValue()) {
        this.firebaseAPI.activeStroke.color = '000000';
        this.firebaseAPI.activeStroke.size = 1;
        this.firebaseAPI.activeStroke.opacity = OPACITY_CONSTANT;
        this.firebaseAPI.activeStroke.type = StrokeType.SnapshotUpdate;
        this.firebaseAPI.sendStroke();
        this.firebaseAPI.activeStroke.id = this.elements.size();
        this.firebaseAPI.activeStroke.type = StrokeType.Undo;
        this.firebaseAPI.sendStroke();
      }
      if (this.isEmpty()) {
        this.addElement(toUndo);
      }
      this.replace(toUndo);
      this.changed.next(true);
    }
  }

  redo(): void {
    const toRedo = this.removed.popBack();
    if (toRedo !== undefined) {
      this.redoElements.next(this.redoElements.value - 1);
      this.setCurrent(toRedo);
      if (this.gameEngineService.$isDrawing.getValue()) {
        this.firebaseAPI.activeStroke.color = '000000';
        this.firebaseAPI.activeStroke.size = 1;
        this.firebaseAPI.activeStroke.opacity = OPACITY_CONSTANT;
        this.firebaseAPI.activeStroke.type = StrokeType.SnapshotUpdate;
        this.firebaseAPI.sendStroke();
        this.firebaseAPI.activeStroke.id = this.elements.size();
        this.firebaseAPI.activeStroke.type = StrokeType.Redo;
        this.firebaseAPI.sendStroke();
      }
      this.replace(toRedo);
      this.changed.next(true);
    }
  }

  clear(): void {
    this.setCurrent(this.image.nativeElement.cloneNode(true) as SVGElement);
    this.elements.clear();
    this.removed.clear();
  }

  private replace(by: SVGElement): void {
    const children = this.image.nativeElement.childNodes;
    children.forEach(
      (child) => {
        this.drawStack.removeElement( Number((child as SVGGElement).getAttribute(SVGProperties.title)) );
        this.manipulator.removeChild(this.image, child as SVGGElement);
      }
    );
    const newChildren = Array.from(by.childNodes);
    for (const child of newChildren) {
      this.drawStack.addElementWithInfos( {
        target: (child as SVGGElement),
        id: Number((child as SVGGElement).getAttribute(SVGProperties.title))
      });
      this.manipulator.appendChild(this.image.nativeElement, child.cloneNode(true) as SVGGElement);
    }
  }

  setCurrent(current: SVGElement): void {
    if (this.currentSVG !== undefined) {
      this.elements.pushBack(this.currentSVG);
      this.undoElements.next(this.undoElements.value + 1);
      if (current.childElementCount === 1) {
        this.undoElements.next(this.elements.getAll().length);
      }
    }
    this.currentSVG = current;
  }

  private addElement(toAdd: SVGElement): void {
    this.elements.pushBack(toAdd);
    this.undoElements.next(1);
  }

  private isEmpty(): boolean {
    return this.elements.getAll().length === 0;
  }
}
