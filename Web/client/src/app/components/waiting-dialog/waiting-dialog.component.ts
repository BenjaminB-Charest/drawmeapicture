import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { GameDifficulty } from 'src/app/enums/game-difficulty';
import { Tools } from 'src/app/enums/tools';
import { UserService } from 'src/app/services/server/user.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
import { ToolSelectorService } from 'src/app/services/tools-selector/tool-selector.service';

@Component({
    selector: 'app-waiting-dialog',
    templateUrl: './waiting-dialog.component.html',
    styleUrls: ['./waiting-dialog.component.scss'],
})
export class WaitingDialogComponent {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    difficultyList: typeof GameDifficulty = GameDifficulty;
    isWaiting: boolean = false;

    constructor(
        private soloSprintEngineService: SoloSprintEngineService,
        private dialogRef: MatDialogRef<WaitingDialogComponent>,
        private router: Router,
        private userService: UserService,
        private toolSelector: ToolSelectorService,
    ) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }

    createGame(difficulty: GameDifficulty): void {
        this.isWaiting = true;
        localStorage.setItem('mode', 'solo');
        this.toolSelector.setCurrentTool(Tools.Info);
        this.soloSprintEngineService.createGame(difficulty).then(() => {
            this.dialogRef.close();
            this.router.navigateByUrl('/dessin');
            this.isWaiting = false;
        });
    }
}
