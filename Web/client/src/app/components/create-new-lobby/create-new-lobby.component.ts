import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatRadioButton } from '@angular/material/radio';
import { MatSelect } from '@angular/material/select';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { LobbyService } from 'src/app/services/create-new-lobby/lobby.service';
import { GameLobbyService } from 'src/app/services/game-lobby/game-lobby.service';
import { UserService } from 'src/app/services/server/user.service';
import { GameLobbyComponent } from '../game-lobby/game-lobby.component';

@Component({
    selector: 'app-create-new-lobby',
    templateUrl: './create-new-lobby.component.html',
    styleUrls: ['./create-new-lobby.component.scss'],
    styles: ['::ng-deep .cdk-overlay-backdrop{right:304px;}'],
})
export class CreateNewLobbyComponent implements OnInit {
    avatar: string;
    userName: string;
    name: FormControl;
    lobbyForm: FormGroup;
    private mode: FormControl; // 'PPvPP' or 'RPvPP' or 'PPvRP' or 'RPvRP' or 'Coop_Sprint'
    private privacy: FormControl; // 'Public' or 'Private'
    private difficulty: FormControl; // 'easy' or 'normal' or 'hard'
    avatarDictionary: AvatarDictionary;
    isWaiting: boolean = false;

    lobbyNameisEmpty: boolean;
    constructor(
        formBuilder: FormBuilder,
        public dialog: MatDialog,
        private gameLobbyService: GameLobbyService,
        private lobbyService: LobbyService,
        private userService: UserService,
    ) {
        this.name = new FormControl('', [Validators.required, Validators.maxLength(15)]);
        this.mode = new FormControl('PPvPP', [Validators.required]);
        this.privacy = new FormControl('', [Validators.required]);
        this.difficulty = new FormControl('', [Validators.required]);

        this.lobbyForm = formBuilder.group({
            name: this.name,
            privacy: this.privacy,
            mode: this.mode,
            difficulty: this.difficulty,
        });
    }

    onPrivacyChange(event: MatRadioButton): void {
        this.privacy.setValue(event.value);
    }

    onModeChange(event: MatSelect): void {
        this.mode.setValue(event.value);
    }

    onDifficultyChange(event: MatSelect): void {
        this.difficulty.setValue(event.value);
    }

    onCreate(): void {
        if (this.name.value.trim() === '') {
            this.lobbyNameisEmpty = true;
            return;
        }
        this.isWaiting = true;
        this.lobbyService.setLobbyInformations(this.lobbyForm).then(() => {
            this.dialog.closeAll();
            this.gameLobbyService.setFromCreateLobby(true);
            this.openGameLobbyDialog();
            this.isWaiting = false;
        });
    }

    openGameLobbyDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '66px', left: '360px' };
        this.dialog.open(GameLobbyComponent, dialogConfig);
    }

    ngOnInit(): void {
        this.lobbyNameisEmpty = false;
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
        this.userName = this.userService.currentUser.username;
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
