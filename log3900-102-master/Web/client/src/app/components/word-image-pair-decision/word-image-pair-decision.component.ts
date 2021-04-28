import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { CreateNewService } from 'src/app/services/create-new/create-new.service';
import { InstructionsStackService } from 'src/app/services/instructions-stack/instructions-stack.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { UserService } from 'src/app/services/server/user.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';
import { WordImagePairService } from 'src/app/services/word-image-pair/word-image-pair.service';

@Component({
    selector: 'app-word-image-pair-decision',
    templateUrl: './word-image-pair-decision.component.html',
    styleUrls: ['./word-image-pair-decision.component.scss'],
})
export class WordImagePairDecisionComponent implements OnInit, OnDestroy {
    avatar: string;
    doneIsDisabled: boolean;
    private stackLengthSubscription: Subscription;
    avatarDictionary: AvatarDictionary;
    constructor(
        private router: Router,
        private snackBar: MatSnackBar,
        private userService: UserService,
        public createNewService: CreateNewService,
        private toolSelector: ToolSelectorService,
        private fireBaseapiService: FirebaseApiService,
        public wordImagePairService: WordImagePairService,
        public instructionStackService: InstructionsStackService,
    ) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    onAccelerate(): void {
        this.toolSelector.getPencil().isPlayerDrawing = false;
        this.instructionStackService.isReplaying = true;
        this.createNewService.resetCanvas();
        this.wordImagePairService.sendOnAccelerate();
    }

    OnEdit(): void {
        this.toolSelector.getPencil().isPlayerDrawing = true;
        this.wordImagePairService.isOnAccelerateSubject.next(false);
        this.instructionStackService.isDoneSubject.next(false);
    }

    onDone(): void {
        this.toolSelector.getPencil().isPlayerDrawing = false;
        this.instructionStackService.isDoneSubject.next(false);
        this.wordImagePairService.isOnAccelerateSubject.next(false);
        this.fireBaseapiService.saveImage(this.wordImagePairService.wordImagePairInfo, this.instructionStackService.getProcessedStack());
        this.instructionStackService.clearInstructions();
        localStorage.setItem('mode', 'menu');
        this.snackBar.open('Created!', 'Success', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'left' });
        this.router.navigateByUrl('/home');
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.stackLengthSubscription = this.instructionStackService.stackLengthSubject.subscribe(length => {
            this.doneIsDisabled = length === 0 ? true : false;
        });
    }

    ngOnDestroy(): void {
        this.stackLengthSubscription.unsubscribe();
    }
}
