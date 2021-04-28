import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { Tools } from 'src/app/enums/tools';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { UserService } from 'src/app/services/server/user.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { WordImagePairService } from 'src/app/services/word-image-pair/word-image-pair.service';

@Component({
    selector: 'app-word-image-pair',
    templateUrl: './word-image-pair.component.html',
    styleUrls: ['./word-image-pair.component.scss'],
    providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }],
})
export class WordImagePairComponent implements OnInit, OnDestroy {
    avatar: string;
    hints: string[];
    shouldNext: boolean;

    nameForm: FormGroup;
    hintForm: FormControl;
    difficultyForm: FormGroup;

    private avatarDictionary: AvatarDictionary;

    constructor(
        public toolSelector: ToolSelectorService,
        public dialog: MatDialog,
        public formBuilder: FormBuilder,
        private userService: UserService,
        private musicPlayer: MusicPlayerService,
        private wordImagePairService: WordImagePairService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.musicPlayer.stopMusic();
        this.musicPlayer.playMusic('assets/sounds/MII_MUSIC_WOAH.mp3');
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    removeHint(hint: string): void {
        const index = this.hints.indexOf(hint);
        if (index >= 0) {
            this.hints.splice(index, 1);
        }
        if (this.hints.length < 3) {
            this.shouldNext = false;
        }
    }

    addHint(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim() && this.hints.length < 3) {
            this.hints.push(value.trim());
        }
        if (input) {
            input.value = '';
        }
        this.hintForm.setValue(null);
        if (this.hints.length === 3) {
            this.shouldNext = true;
        }
    }

    onGoToDrawing(): void {
        localStorage.setItem('mode', 'wordImagePair');
        this.wordImagePairService.setFields(this.nameForm, this.hints, this.difficultyForm);
        this.toolSelector.setCurrentTool(Tools.Pencil);
    }

    onNext(stepper: MatStepper): void {
        if (this.nameForm.get('name')?.value.trim()) {
            stepper.next();
        }
    }

    ngOnInit(): void {
        this.difficultyForm = this.formBuilder.group({
            difficulty: ['', Validators.required],
        });
        this.nameForm = this.formBuilder.group({
            name: ['', Validators.required],
        });
        this.hints = [];
        this.shouldNext = false;
        if (this.data !== null) {
            this.nameForm.setValue({ name: this.data.word });
            this.difficultyForm.setValue({ difficulty: this.data.difficulty });
            this.hints = this.data.hints;
            this.shouldNext = true;
        }
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.hintForm = new FormControl();
    }

    ngOnDestroy(): void {
        if (localStorage.getItem('mode') !== 'wordImagePair') {
            this.musicPlayer.stopMusic();
            this.musicPlayer.playMusic('assets/sounds/action_music.mp3');
        }
    }
}
