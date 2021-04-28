import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { WordChoice } from 'src/app/enums/word-choice.enum';
import { Image } from 'src/app/interfaces/image';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { UserService } from 'src/app/services/server/user.service';
import { WordChoiceService } from 'src/app/services/word-choice/word-choice.service';

@Component({
    selector: 'app-word-choice',
    templateUrl: './word-choice.component.html',
    styleUrls: ['./word-choice.component.scss'],
    styles: ['::ng-deep .cdk-overlay-backdrop{right:304px; left:350px; top:94px;}'],
})
export class WordChoiceComponent implements OnInit {
    avatar: string;
    words: string[];
    imageList: Image[];
    choiceSubscription: Subscription;
    avatarDictionary: AvatarDictionary;
    selectedWord: boolean;
    constructor(
        private userService: UserService,
        private wordChoiceService: WordChoiceService,
        private gameEngine: GameEngineService,
        private dialogRef: MatDialogRef<WordChoiceComponent>,
    ) {
        this.userService.getProfile();
        this.words = [];
        this.avatarDictionary = new AvatarDictionary();
        this.selectedWord = false;
    }

    onSelect(choice: string): void {
        switch (choice) {
            case WordChoice.ONE:
                this.wordChoiceService.sendWord(this.words[0]);
                break;
            case WordChoice.TWO:
                this.wordChoiceService.sendWord(this.words[1]);
                break;
            case WordChoice.THREE:
                this.wordChoiceService.sendWord(this.words[2]);
                break;
        }
        this.selectedWord = true;
    }
    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.choiceSubscription = this.gameEngine.imageChoice.subscribe(images => {
            if (images === undefined || images.length === 0) {
                return;
            }
            this.words[0] = this.gameEngine.$currentImage.getValue().word;
            this.words[1] = images[0].word;
            this.words[2] = images[1].word;
        });
        setTimeout(() => {
            if (!this.selectedWord) {
                this.onSelect(WordChoice.THREE);
            }
            this.dialogRef.close();
        }, 7000);
    }
}
