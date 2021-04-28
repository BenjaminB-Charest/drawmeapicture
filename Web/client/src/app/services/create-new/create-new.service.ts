import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Color } from 'src/app/classes/color';
import { ColorType } from 'src/app/enums/color-types';
import { CoordinatesXY } from '../../classes/coordinates-x-y';
import { ColorSelectorService } from '../color-selector/color-selector.service';

@Injectable({
    providedIn: 'root',
})
export class CreateNewService {
    white: Color = new Color('#FFFFFF');
    constructor(private colorSelectorService: ColorSelectorService) {}

    canvasSize: BehaviorSubject<CoordinatesXY> = new BehaviorSubject<CoordinatesXY>(new CoordinatesXY(0, 0));

    resetCanvas(): void {
        this.colorSelectorService.colorToChange = ColorType.Background;
        this.colorSelectorService.updateColor(this.white);
        this.canvasSize.next(new CoordinatesXY(1155, 675));
    }
}
