import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import * as CONSTANT from 'src/app/classes/constants';
import { Tools } from 'src/app/enums/tools';
import { GridService } from 'src/app/services/drawable/grid/grid.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {

  readonly name: string = Tools.Grid;
  readonly THICKNESS_SLIDER_MINIMUM: number = CONSTANT.GRID_MINIMUM;
  readonly THICKNESS_SLIDER_MAXIMUM: number = CONSTANT.GRID_MAXIMUM;
  readonly OPACITY_SLIDER_MINIMUM: number = CONSTANT.OPACITY_MINIMUM;
  readonly OPACITY_SLIDER_MAXIMUM: number = CONSTANT.OPACITY_MAXIMUM;

  constructor(
    public service: GridService,
    private toolSelector: ToolSelectorService
    ) {
    this.service = this.toolSelector.getGrid();
  }

  setThickness(event: MatSliderChange): void {
    const value = event.value;
    if (value !== null) {
      this.service.thickness.next(value);
    }
  }

  setOpacity(event: MatSliderChange): void {
    const value = event.value;
    if (value !== null) {
      this.service.opacity.next(value);
    }
  }

}
