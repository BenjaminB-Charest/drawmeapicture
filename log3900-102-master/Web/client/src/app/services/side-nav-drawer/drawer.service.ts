import { Injectable } from '@angular/core';
import { Tools } from '../../enums/tools';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  constructor() {
    this.navIsOpened = true;
  }

  navIsOpened: boolean;
  lastTool: Tools;

  updateDrawer(currentTool: Tools): void {
    if (!this.navIsOpened) {
      this.navIsOpened = true;
    } else if (this.lastTool === currentTool) {
      this.navIsOpened = false;
    }
    this.lastTool = currentTool;
  }
}
