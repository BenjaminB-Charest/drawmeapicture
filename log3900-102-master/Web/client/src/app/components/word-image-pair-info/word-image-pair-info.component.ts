import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CreateNewService } from 'src/app/services/create-new/create-new.service';
import { InstructionsStackService } from 'src/app/services/instructions-stack/instructions-stack.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { WordImagePairService } from 'src/app/services/word-image-pair/word-image-pair.service';
import { WordImagePairDecisionComponent } from '../word-image-pair-decision/word-image-pair-decision.component';
import { WordImagePairComponent } from '../word-image-pair/word-image-pair.component';

@Component({
    selector: 'app-word-image-pair-info',
    templateUrl: './word-image-pair-info.component.html',
    styleUrls: ['./word-image-pair-info.component.scss'],
    styles: ['::ng-deep .cdk-overlay-backdrop{right:304px;}'],
})
export class WordImagePairInfoComponent implements OnInit, OnDestroy {
    word: string;
    hints: string[];
    difficulty: string;
    isOnAccelerate: boolean;
    isOnAccelerateSubscription: Subscription;
    imageSubscription: Subscription;
    isDoneSubscription: Subscription;
    constructor(
        public dialog: MatDialog,
        public createNewService: CreateNewService,
        public wordImagePairService: WordImagePairService,
        public instructionStackService: InstructionsStackService,
        public toolSelector: ToolSelectorService,
        public router: Router,
    ) {}

    onEdit(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.data = { word: this.word, difficulty: this.difficulty, hints: this.hints };
        this.dialog.open(WordImagePairComponent, dialogConfig);
    }

    onRefresh(): void {
        this.createNewService.resetCanvas();
        this.instructionStackService.toolSelectorService.getPencil().endTool();
        this.instructionStackService.toolSelectorService.getEraser().endTool();
        this.instructionStackService.clearInstructions();
    }

    private openDialogWordImagePairDecision(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        this.dialog.open(WordImagePairDecisionComponent, dialogConfig);
    }

    onDone(): void {
        this.instructionStackService.getCanvasElement();
        this.openDialogWordImagePairDecision();
    }

    ngOnInit(): void {
        this.imageSubscription = this.wordImagePairService.wordImagePair.subscribe(image => {
            this.word = image.word;
            this.hints = image.hints;
            this.difficulty = image.difficulty;
        });
        this.isDoneSubscription = this.instructionStackService.isDoneSubject.subscribe(isDone => {
            if (isDone) {
                this.openDialogWordImagePairDecision();
            }
        });
        this.isOnAccelerateSubscription = this.wordImagePairService.isOnAccelerateSubject.subscribe(isOnAccelerate => {
            this.isOnAccelerate = isOnAccelerate;
        });
    }

    ngOnDestroy(): void {
        this.imageSubscription.unsubscribe();
        this.isDoneSubscription.unsubscribe();
        this.isOnAccelerateSubscription.unsubscribe();
    }
}
