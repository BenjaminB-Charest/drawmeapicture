// tslint:disable: no-string-literal | Reason: used to access private variables
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Tools } from 'src/app/enums/tools';
import { HotkeysService } from 'src/app/services/hotkeys/hotkeys.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { WarningDialogComponent } from '../warning/warning-dialog.component';
import { WorkingAreaComponent } from '../working-area/working-area.component';
import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let selector: ToolSelectorService;

  // https://medium.com/@aleixsuau/testing-angular-components-with-material-dialog-mddialog-1ae658b4e4b3
  class MdDialogMock {
    // tslint:disable-next-line: no-any | Reason : unknown return type
    open(): any {
      return {
        afterClosed: () => of(WarningDialogComponent)
      };
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarComponent ],
      providers: [
        ToolSelectorService,
        WorkingAreaComponent,
        HotkeysService,
        {provide: MatDialog, useClass: MdDialogMock},
        {provide: APP_BASE_HREF, useValue : '/' }
      ],
      imports: [
        MatSnackBarModule,
        HttpClientModule,
        MatTooltipModule,
        MatDialogModule,
        RouterModule.forRoot(
          [
            { path: '', component: SidebarComponent}
          ]
        )
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    selector = TestBed.get<ToolSelectorService>(ToolSelectorService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#selectTool should select tool', () => {
    component.selectTool(Tools.Line);
    expect(component['toolSelectorService'].$currentTool.value).toEqual(Tools.Line);
  });

  it('#selectTool should select current tool', () => {
    component.selectTool(Tools.Line);
    expect(selector.$currentTool.value).toEqual(Tools.Line);
  });

  it('#saveServerProject should open dialog to save on server', () => {
    const spy = spyOn(component['workingAreaComponent'], 'saveServerProject');
    component.saveServerProject();
    expect(spy).toHaveBeenCalled();
  });

  it('#createNewProject should open dialog to create a new projet', () => {
    const spy = spyOn(component['workingAreaComponent'], 'createNewProject');
    component.createNewProject();
    expect(spy).toHaveBeenCalled();
  });

  it('#openGallery should open dialog to for the gallery', () => {
    const spy = spyOn(component['workingAreaComponent'], 'openGallery');
    component.openGallery();
    expect(spy).toHaveBeenCalled();
  });

  it('#exportProject should open dialog to export current projet', () => {
    const spy = spyOn(component['workingAreaComponent'], 'exportProject');
    component.exportProject();
    expect(spy).toHaveBeenCalled();
  });

  it('#goHome should go home with warning', () => {
    const spy = spyOn(component['dialog'], 'open')
    .and
    .returnValue({
      afterClosed: () => new Observable()
    } as unknown as MatDialogRef<{}, {}>);
    component.goHome();
    expect(spy).toHaveBeenCalledWith(WarningDialogComponent, { disableClose: true });
  });
});
