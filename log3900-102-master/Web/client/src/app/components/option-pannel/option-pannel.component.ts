import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tools } from '../../enums/tools';
import { ToolSelectorService } from '../../services/tools-selector/tool-selector.service';

@Component({
    selector: 'app-option-pannel',
    templateUrl: './option-pannel.component.html',
    styleUrls: ['./option-pannel.component.scss'],
})
export class OptionPannelComponent implements OnInit, OnDestroy {
    currentTool: Tools;
    gameMode: string;
    toolSubscription: Subscription;

    constructor(public toolSelectorService: ToolSelectorService, private ngZone: NgZone) {
        // this.gameMode = localStorage.getItem('mode') !== null ? (localStorage.getItem('mode') as string) : 'classic';
        this.gameMode = localStorage.getItem('mode') as string;
    }
    ngOnDestroy(): void {
        this.toolSubscription.unsubscribe();
    }

    ngOnInit(): void {
        this.setTool();
    }

    setTool(): void {
        this.ngZone.run(() => {
            this.toolSubscription = this.toolSelectorService.$currentTool.subscribe((tool: Tools) => {
                this.currentTool = tool;
            });
        });
    }
}
