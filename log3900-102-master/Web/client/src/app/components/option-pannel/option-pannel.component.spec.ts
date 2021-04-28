// tslint:disable: no-string-literal | Reason: used to access private variables
import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Tools } from 'src/app/enums/tools';
import { PencilService } from 'src/app/services/drawable/pencil/pencil.service';
import { DrawablePropertiesService } from 'src/app/services/drawable/properties/drawable-properties.service';
import { HotkeysService } from 'src/app/services/hotkeys/hotkeys.service';
import { DrawerService } from 'src/app/services/side-nav-drawer/drawer.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ColorPanelComponent } from '../color-panel/color-panel.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ColorSliderComponent } from '../color-slider/color-slider.component';
import { EraserComponent } from '../eraser/eraser.component';
import { GridComponent } from '../grid/grid.component';
import { PencilComponent } from '../pencil/pencil.component';
import { OptionPannelComponent } from './option-pannel.component';

describe('OptionPannelComponent', () => {
  let component: OptionPannelComponent;
  let fixture: ComponentFixture<OptionPannelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        // ADD HERE ALL THE OTHER ADDED TOOLS
        OptionPannelComponent,
        PencilComponent,
        ColorPanelComponent,
        EraserComponent,
        GridComponent
      ],
      providers: [
        ColorPaletteComponent,
        EraserComponent,
        ColorPanelComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        GridComponent,
        OptionPannelComponent,
        HotkeysService,
        ToolSelectorService,
        DrawablePropertiesService,
        DrawerService,
        PencilService,
        MatDialog
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatSliderModule,
        MatFormFieldModule,
        MatDialogModule,
        MatOptionModule,
        MatSelectModule,
        MatInputModule,
        MatDividerModule,
        MatExpansionModule,
        MatIconModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule
      ]
    })
      .compileComponents();
    component = getTestBed().get(OptionPannelComponent);
    fixture = TestBed.createComponent(OptionPannelComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to tool', () => {
    component.toolSelectorService.setCurrentTool(Tools.Line);
    expect(component.currentTool).toEqual(Tools.Line);
  });
});
