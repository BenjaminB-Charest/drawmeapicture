import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { UserService } from 'src/app/services/server/user.service';
import { CreateNewLobbyComponent } from '../create-new-lobby/create-new-lobby.component';
import { JoinLobbyComponent } from '../join-lobby/join-lobby.component';

@Component({
    selector: 'app-classic-mode-decision',
    templateUrl: './classic-mode-decision.component.html',
    styleUrls: ['./classic-mode-decision.component.scss'],
})
export class ClassicModeDecisionComponent implements OnInit {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    constructor(private userService: UserService, private dialog: MatDialog) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    openCreateGameDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '95px', left: '542px' };
        this.dialog.open(CreateNewLobbyComponent, dialogConfig);
    }

    openJoinLobbyDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '651px';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '95px', left: '387px' };
        this.dialog.open(JoinLobbyComponent, dialogConfig);
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
