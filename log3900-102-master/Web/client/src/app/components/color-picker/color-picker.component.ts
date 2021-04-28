import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Color } from 'src/app/classes/color';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { ShortcutManagerService } from 'src/app/services/shortcut-manager/shortcut-manager.service';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent {

  selectedColor: Color;
  selectedHue: Color;
  initialColor: Color; // used in HTML to transfer value from Hue to Palette

  constructor(
    private dialogRef: MatDialogRef<ColorPickerComponent>,
    private shortcutManager: ShortcutManagerService,
    private colorSelectorService: ColorSelectorService
    ) {
      this.shortcutManager.disableShortcuts();
      this.selectedColor = this.colorSelectorService.getCurrentlySelectedColor();
      this.selectedHue = this.colorSelectorService.getCurrentlySelectedColor();
  }

  updateRed(event: KeyboardEvent): void {
    this.selectedColor.setRedHex((event.target as HTMLInputElement).value);
  }

  updateGreen(event: KeyboardEvent): void {
    this.selectedColor.setGreenHex((event.target as HTMLInputElement).value);
  }

  updateBlue(event: KeyboardEvent): void {
    this.selectedColor.setBlueHex((event.target as HTMLInputElement).value);
  }

  onDialogClose(): void {
    this.dialogRef.close();
    this.shortcutManager.setupShortcuts();
  }

  onConfirm(): void {
    this.colorSelectorService.updateColor(this.selectedColor);
    this.onDialogClose();
  }

}
