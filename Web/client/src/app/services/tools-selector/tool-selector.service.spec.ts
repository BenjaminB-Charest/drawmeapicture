// tslint:disable: no-string-literal | Reason: used to access private variables
// tslint:disable: no-magic-numbers | Reason : testing with arbitrary values
import { TestBed } from '@angular/core/testing';
import { Tools } from 'src/app/enums/tools';
import { EraserService } from '../drawable/eraser/eraser.service';
import { GridService } from '../drawable/grid/grid.service';
import { PencilService } from '../drawable/pencil/pencil.service';
import { ToolSelectorService } from './tool-selector.service';

describe('ToolSelectorService', () => {

  let service: ToolSelectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({

    });
    service = TestBed.get(ToolSelectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#getPencil should get pencil', () => {
    expect(service.getPencil()).toEqual(new PencilService());
  });

  it('#getEraser should get eraser', () => {
    expect(service.getEraser()).toEqual(new EraserService());
  });

  it('#getGrid should get grid', () => {
    expect(service.getGrid()).toEqual(new GridService());
  });

  it('#setCurrentTool should set none with old being undefined', () => {
    service['tool'] = undefined;
    service.setCurrentTool(Tools.None);
    expect(service.$currentTool.value).toEqual(Tools.None);
  });

  it('#getTool shouldn\'t find non existant tool in map', () => {
    expect(service.getTool('Bla' as Tools)).toEqual(undefined);
  });
});
