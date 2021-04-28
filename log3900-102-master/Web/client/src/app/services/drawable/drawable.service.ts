import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { SVGProperties } from 'src/app/enums/svg-html-properties';
import { ColorSelectorService } from '../color-selector/color-selector.service';
import { DrawStackService } from '../draw-stack/draw-stack.service';
import { DrawablePropertiesService } from './properties/drawable-properties.service';

@Injectable({
  providedIn: 'root'
})
export abstract class DrawableService {

  protected manipulator: Renderer2;
  protected image: ElementRef<SVGElement>;
  protected attributes: DrawablePropertiesService;
  protected colorSelectorService: ColorSelectorService;
  drawStack: DrawStackService;
  protected subElement?: SVGGElement;
  englishName: string;

  protected assignParams(
    manipulator: Renderer2,
    image: ElementRef<SVGElement>,
    colorSelectorService: ColorSelectorService,
    drawStack: DrawStackService): void {
    this.manipulator = manipulator;
    this.image = image;
    this.colorSelectorService = colorSelectorService;
    this.drawStack = drawStack;
    this.attributes = new DrawablePropertiesService();
  }

  pushElement(): void {
    const nextID = this.drawStack.getNextID();
    this.drawStack.addElementWithInfos({
      target: this.subElement as SVGGElement,
      id: nextID
    });
    this.manipulator.setAttribute(this.subElement, SVGProperties.title, nextID.toString());
    this.drawStack.addSVGWithNewElement(this.image.nativeElement.cloneNode(true) as SVGElement);
    this.drawStack.isAdding.next(true);
  }

  pushElementReplay(id: number): void {
    const nextID = id;
    this.manipulator.setAttribute(this.subElement, SVGProperties.title, nextID.toString());
    this.drawStack.addSVGWithNewElement(this.image.nativeElement.cloneNode(true) as SVGElement);
    this.drawStack.isAdding.next(true);
  }

  abstract initialize(
    manipulator: Renderer2,
    image: ElementRef<SVGElement>,
    colorSelectorService: ColorSelectorService,
    drawStack: DrawStackService,
  ): void;

  initializeProperties(): void { /*To Override if needed*/ }
  onMouseInCanvas(event: MouseEvent): void { /*To Override if needed*/ }
  onMouseOutCanvas(event: MouseEvent): void { /*To Override if needed*/ }
  onMousePress(event: MouseEvent): void { /*To Override if needed*/ }
  onMouseRelease(event: MouseEvent): void { /*To Override if needed*/ }
  onMouseMove(event: MouseEvent): void { /*To Override if needed*/ }
  onDoubleClick(event: MouseEvent): void { /*To Override if needed*/ }
  onClick(event: MouseEvent): void { /*To Override if needed*/ }
  onKeyPressed(event: KeyboardEvent): void { /*To Override if needed*/ }
  onKeyReleased(event: KeyboardEvent): void { /*To Override if needed*/ }
  endTool(): void { /*To Override if needed*/ }
  onSelect(): void { /*To Override if needed*/ }
  onMouseWheel(event: WheelEvent): void { /*To Override if needed*/ }
}
