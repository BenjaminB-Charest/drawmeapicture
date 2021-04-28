import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Image } from '../../interfaces/image';
import { UserService } from '../server/user.service';
import { ToolSelectorService } from '../tools-selector/tool-selector.service';

@Injectable({
    providedIn: 'root',
})
export class WordImagePairService {
    hints: string[];
    nameForm: FormGroup;
    difficulty: FormGroup;
    wordImagePairInfo: Image;
    wordImagePair: BehaviorSubject<Image>;
    isOnAccelerateSubject: BehaviorSubject<boolean>;
    isOnAccelerate: boolean;

    constructor(formBuilder: FormBuilder, private userService: UserService, private toolSelector: ToolSelectorService) {
        this.hints = [];
        this.isOnAccelerate = false;
        this.nameForm = formBuilder.group({});
        this.difficulty = formBuilder.group({});
        this.wordImagePair = new BehaviorSubject<Image>({} as Image);
        this.isOnAccelerateSubject = new BehaviorSubject<boolean>(false);
    }

    sendOnAccelerate(): void {
        this.toolSelector.getPencil().isPlayerDrawing = false;
        this.isOnAccelerate = true;
        this.isOnAccelerateSubject.next(this.isOnAccelerate);
    }

    setFields(nameForm: FormGroup, hints: string[], difficulty: FormGroup): void {
        this.nameForm = nameForm;
        this.hints = hints;
        this.difficulty = difficulty;
        this.createWordImagePairInfo();
    }

    private createWordImagePairInfo(): void {
        this.wordImagePairInfo = {
            id: '',
            authorId: this.userService.currentUser.username,
            word: this.nameForm.get('name')?.value,
            hints: this.hints,
            difficulty: this.difficulty.get('difficulty')?.value,
            paths: [],
        } as Image;
        this.wordImagePair.next(this.wordImagePairInfo);
    }
}
