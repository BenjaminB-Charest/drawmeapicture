import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Color } from 'src/app/classes/color';
import * as CONSTANTS from 'src/app/classes/constants';
import { ColorPickerComponent } from 'src/app/components/color-picker/color-picker.component';
import { ColorType } from 'src/app/enums/color-types';
import { Tools } from 'src/app/enums/tools';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { ShortcutManagerService } from 'src/app/services/shortcut-manager/shortcut-manager.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';

@Component({
  selector: 'app-color-panel',
  templateUrl: './color-panel.component.html',
  styleUrls: ['./color-panel.component.scss']
})
export class ColorPanelComponent implements OnInit {

  primaryColor: Color;
  quickAccessColors: Color[];
  primaryTransparency: number;

  constructor(
    private colorSelectorService: ColorSelectorService,
    private shortcutManager: ShortcutManagerService,
    private dialog: MatDialog,
    private toolSelector: ToolSelectorService
    ) { }

  ngOnInit(): void {
    this.colorSelectorService.primaryColor.subscribe((color: Color) => {
      this.primaryColor = color;
    });
    this.colorSelectorService.quickAccessColors.subscribe((colors: Color[]) => {
      this.quickAccessColors = colors;
    });
    this.colorSelectorService.primaryTransparency.subscribe((transparency: number) => {
      this.primaryTransparency = transparency;
    });
  }

  onTransparencyChange(isPrimaryTransparency: boolean): void {
    if (isPrimaryTransparency) {
      if (this.primaryTransparency >= CONSTANTS.MIN_TRANSPARENCY &&
        this.primaryTransparency <= CONSTANTS.MAX_TRANSPARENCY) {
          this.colorSelectorService.primaryTransparency.next(this.primaryTransparency);
      }
    }
  }

  onLeftClick(selectedColor: Color): void {
    this.toolSelector.setCurrentTool(Tools.Pencil);
    this.colorSelectorService.colorToChange = ColorType.Primary;
    this.colorSelectorService.primaryColor.next(selectedColor);
  }

  onPrimaryColorChange(): void {
    this.colorSelectorService.colorToChange = ColorType.Primary;
    this.launchDialog();
  }

  onBackgroundChange(): void {
    this.colorSelectorService.colorToChange = ColorType.Background;
    this.launchDialog();
  }

  private launchDialog(): void {
    this.toolSelector.setCurrentTool(Tools.Pencil);
    this.dialog.open(ColorPickerComponent, { disableClose: true }).afterClosed().subscribe(() => {
      this.shortcutManager.setupShortcuts();
    });
  }

}
