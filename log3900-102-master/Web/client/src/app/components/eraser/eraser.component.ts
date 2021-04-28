import { Component } from '@angular/core';
import * as CONSTANT from 'src/app/classes/constants';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { EraserService } from 'src/app/services/drawable/eraser/eraser.service';
import { DrawablePropertiesService } from 'src/app/services/drawable/properties/drawable-properties.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';

@Component({
  selector: 'app-eraser',
  templateUrl: './eraser.component.html',
  styleUrls: ['./eraser.component.scss']
})
export class EraserComponent {

  readonly THICKNESS_ERASER_MINIMUM: number = CONSTANT.THICKNESS_MINIMUM_ERASER;
  readonly THICKNESS_ERASER_MAXIMUM: number = CONSTANT.THICKNESS_MAXIMUM;

  constructor(
    public service: EraserService,
    private toolSelector: ToolSelectorService,
    protected attributes: DrawablePropertiesService,
    protected colorSelectorService: ColorSelectorService
  ) {
    this.service = this.toolSelector.getEraser();
  }

  changeThickness(newThickness: number | null): void {
    if (newThickness !== null) {
      this.service.thickness.next(newThickness);
    }
  }
}
