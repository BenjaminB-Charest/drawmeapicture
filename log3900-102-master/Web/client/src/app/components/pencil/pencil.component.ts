import { Component } from '@angular/core';
import * as CONSTANT from 'src/app/classes/constants';
import { Tools } from 'src/app/enums/tools';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { PencilService } from 'src/app/services/drawable/pencil/pencil.service';
import { DrawablePropertiesService } from 'src/app/services/drawable/properties/drawable-properties.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';

@Component({
  selector: 'app-pencil',
  templateUrl: './pencil.component.html',
  styleUrls: ['./pencil.component.scss']
})
export class PencilComponent {

  readonly name: string = Tools.Pencil;
  readonly SLIDER_MINIMUM: number = CONSTANT.THICKNESS_MINIMUM;
  readonly SLIDER_MAXIMUM: number = CONSTANT.THICKNESS_MAXIMUM;
  protected thickness: number;

  constructor(
    public service: PencilService,
    private toolSelector: ToolSelectorService,
    protected attributes: DrawablePropertiesService,
    protected colorSelectorService: ColorSelectorService
    ) {
      this.service = this.toolSelector.getPencil();
  }

  onThicknessChange(): void {
    if (this.service.thickness < CONSTANT.THICKNESS_MINIMUM) {
      this.attributes.thickness.next(CONSTANT.THICKNESS_MINIMUM);
    } else {
      if (this.service.thickness > CONSTANT.THICKNESS_MAXIMUM) {
        this.attributes.thickness.next(CONSTANT.THICKNESS_MAXIMUM);
      } else {
        this.attributes.thickness.next(this.service.thickness);
      }
    }
  }

}
