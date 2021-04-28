// tslint:disable: no-string-literal | Reason: used to access private variables
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Tools } from 'src/app/enums/tools';
import { DrawerService } from 'src/app/services/side-nav-drawer/drawer.service';
import { CanvasComponent } from '../canvas/canvas.component';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ColorPanelComponent } from '../color-panel/color-panel.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { ColorSliderComponent } from '../color-slider/color-slider.component';
import { CreateNewComponent } from '../create-new/create-new.component';
import { EraserComponent } from '../eraser/eraser.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { GridComponent } from '../grid/grid.component';
import { OptionPannelComponent } from '../option-pannel/option-pannel.component';
import { PencilComponent } from '../pencil/pencil.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { WorkingAreaComponent } from './working-area.component';

describe('WorkingAreaComponent', () => {
  let component: WorkingAreaComponent;
  let fixture: ComponentFixture<WorkingAreaComponent>;

  const numberOfSubscription = 32;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CanvasComponent,
        CreateNewComponent,
        ColorPanelComponent,
        ColorPaletteComponent,
        ColorPickerComponent,
        ColorSliderComponent,
        OptionPannelComponent,
        WorkingAreaComponent,
        SidebarComponent,
        PencilComponent,
        WorkspaceComponent,
        GridComponent,
        EraserComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatDialogModule,
        MatSidenavModule,
        RouterModule.forRoot(
          [
            { path: '', component: SidebarComponent }
          ]
        ),
        FormsModule,
        MatSliderModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatDividerModule,
        MatRadioModule,
        MatExpansionModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        HttpClientModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [CreateNewComponent] } })
      .compileComponents();
    fixture = TestBed.createComponent(WorkingAreaComponent);
    component = fixture.componentInstance;
    history.pushState({
      comingFromEntryPoint: true
    }, 'mockState');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngOnInit shouldn\'t open', () => {
    const spy = spyOn(component['dialog'], 'open');
    history.pushState({
      comingFromEntryPoint: false
    }, 'mockState');
    component.ngOnInit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('#ngOnInit shouldn open', () => {
    const spy = spyOn(component['dialog'], 'open')
      .and
      .returnValue({
        afterClosed: () => new Observable()
      } as unknown as MatDialogRef<{}, {}>);
    history.pushState({
      comingFromEntryPoint: true
    }, 'mockState');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith(CreateNewComponent, { disableClose: true });
  });

  it('#prepareWorkingAreaShortcuts should setup shortcuts', () => {
    component['shortcutManager'].saveCurrentTool();
    component.prepareWorkingAreaShortcuts();
    expect(component['shortcutManager']['workingAreaComponent']).toEqual(component);
    expect(component['shortcutManager']['savedTool']).toEqual(Tools.None);
    expect(component['shortcutManager']['subscriptions'].length).toEqual(numberOfSubscription);
  });

  it('#getDrawerStatus should drawer be open', () => {
    expect(component.getDrawerStatus()).toEqual(true);
  });

  it('#getDrawerStatus should drawer be closed', () => {
    const drawer = TestBed.get<DrawerService>(DrawerService);
    drawer.navIsOpened = false;
    expect(component.getDrawerStatus()).toEqual(false);
  });

  it('#saveServerProject should not save empty canvas', () => {
    component['galleryService'].refToSvg = {
      nativeElement: {
        childElementCount: 0
      } as SVGGElement
    };
    const spy = spyOn(component['snackBar'], 'open');
    component.saveServerProject();
    expect(spy).toHaveBeenCalledWith('Vous ne pouvez pas sauvegarder un canvas vide', '', {
      duration: 2000,
    });
  });

  it('#saveServerProject should save valid canvas', () => {
    component['galleryService'].refToSvg = {
      nativeElement: {
        childElementCount: 2
      } as SVGGElement
    };
    const spy = spyOn(component['snackBar'], 'open');
    const spy2 = spyOn(component['dialog'], 'closeAll');
    component.saveServerProject();
    expect(component['shortcutManager']['savedTool']).toEqual(Tools.None);
    expect(spy).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

  it('#createNewProject should open new project dialog', () => {
    const spy = spyOn(component['dialog'], 'closeAll');
    const spy2 = spyOn(component['dialog'], 'open')
      .and
      .returnValue({
        afterClosed: () => new Observable()
      } as unknown as MatDialogRef<{}, {}>);
    component.createNewProject();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith(CreateNewComponent, { disableClose: true });
  });

  it('#openGallery should open gallery', () => {
    const spy = spyOn(component['dialog'], 'closeAll');
    const spy2 = spyOn(component['dialog'], 'open')
      .and
      .returnValue({
        afterClosed: () => new Observable()
      } as unknown as MatDialogRef<{}, {}>);
    component.openGallery();
    expect(spy).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledWith(GalleryComponent, { disableClose: true });
  });

  it('#exportProject should not export empty svg', () => {
    const spy = spyOn(component['snackBar'], 'open');
    component['galleryService'].refToSvg = {
      nativeElement: {
        childElementCount: 0
      } as SVGGElement
    };
    component.exportProject();
    expect(spy).toHaveBeenCalledWith('Vous ne pouvez pas exporter un canvas vide', '', {
      duration: 2000,
    });
  });

  it('#exportProject should export valid svg', () => {
    const spy = spyOn(component['dialog'], 'closeAll');
    component['galleryService'].refToSvg = {
      nativeElement: {
        childElementCount: 2
      } as SVGGElement
    };
    component.exportProject();
    expect(component['shortcutManager']['savedTool']).toEqual(Tools.None);
    expect(spy).toHaveBeenCalled();
  });

});
