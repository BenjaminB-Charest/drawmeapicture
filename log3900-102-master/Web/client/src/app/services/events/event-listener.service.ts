import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { DrawableService } from '../drawable/drawable.service';
import { ToolSelectorService } from '../tools-selector/tool-selector.service';

@Injectable({
  providedIn: 'root',
})
export class EventListenerService {

  currentTool: DrawableService | undefined;
  currentToolName: string;
  private isMouseIn: boolean;

  constructor(
    private image: ElementRef<SVGElement>,
    private toolSelector: ToolSelectorService,
    private manipulator: Renderer2,
  ) {
    this.toolSelector.$currentTool.subscribe((tool) => {
      this.currentToolName = tool;
      this.currentTool = this.toolSelector.getCurrentTool();
      this.isMouseIn = false;
    });
  }

  initializeEvents(): void {
    this.manipulator.listen(this.image.nativeElement, 'mousemove', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onMouseMove(event);
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'mouseenter', (event: MouseEvent) => {
      if (this.currentTool !== undefined && !this.isMouseIn) {
        this.currentTool.onMouseInCanvas(event);
        this.isMouseIn = true;
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'mouseleave', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onMouseOutCanvas(event);
        this.isMouseIn = false;

      }
    });

    this.manipulator.listen(this.image.nativeElement, 'dblclick', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onDoubleClick(event);
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'click', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onClick(event);
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'contextmenu', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onClick(event);
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'mousedown', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onMousePress(event);
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'mouseup', (event: MouseEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onMouseRelease(event);
      }
    });

    this.manipulator.listen(window, 'keydown', (event: KeyboardEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onKeyPressed(event);
      }
    });

    this.manipulator.listen(window, 'keyup', (event: KeyboardEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onKeyReleased(event);
      }
    });

    this.manipulator.listen(this.image.nativeElement, 'mousewheel', (event: WheelEvent) => {
      if (this.currentTool !== undefined) {
        this.currentTool.onMouseWheel(event);
      }
    });
  }
}
