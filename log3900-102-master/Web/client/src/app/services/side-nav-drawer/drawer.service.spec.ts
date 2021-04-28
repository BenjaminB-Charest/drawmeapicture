// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';

import { Tools } from 'src/app/enums/tools';
import { DrawerService } from './drawer.service';

describe('DrawerService', () => {

  let service: DrawerService;

  beforeEach(() => {
    TestBed.configureTestingModule({

    });
    service = TestBed.get(DrawerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have navIsOpened to true by default', () => {
    expect(service.navIsOpened).toBe(true);
  });

  it('#updateDrawer should change navIsOpened to true if it was false', () => {
    service.navIsOpened = false;
    service.updateDrawer(Tools.Rectangle);
    expect(service.navIsOpened).toBe(true);
  });

  it('#updateDrawer should not change navIsOpened it was true and the currentTool is diffenrent from lastTool', () => {
    service.lastTool = Tools.Rectangle;
    service.updateDrawer(Tools.Line);
    expect(service.navIsOpened).toBe(true);
  });

  it('#updateDrawer should close the drawer if it was opened and currentTool is the same as lastTool', () => {
    service.lastTool = Tools.Rectangle;
    service.updateDrawer(Tools.Rectangle);
    expect(service.navIsOpened).toBe(false);
  });

});
