import { ElementRef, Injectable, Renderer2 } from '@angular/core';
import { ColorSelectorService } from '../../color-selector/color-selector.service';
import { DrawStackService } from '../../draw-stack/draw-stack.service';
import { DrawableService } from '../drawable.service';

@Injectable({
    providedIn: 'root',
})
export class NoneeService extends DrawableService {
    initialize(
        manipulator: Renderer2,
        image: ElementRef<SVGElement>,
        colorSelectorService: ColorSelectorService,
        drawStack: DrawStackService,
    ): void {}
    constructor() {
        super();
        this.englishName = 'Done';
    }
}
