import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { Team } from 'src/app/enums/team.enum';
import { JoinLobbyGame } from 'src/app/interfaces/join-lobby-game';
import { JoinLobbyPlayer } from 'src/app/interfaces/join-lobby-player';
import { LobbyService } from 'src/app/services/create-new-lobby/lobby.service';
import { GameLobbyService } from 'src/app/services/game-lobby/game-lobby.service';
import { JoinLobbyGameModeService } from 'src/app/services/join-lobby-game-mode/join-lobby-game-mode.service';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { UserService } from 'src/app/services/server/user.service';
import { GameLobbyComponent } from '../game-lobby/game-lobby.component';

@Component({
    selector: 'app-join-lobby',
    templateUrl: './join-lobby.component.html',
    styleUrls: ['./join-lobby.component.scss'],
})
export class JoinLobbyComponent implements OnInit, OnDestroy {
    id: string;
    mode: string;
    avatar: string;
    avatarDictionary: AvatarDictionary;
    games: JoinLobbyGame[];
    difficulty: string = 'normal';
    lobbySubscription: Subscription = new Subscription();
    hasJoinedSubscription: Subscription = new Subscription();
    fullLobbySubscription: Subscription = new Subscription();
    wrongKeySubscription: Subscription = new Subscription();
    updateLobbiesSubscription: Subscription = new Subscription();

    constructor(
        public dialog: MatDialog,
        private userService: UserService,
        private gameLobbyService: GameLobbyService,
        joinLobbyGameModeService: JoinLobbyGameModeService,
        private lobbyService: LobbyService,
        private firebaseAPI: FirebaseApiService,
        private musicPlayer: MusicPlayerService,
        private snackBar: MatSnackBar,
    ) {
        this.games = [];
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
        this.mode = joinLobbyGameModeService.mode;
        this.firebaseAPI.getPublicFilteredLobbies(this.difficulty);
        this.firebaseAPI.updateLobbies.subscribe(val => {
            if (val) {
                this.firebaseAPI.getPublicFilteredLobbies(this.difficulty);
                this.firebaseAPI.updateLobbies.next(false);
            }
        });
        this.firebaseAPI.watchCollectionLobbies();
    }

    joinGame(gameId: string): void {
        this.gameLobbyService.setFromCreateLobby(false);
        this.lobbyService.lobbyId = gameId;
        this.musicPlayer.stopMusic();
        this.firebaseAPI.joinLobby(gameId);
    }

    joinPrivateGame(): void {
        this.firebaseAPI.joinPrivateLobby(this.id);
    }

    shouldBeDisabled(): boolean {
        if (this.id) {
            return this.id.trim() === '' ? true : false;
        } else {
            return true;
        }
    }

    onDifficultyChange(event: MatSelect): void {
        this.difficulty = event.value;
        this.firebaseAPI.getPublicFilteredLobbies(this.difficulty);
    }

    private openLobbyDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '66px', left: '360px' };
        this.dialog.open(GameLobbyComponent, dialogConfig);
    }

    ngOnInit(): void {
        this.firebaseAPI.lobbyFullSubject.next(false);
        this.firebaseAPI.wrongKeySubject.next(false);
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.lobbySubscription = this.firebaseAPI.lobbyList.subscribe(lobbies => {
            this.games = [];
            for (const lobby of lobbies) {
                const playerList = [] as JoinLobbyPlayer[];
                let counter = 0;
                for (const player of Object.keys(lobby.players)) {
                    let teamVal = Team.B;
                    if (counter++ % 2 === 0) {
                        teamVal = Team.A;
                    }
                    playerList.push({
                        username: player,
                        avatar: this.avatarDictionary.avatarMap.get(this.firebaseAPI.userAvatars.getValue().get(player) as string),
                        team: teamVal,
                    } as JoinLobbyPlayer);
                }
                this.games.push({
                    id: lobby.id,
                    name: lobby.name,
                    players: playerList,
                } as JoinLobbyGame);
            }
        });

        this.hasJoinedSubscription = this.firebaseAPI.hasJoinedLobby.subscribe((hasJoined: boolean) => {
            if (hasJoined) {
                this.firebaseAPI.hasJoinedLobby.next(false);
                this.hasJoinedSubscription.unsubscribe();
                this.openLobbyDialog();
            }
        });

        this.fullLobbySubscription = this.firebaseAPI.lobbyFullSubject.subscribe(isFull => {
            if (isFull) {
                debugger;
                this.snackBar.open('Full Lobby', 'Sorry!', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'left' });
            }
        });
        this.wrongKeySubscription = this.firebaseAPI.wrongKeySubject.subscribe(isWrongKey => {
            if (isWrongKey) {
                this.snackBar.open('Wrong Key', 'Sorry!', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'left' });
            }
        });
    }

    ngOnDestroy(): void {
        this.lobbySubscription.unsubscribe();
        this.fullLobbySubscription.unsubscribe();
        this.wrongKeySubscription.unsubscribe();
        this.updateLobbiesSubscription.unsubscribe();
        this.fullLobbySubscription.unsubscribe();
    }
}
