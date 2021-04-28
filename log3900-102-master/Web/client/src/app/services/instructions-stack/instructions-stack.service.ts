import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Stroke } from 'src/app/classes/stroke';
import { ToolSelectorService } from '../tools-selector/tool-selector.service';

@Injectable({
    providedIn: 'root',
})
export class InstructionsStackService {
    instructions: Stroke[];
    stackLengthSubject: BehaviorSubject<number>;
    isDoneSubject: BehaviorSubject<boolean>;
    processedStack: Stroke[];
    isReplaying: boolean;

    constructor(public toolSelectorService: ToolSelectorService) {
        this.instructions = [];
        this.processedStack = [];
        this.isDoneSubject = new BehaviorSubject<boolean>(false);
        this.stackLengthSubject = new BehaviorSubject<number>(0);
        this.isReplaying = false;
    }

    processStack(): Stroke[] {
        this.processedStack = [];
        for (const element of this.toolSelectorService.getEraser().elements.getAll()) {
            this.processedStack.push(this.toolSelectorService.getPencil().instructions.find(stroke => stroke.id === element.id) as Stroke);
        }
        const newArray: Stroke[] = [];
        for (const stroke of this.processedStack) {
            newArray.push({
                id: stroke.id,
                path: stroke.path,
                opacity: stroke.opacity,
                size: stroke.size,
                color: stroke.color,
                type: stroke.type,
            } as Stroke);
        }
        return newArray;
    }

    getCanvasElement(): void {
        this.toolSelectorService.getEraser().updateSVGElements();
        this.stackLengthSubject = new BehaviorSubject<number>(this.toolSelectorService.getEraser().elements.getAll().length);
    }

    getProcessedStack(): Stroke[] {
        return this.processedStack;
    }

    clearInstructions(): void {
        this.toolSelectorService.getPencil().instructions = [];
        this.toolSelectorService.memory.clear();
        this.instructions = [];
        this.processedStack = [];
        this.stackLengthSubject.next(0);
    }
}
