import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Color } from 'src/app/classes/color';
import * as CONSTANTS from 'src/app/classes/constants';
import { CoordinatesXY } from 'src/app/classes/coordinates-x-y';
import { ColorType } from 'src/app/enums/color-types';
import { CanvasService } from 'src/app/services/canvas/canvas.service';
import { ColorSelectorService } from 'src/app/services/color-selector/color-selector.service';
import { CreateNewService } from 'src/app/services/create-new/create-new.service';
import { ShortcutManagerService } from 'src/app/services/shortcut-manager/shortcut-manager.service';
import { WorkspaceService } from 'src/app/services/workspace/workspace.service';
import { HotkeysService } from '../../services/hotkeys/hotkeys.service';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { WarningDialogComponent } from '../warning/warning-dialog.component';

@Component({
  selector: 'app-create-new',
  templateUrl: './create-new.component.html',
  styleUrls: ['./create-new.component.scss']
})

export class CreateNewComponent implements OnInit, OnDestroy {

  backgroundColor: Color;
  previewColor: Color;
  workspaceSizeX: number;
  workspaceSizeY: number;
  private changed: boolean;
  private subscriptions: Subscription[] = [];

  constructor(private colorSelectorService: ColorSelectorService,
              private dialogRef: MatDialogRef<CreateNewComponent>,
              private dialog: MatDialog,
              private createNewService: CreateNewService,
              private workspaceService: WorkspaceService,
              private canvasService: CanvasService,
              private shortcutManager: ShortcutManagerService,
              public router: Router,
              private shortcut: HotkeysService
              ) {
    this.shortcutManager.disableShortcuts();
    this.subscriptions.push(this.shortcut.addShortcut({ keys: 'control.o', description: 'Opening create a new drawing' }).subscribe(
      (event) => {
        // cant open a nez dialog
      }
    ));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach ( (subscription) => subscription.unsubscribe() );
    this.workspaceService.size.next(this.workspaceService.size.value);
  }

  ngOnInit(): void {
    this.canvasService.askForLayerCount.next(true);
    this.changed = false;
    this.colorSelectorService.backgroundColor.subscribe((color: Color) => {
      this.backgroundColor = color;
    });
    this.colorSelectorService.temporaryColor.subscribe((color: Color) => {
      this.previewColor = color;
    });
    this.colorSelectorService.temporaryColor.next(new Color(CONSTANTS.DEFAULT_BLANK_COLOR));
    this.workspaceService.size.subscribe((size: CoordinatesXY) => {
      if (!this.changed) {
        this.workspaceSizeX = size.getX();
        this.workspaceSizeY = size.getY();
      }
    });
  }
  setcanvasSizeX(event: KeyboardEvent): void {
    this.workspaceSizeX = parseInt((event.target as HTMLInputElement).value, CONSTANTS.DECIMAL_BASE);
    this.changed = true;
  }
  setcanvasSizeY(event: KeyboardEvent): void {
    this.workspaceSizeY = parseInt((event.target as HTMLInputElement).value, CONSTANTS.DECIMAL_BASE);
    this.changed = true;
  }

  onColorSelect(): void {
    this.colorSelectorService.colorToChange = ColorType.Preview;
    this.colorSelectorService.updateColor(this.previewColor);
    this.launchColorDialog();
  }

  private launchColorDialog(): void {
    this.dialog.open(ColorPickerComponent, { disableClose: true }).afterClosed().subscribe(() => {
      this.shortcutManager.disableShortcuts();
    });
  }

  onConfirm(): void {
    if (this.canvasService.layerCount > 0) {
      this.openDialogWarning();
    } else {
      this.setUpNewWorkingSpace();
    }
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  openDialogWarning(): void {
    const warning = this.dialog.open(WarningDialogComponent, { disableClose: true });

    if (warning !== undefined) {
      warning.afterClosed().subscribe((result) => {
        if (!result) {
          this.setUpNewWorkingSpace();
        }
      });
   }
  }

  private setUpNewWorkingSpace(): void {
    this.colorSelectorService.colorToChange = ColorType.Background;
    this.colorSelectorService.updateColor(this.previewColor);
    this.createNewService.canvasSize.next(new CoordinatesXY(this.workspaceSizeX, this.workspaceSizeY));
    this.dialogRef.close();
  }
}
