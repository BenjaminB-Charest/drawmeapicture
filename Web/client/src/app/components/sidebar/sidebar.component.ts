import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SoloTutorialComponent } from 'src/app/components/solo-tutorial/solo-tutorial.component';
import { WordImagePairTutorialComponent } from 'src/app/components/word-image-pair-tutorial/word-image-pair-tutorial.component';
import { ChatService } from 'src/app/services/chat/chat.service';
import { CreateNewService } from 'src/app/services/create-new/create-new.service';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { InstructionsStackService } from 'src/app/services/instructions-stack/instructions-stack.service';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { UserService } from 'src/app/services/server/user.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
import { WordImagePairService } from 'src/app/services/word-image-pair/word-image-pair.service';
import { Tools } from '../../enums/tools';
import { ToolSelectorService } from '../../services/tools-selector/tool-selector.service';
import { ClassicTutorialComponent } from '../classic-tutorial/classic-tutorial.component';
import { WorkingAreaComponent } from '../working-area/working-area.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
    toolsList: typeof Tools = Tools;

    currentTool: Tools;
    isDrawing = false;
    musicOn = true;
    virtualPlayerSpeakingOn: boolean;
    gameMode: string;
    isOnAccelerate: boolean;
    isOnAccelerateSubscription: Subscription;
    soloCloseDialogSubscription: Subscription;
    classicCloseDialogSubscription: Subscription;

    soloDialogRef: MatDialogRef<SoloTutorialComponent>;
    classicDialogRef: MatDialogRef<ClassicTutorialComponent>;

    constructor(
        public router: Router,
        protected dialog: MatDialog,
        public gameEngineService: GameEngineService,
        public toolSelectorService: ToolSelectorService,
        public wordImagePairService: WordImagePairService,
        private workingAreaComponent: WorkingAreaComponent,
        public soloSprintEngineService: SoloSprintEngineService,
        public toolSelector: ToolSelectorService,
        public instructionStackService: InstructionsStackService,
        public musicService: MusicPlayerService,
        public chatService: ChatService,
        public userService: UserService,
        private createNewService: CreateNewService,
    ) {
        this.virtualPlayerSpeakingOn = this.chatService.$virtualPlayerVoiceActive.getValue();
        this.musicOn = this.userService.currentUser.toggleMusic;
    }

    ngOnInit(): void {
        this.toolSelectorService.$currentTool.subscribe((tool: Tools) => {
            this.currentTool = tool;
        });

        this.gameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';

        // tslint:disable-next-line: prefer-switch
        if (this.gameMode === 'classic') {
            this.gameEngineService.$isDrawing.subscribe((isDrawing: boolean) => {
                this.isDrawing = isDrawing;
            });
        } else if (this.gameMode === 'solo') {
            this.isDrawing = true;
        } else if (this.gameMode === 'wordImagePair') {
            this.isDrawing = true;
        }

        this.isOnAccelerateSubscription = this.wordImagePairService.isOnAccelerateSubject.subscribe(isOnAccelerate => {
            this.isOnAccelerate = isOnAccelerate;
        });

        this.soloCloseDialogSubscription = this.soloSprintEngineService.tutorialCloseDialogSubject.subscribe(shouldClose => {
            if (shouldClose) {
                if (this.soloDialogRef !== undefined) {
                    this.soloDialogRef.close();
                    this.soloSprintEngineService.tutorialCloseDialogSubject.next(false);
                }
            }
        });

        this.classicCloseDialogSubscription = this.gameEngineService.tutorialShouldCloseSubject.subscribe(shouldClose => {
            if (shouldClose) {
                if (this.classicDialogRef !== undefined) {
                    this.classicDialogRef.close();
                    this.gameEngineService.tutorialShouldCloseSubject.next(false);
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.isOnAccelerateSubscription.unsubscribe();
        this.soloCloseDialogSubscription.unsubscribe();
        this.classicCloseDialogSubscription.unsubscribe();
    }

    selectTool(tool: Tools): void {
        this.toolSelectorService.setCurrentTool(tool);
    }

    createNewProject(): void {
        this.workingAreaComponent.createNewProject();
    }

    toggleMusic(): void {
        this.musicOn = !this.musicOn;
        this.userService.musicToggled.next(this.musicOn);
        if (this.musicOn) {
            this.musicService.playMusic('assets/sounds/challenging_music.mp3');
        } else {
            this.musicService.stopMusic();
        }
    }

    toggleVirtualPlayer(): void {
        this.virtualPlayerSpeakingOn = !this.virtualPlayerSpeakingOn;
        this.chatService.$virtualPlayerVoiceActive.next(this.virtualPlayerSpeakingOn);
    }

    openTutorial(): void {
        if (this.gameMode === 'classic') {
            this.openClassicTutorialDialog();
        } else if (this.gameMode === 'solo') {
            this.openSoloTutorialDialog();
        } else {
            this.openWordImagePairTutorialDialog();
        }
    }

    private openSoloTutorialDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '520px';
        dialogConfig.height = '637px';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '68px', left: '580px' };
        this.soloDialogRef = this.dialog.open(SoloTutorialComponent, dialogConfig);
    }

    private openClassicTutorialDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '520px';
        dialogConfig.height = '637px';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '68px', left: '580px' };
        this.classicDialogRef = this.dialog.open(ClassicTutorialComponent, dialogConfig);
    }

    private openWordImagePairTutorialDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '520px';
        dialogConfig.height = '637px';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '68px', left: '580px' };
        this.dialog.open(WordImagePairTutorialComponent, dialogConfig);
    }

    goHome(): void {
        // tslint:disable-next-line: prefer-switch
        if (this.gameMode === 'classic') {
            this.gameEngineService.quitGame();
        } else if (this.gameMode === 'solo') {
            this.soloSprintEngineService.quitGame();
        } else if (this.gameMode === 'wordImagePair') {
            this.instructionStackService.isDoneSubject.next(false);
            this.wordImagePairService.isOnAccelerateSubject.next(false);
            this.toolSelector.getPencil().drawStack.elements.clear();

            this.createNewService.resetCanvas();
            this.instructionStackService.toolSelectorService.getPencil().endTool();
            this.instructionStackService.toolSelectorService.getEraser().endTool();
            this.instructionStackService.clearInstructions();
            localStorage.setItem('mode', 'menu');
            this.router.navigateByUrl('/home');
        }
    }
}
