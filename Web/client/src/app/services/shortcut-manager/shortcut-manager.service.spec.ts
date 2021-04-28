// tslint:disable: no-string-literal | Reason: used to access private variables
import { TestBed } from '@angular/core/testing';
import { WorkingAreaComponent } from 'src/app/components/working-area/working-area.component';
import { Tools } from 'src/app/enums/tools';
import { ShortcutManagerService } from '../shortcut-manager/shortcut-manager.service';

describe('ShortcutManagerService', () => {

  let service: ShortcutManagerService;
  const numberOfSubscription = 32;
  const numberOfDefaultToPrevent = 4;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(ShortcutManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#saveCurrentTool should save current tool, and set tool to none', () => {
    service.toolSelectorService.$currentTool.next(Tools.Pencil);
    service.saveCurrentTool();
    expect(service['savedTool']).toEqual(Tools.Pencil);
    expect(service.toolSelectorService.$currentTool.value).toEqual(Tools.None);
  });

  it('#loadSavedTool should load saved tool to current tool', () => {
    service.toolSelectorService.$currentTool.next(Tools.Pencil);
    service['savedTool'] = Tools.Line;
    service.loadSavedTool();
    expect(service.toolSelectorService.$currentTool.value).toEqual(Tools.Line);
  });

  it('#disableShortcuts should disable shortcuts and prevent default', () => {
    service.setupShortcuts();
    expect(service['subscriptions'].length).toEqual(numberOfSubscription);
    service.disableShortcuts();
    expect(service['subscriptions'].length).toEqual(numberOfDefaultToPrevent);
  });

  it('#setupShortcuts should setup shortcuts', () => {
    service.setupShortcuts();
    const spy = spyOn(service['toolSelectorService'], 'setCurrentTool');
    const keys = ['l', 'c', '1', 'w', 'control.o'];
    for (const element of keys) {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: element,
        bubbles: true
      }));
    }
    // tslint:disable-next-line: no-magic-numbers | Reason : there are currently 4 shortcuts
    expect(spy).toHaveBeenCalledTimes(4);
    expect(service['subscriptions'].length).toEqual(numberOfSubscription);
  });

  it('#setupShortcuts should test shortcuts', () => {
    service.setupShortcuts();
    const spy = spyOn(service['toolSelectorService'], 'setCurrentTool');

    service['toolSelectorService'].$currentTool.next(Tools.Selection);
    const spy2 = spyOn(service['toolSelectorService'], 'getSelection');
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'control.a',
      bubbles: true
    }));
    expect(spy2).toHaveBeenCalled();
    service['toolSelectorService'].getGrid()['visible'].next(false);

    const keys = ['s', 'l', 'r', 'c', 'control.e', '1', '2', '3',
      'w', 'e', 'A', 'i', 'control.o', 'control.g', 'control.s', 'control.z', 'control.shift.z',
      'g', '+', '-'
    ];
    for (const element of keys) {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: element,
        bubbles: true
      }));
    }
    // tslint:disable-next-line: no-magic-numbers | Reason : amount of shortcuts currently available
    expect(spy).toHaveBeenCalledTimes(11);
    expect(service['toolSelectorService'].getGrid()['visible'].value).toEqual(true);
  });
});
