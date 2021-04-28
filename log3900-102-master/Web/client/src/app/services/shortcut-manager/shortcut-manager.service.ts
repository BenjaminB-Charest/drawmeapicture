import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tools } from 'src/app/enums/tools';
import { HotkeysService } from '../hotkeys/hotkeys.service';
import { DrawerService } from '../side-nav-drawer/drawer.service';
import { ToolSelectorService } from '../tools-selector/tool-selector.service';

@Injectable({
    providedIn: 'root',
})
export class ShortcutManagerService {
    private subscriptions: Subscription[] = [];
    private savedTool: Tools;

    constructor(public toolSelectorService: ToolSelectorService, private shortcut: HotkeysService, private drawerService: DrawerService) {
        this.bypassBrowserShortcuts();
        this.savedTool = Tools.None;
    }

    saveCurrentTool(): void {
        this.savedTool = this.toolSelectorService.$currentTool.getValue();
        this.toolSelectorService.setCurrentTool(Tools.None);
    }

    loadSavedTool(): void {
        this.toolSelectorService.setCurrentTool(this.savedTool);
        this.drawerService.navIsOpened = true;
    }

    disableShortcuts(): void {
        for (let i: number = this.subscriptions.length - 1; i >= 0; --i) {
            this.subscriptions[i].unsubscribe();
            this.subscriptions.pop();
        }
        this.bypassBrowserShortcuts();
    }

    setupShortcuts(): void {
        this.bypassBrowserShortcuts();
        this.subscriptions.forEach(subscription => subscription.remove(subscription));

        // Keep this as an example
        // this.subscriptions.push(this.shortcut.addShortcut({ keys: 'c', description: 'Selecting pencil with shortcut' }).subscribe(
        //   (event) => {
        //     this.toolSelectorService.setCurrentTool(Tools.Pencil);
        //   }
        // )
        // );

        this.subscriptions.push(
            this.shortcut.addShortcut({ keys: 'control.z', description: 'Undo' }).subscribe(event => {
                this.toolSelectorService.memory.undo();
            }),
        );

        this.subscriptions.push(
            this.shortcut.addShortcut({ keys: 'control.shift.z', description: 'Redo' }).subscribe(event => {
                this.toolSelectorService.memory.redo();
            }),
        );
    }

    private bypassBrowserShortcuts(): void {
        this.subscriptions.push(
            this.shortcut.addShortcut({ keys: 'control.e', description: 'block search tab' }).subscribe(event => {
                // do nothing
            }),
        );
        this.subscriptions.push(
            this.shortcut.addShortcut({ keys: 'control.o', description: 'bypass open to save from chrome' }).subscribe(event => {
                // do nothing
            }),
        );
        this.subscriptions.push(
            this.shortcut.addShortcut({ keys: 'control.g', description: 'bypass search chrome' }).subscribe(event => {
                // do nothing
            }),
        );
        this.subscriptions.push(
            this.shortcut.addShortcut({ keys: 'control.s', description: 'bypass open to save from chrome' }).subscribe(event => {
                // do nothing
            }),
        );
    }
}
