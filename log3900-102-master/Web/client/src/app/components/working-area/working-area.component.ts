import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { ShortcutManagerService } from 'src/app/services/shortcut-manager/shortcut-manager.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
import { WordImagePairService } from 'src/app/services/word-image-pair/word-image-pair.service';
import { DrawerService } from '../../services/side-nav-drawer/drawer.service';
import { CreateNewComponent } from '../create-new/create-new.component';

@Component({
    selector: 'app-working-area',
    templateUrl: './working-area.component.html',
    styleUrls: ['./working-area.component.scss'],
})
export class WorkingAreaComponent implements OnDestroy, OnInit {
    // tslint:disable: deprecation
    private createNewDialog: MatDialogRef<CreateNewComponent>;

    isDrawing: boolean;
    word: string;
    timeLeft: string;
    isDetached: boolean;
    isDetachedSubscription: Subscription;
    gameMode: string;

    constructor(
        private drawerService: DrawerService,
        private shortcutManager: ShortcutManagerService,
        private gameEngineService: GameEngineService,
        private soloSprintEngineService: SoloSprintEngineService,
        protected dialog: MatDialog,
        private channelPanelService: ChannelPanelService,
        public wordImagePairService: WordImagePairService,
        public musicPlayer: MusicPlayerService,
        private ngZone: NgZone,
    ) {
        this.shortcutManager.setupShortcuts();
        this.gameMode = localStorage.getItem('mode') != null ? localStorage.getItem('mode')! : 'classic';

        if (this.gameMode === 'classic') {
            this.startClassicMusic();
            this.gameEngineService.$isDrawing.subscribe((isDrawing: boolean) => {
                this.isDrawing = isDrawing;
            });
            this.gameEngineService.$wordToGuess.subscribe((word: string) => {
                this.word = this.hideWord(word);
            });
            this.gameEngineService.$timer.subscribe((timer: string) => {
                this.timeLeft = timer;
            });
        } else if (this.gameMode === 'solo') {
            this.startSoloMusic();
            this.isDrawing = false;
            this.soloSprintEngineService.$wordToGuess.subscribe((word: string) => {
                this.word = this.hideWord(word);
            });
            this.soloSprintEngineService.$timer.subscribe((timer: string) => {
                this.timeLeft = timer;
            });
        } else if (this.gameMode === 'wordImagePair') {
            this.startWordImagePairMusic();
            this.ngZone.run(() => {
                this.isDrawing = true;
            });
        }
    }

    startClassicMusic(): void {
        this.musicPlayer.playMusic('assets/sounds/Avicii - Levels.mp3');
    }

    startSoloMusic(): void {
        this.musicPlayer.playMusic('assets/sounds/1 Min Music - Pluck.mp3');
    }

    startWordImagePairMusic(): void {
        this.musicPlayer.playMusic('assets/sounds/2 Minute Countdown - Energy.mp3');
    }

    hideWord(word: string): string {
        if (!this.isDrawing) {
            let hiddenWord = '';
            for (let i = 0; i < word.length; i++) {
                if (word[i] === '') {
                    hiddenWord += '  ';
                } else {
                    hiddenWord += '_ ';
                }
            }
            return hiddenWord;
        }
        return word;
    }

    prepareWorkingAreaShortcuts(): void {
        this.shortcutManager.setupShortcuts();
        this.shortcutManager.loadSavedTool();
    }

    getDrawerStatus(): boolean {
        return this.drawerService.navIsOpened;
    }

    createNewProject(): void {
        this.prepareDialogLaunch();
        this.createNewDialog = this.dialog.open(CreateNewComponent, { disableClose: true });
        this.createNewDialog.afterClosed().subscribe(() => {
            this.prepareWorkingAreaShortcuts();
        });
    }

    private prepareDialogLaunch(): void {
        this.shortcutManager.saveCurrentTool();
        this.dialog.closeAll();
    }

    ngOnInit(): void {
        this.isDetachedSubscription = this.channelPanelService.isDetachedSubject.subscribe(isDetached => {
            this.isDetached = isDetached;
        });
    }

    ngOnDestroy(): void {
        this.musicPlayer.stopMusic();
        this.isDetachedSubscription.unsubscribe();
    }
}
