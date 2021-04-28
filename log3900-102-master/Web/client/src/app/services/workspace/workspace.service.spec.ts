// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';
import { Color } from '../../classes/color';
import { WorkspaceService } from './workspace.service';

describe('WorkspaceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkspaceService = TestBed.get(WorkspaceService);
    expect(service).toBeTruthy();
  });

  it('should the color #808080 (grey) by default', () => {
    const service: WorkspaceService = TestBed.get(WorkspaceService);
    expect(service.backgroundColor.getHex()).toBe('#808080');
    expect(service.checkIfSameBackgroundColor(new Color('#808080'))).toBe(true);
  });

  it('checkIfSameBackgroundColor should return false if the color is different', () => {
    const service: WorkspaceService = TestBed.get(WorkspaceService);
    expect(service.checkIfSameBackgroundColor(new Color('#809980'))).toBe(false);
  });

  it('#checkIfSameBackgroundColor should return true if the color is the same', () => {
    const service: WorkspaceService = TestBed.get(WorkspaceService);
    service.backgroundColor.setHex('898989');
    expect(service.checkIfSameBackgroundColor(new Color('#898989'))).toBe(true);
  });
});
