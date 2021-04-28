import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { JoinLobbyGameModeService } from 'src/app/services/join-lobby-game-mode/join-lobby-game-mode.service';
import { UserService } from 'src/app/services/server/user.service';
import { JoinLobbyComponent } from '../join-lobby/join-lobby.component';

@Component({
    selector: 'app-join-lobby-game-mode',
    templateUrl: './join-lobby-game-mode.component.html',
    styleUrls: ['./join-lobby-game-mode.component.scss'],
})
export class JoinLobbyGameModeComponent implements OnInit {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    constructor(private joinLobbyGameModeService: JoinLobbyGameModeService, public dialog: MatDialog, private userService: UserService) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    onClick(mode: string): void {
        this.joinLobbyGameModeService.setGameMode(mode);
        this.openJoinLobbyDialog();
    }

    openJoinLobbyDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '90px', left: '80px' };
        this.dialog.open(JoinLobbyComponent, dialogConfig);
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
