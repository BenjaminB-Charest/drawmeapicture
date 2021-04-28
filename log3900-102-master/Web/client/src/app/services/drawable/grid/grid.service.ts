import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as CONSTANT from 'src/app/classes/constants';
import { ColorSelectorService } from '../../color-selector/color-selector.service';
import { DrawStackService } from '../../draw-stack/draw-stack.service';
import { DrawableService } from '../drawable.service';

@Injectable({
  providedIn: 'root'
})
export class GridService extends DrawableService {

  thickness: BehaviorSubject<number>;
  opacity: BehaviorSubject<number>;
  visible: BehaviorSubject<boolean>;
  englishName: string;

  constructor() {
    super();
    this.visible = new BehaviorSubject<boolean>(false);
    this.thickness = new BehaviorSubject<number>(CONSTANT.GRID_MINIMUM);
    this.opacity = new BehaviorSubject<number>(CONSTANT.OPACITY_DEFAULT);
    this.englishName = 'Grid';
  }

  initialize(manipulator: Renderer2, image: ElementRef<SVGElement>,
             colorSelectorService: ColorSelectorService, drawStack: DrawStackService): void {
    this.assignParams(manipulator, image, colorSelectorService, drawStack);
  }

  toggle(): void {
    this.visible.next(!this.visible.value);
  }

  incrementThickness(): void {
    if (this.thickness.value <= CONSTANT.GRID_MAXIMUM - CONSTANT.THICKNESS_STEP) {
      this.thickness.next(this.thickness.value + CONSTANT.THICKNESS_STEP);
    }
  }

  decrementThickness(): void {
    if (this.thickness.value >= CONSTANT.GRID_MINIMUM + CONSTANT.THICKNESS_STEP) {
      this.thickness.next(this.thickness.value - CONSTANT.THICKNESS_STEP);
    }
  }
}
