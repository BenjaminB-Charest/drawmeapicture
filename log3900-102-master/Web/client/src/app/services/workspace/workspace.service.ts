import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { Color } from '../../classes/color';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  backgroundColor: Color;
  size: BehaviorSubject<CoordinatesXY>;
  constructor() {
    this.backgroundColor = new Color(CONSTANTS.WORKSPACE_BACKGROUND);
    this.size = new BehaviorSubject<CoordinatesXY> (new CoordinatesXY(0, 0));
  }

  checkIfSameBackgroundColor(color: Color): boolean {
    return this.backgroundColor.isSimilarTo(color);
  }
}
