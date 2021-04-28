import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { BadgeLinkDictionary } from 'src/app/classes/badge-link-dictionary';
import { GameLobbyPlayer } from 'src/app/classes/game-lobby-player';
import { LobbyEmptyPlayer } from 'src/app/classes/lobby-empty-player';
import { LobbyRobot } from 'src/app/classes/lobby-robot';
import { Profile } from 'src/app/classes/profile';
import { GameDifficulty } from 'src/app/enums/game-difficulty';
import { GameModes } from 'src/app/enums/game-modes';
import { PlayerPositions } from 'src/app/enums/player-positions';
import { Team } from 'src/app/enums/team.enum';
import { Lobby } from 'src/app/interfaces/lobby';
import { LobbyService } from 'src/app/services/create-new-lobby/lobby.service';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { GameLobbyService } from 'src/app/services/game-lobby/game-lobby.service';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { UserService } from 'src/app/services/server/user.service';
import { TutorialComponent } from '../tutorial/tutorial.component';
// import { ChatService } from 'src/app/services/chat/chat.service';

// tslint:disable: deprecation
@Component({
    selector: 'app-game-lobby',
    templateUrl: './game-lobby.component.html',
    styleUrls: ['./game-lobby.component.scss'],
})
export class GameLobbyComponent implements OnInit, OnDestroy {
    id: string;
    name: string;
    shareKey: string;
    playerName: string;
    playerAvatar: string;
    chatIsOpen: boolean;
    mode: GameModes;
    musicOn = true;
    privacy: string;
    fromCreateLobby: boolean;
    teamA: GameLobbyPlayer[];
    teamB: GameLobbyPlayer[];
    slotA1: GameLobbyPlayer = new LobbyEmptyPlayer();
    slotA2: GameLobbyPlayer = new LobbyEmptyPlayer();
    slotB1: GameLobbyPlayer = new LobbyEmptyPlayer();
    slotB2: GameLobbyPlayer = new LobbyEmptyPlayer();
    difficulty: GameDifficulty;
    shouldAddRobotForA: boolean;
    shouldAddRobotForB: boolean;
    playerMap: Map<string, PlayerPositions>;
    lobbyMusic: HTMLAudioElement;

    activeLobby: Lobby;
    isOrganized: boolean;
    isHost = false;
    isReadyToStart = false;
    isWaiting = false;

    lobbySubscription: Subscription;
    private avatarDictionary: AvatarDictionary;
    private badgeDictionary: BadgeDictionary;
    badgeNameDictionary: BadgeLinkDictionary = new BadgeLinkDictionary();

    constructor(
        private lobbyService: LobbyService,
        public gameLobbyService: GameLobbyService,
        private userService: UserService,
        private firebaseAPI: FirebaseApiService,
        private router: Router,
        private dialogRef: MatDialogRef<GameLobbyComponent>,
        private musicPlayer: MusicPlayerService,
        // private chatService: ChatService,
        private gameEngine: GameEngineService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private musicService: MusicPlayerService,
    ) {
        this.startMusic();
        this.musicOn = this.userService.currentUser.toggleMusic;
        this.playerMap = new Map<string, PlayerPositions>();
        this.teamA = [];
        this.teamA.push(this.slotA1, this.slotA2);
        this.teamB = [];
        this.teamB.push(this.slotB1, this.slotB2);
        this.id = this.lobbyService.lobbyId;
        this.fromCreateLobby = gameLobbyService.fromCreateLobby;
        if (this.fromCreateLobby) {
            this.name = this.lobbyService.lobbyInfos.name;
            this.mode = this.lobbyService.lobbyInfos.mode;
            this.privacy = this.lobbyService.lobbyInfos.privacy;
            this.difficulty = this.lobbyService.lobbyInfos.difficulty;
        }
        this.userService.getProfile();
        this.firebaseAPI.getLobby(this.lobbyService.lobbyId);
        this.avatarDictionary = new AvatarDictionary();
        this.badgeDictionary = new BadgeDictionary();
        this.shouldAddRobotForA = this.teamA.length > 2 ? false : true;
        this.shouldAddRobotForB = this.teamB.length > 2 ? false : true;
    }

    toggleMusic(): void {
        this.musicOn = !this.musicOn;
        this.userService.musicToggled.next(this.musicOn);
        if (this.musicOn) {
            this.musicService.playMusic('assets/sounds/1 Min Music - Walkout.mp3');
        } else {
            this.musicService.stopMusic();
        }
    }

    addRobot(team: string, fromClick?: boolean): void {
        switch (team) {
            case Team.A:
                this.teamA[1] = new LobbyRobot('Alice [Robot]', Team.A);
                if (fromClick) {
                    this.firebaseAPI.addPlayerToLobby(this.activeLobby.id, 0, 'Alice [Robot]');
                }
                this.shouldAddRobotForA = false;
                break;
            case Team.B:
                this.teamB[1] = new LobbyRobot('Bob [Robot]', Team.B);
                if (fromClick) {
                    this.firebaseAPI.addPlayerToLobby(this.activeLobby.id, 1, 'Bob [Robot]');
                }
                this.shouldAddRobotForB = false;
                break;
        }
        this.evaluateMode();
        this.evaluateStartGame();
    }

    removeRobot(team: string): void {
        switch (team) {
            case Team.A:
                this.teamA[1] = new LobbyEmptyPlayer();
                this.firebaseAPI.removePlayerFromLobby(this.activeLobby.id, 'Alice [Robot]');
                this.shouldAddRobotForA = true;
                break;
            case Team.B:
                this.teamB[1] = new LobbyEmptyPlayer();
                this.firebaseAPI.removePlayerFromLobby(this.activeLobby.id, 'Bob [Robot]');
                this.shouldAddRobotForB = true;
                break;
        }
        this.evaluateMode();
        this.evaluateStartGame();
    }

    addPlayer(username: string, value: number): void {
        this.firebaseAPI.getOtherUserProfile(username).then((user: Profile) => {
            const player = this.createGameLobbyPlayer(this.avatarDictionary.avatarMap.get(user.avatar) as string, username, user.selectedBadges);
            this.assignToProperSlot(value, player);
            this.evaluateMode();
        });
    }

    createGameLobbyPlayer(avatar: string, username: string, badgeList: string[]): GameLobbyPlayer {
        return new GameLobbyPlayer(
            username,
            [
                this.badgeDictionary.badgeMap.get(badgeList[0]) as string,
                this.badgeDictionary.badgeMap.get(badgeList[1]) as string,
                this.badgeDictionary.badgeMap.get(badgeList[2]) as string,
            ],
            avatar,
        );
    }

    assignToProperSlot(position: PlayerPositions, player: GameLobbyPlayer): void {
        switch (position) {
            case PlayerPositions.A1:
                this.teamA[1] = player; // A1
                break;
            case PlayerPositions.B1:
                this.teamB[1] = player; // B1
                break;
            case PlayerPositions.A2:
                this.teamA[0] = player; // A2
                break;
            case PlayerPositions.B2:
                this.teamB[0] = player; // B2
                break;
        }
        this.evaluateStartGame();
    }

    evaluateStartGame(): void {
        for (let i = 0; i < 2; i++) {
            if (this.teamA[i].name.includes('No Player') || this.teamB[i].name.includes('No Player')) {
                this.isReadyToStart = false;
                return;
            }
        }
        this.isReadyToStart = true;
    }

    processPlayer(team: Team, key: string, value: number): void {
        if (!key.includes('[Robot]')) {
            this.addPlayer(key, value);
        } else {
            this.addRobot(team);
        }
    }

    quitLobby(): void {
        this.musicPlayer.stopMusic();
        this.activeLobby = {} as Lobby;
        const host = this.firebaseAPI.activeLobby.getValue().host;
        const id = this.firebaseAPI.activeLobby.getValue().id;
        this.firebaseAPI.activeLobby.next({} as Lobby);
        this.musicPlayer.playMusic('assets/sounds/action_music.mp3');
        this.firebaseAPI.lobbySubscription.unsubscribe();
        this.lobbySubscription.unsubscribe();
        this.firebaseAPI.removeChannel(this.shareKey);
        if (host === localStorage.getItem('username')) {
            this.firebaseAPI.deleteLobby(id);
            this.activeLobby = {} as Lobby;
        } else {
            this.firebaseAPI.quitLobby(id);
            this.activeLobby = {} as Lobby;
            this.snackBar.open('Player has left lobby', 'OK', { duration: 2000, verticalPosition: 'bottom', horizontalPosition: 'left' });
        }
        this.dialogRef.close();
    }

    evaluateMode(): void {
        if (this.teamB[1] === undefined || this.teamA[1] === undefined) {
            return;
        }
        if (this.teamA[1].isVP) {
            if (this.teamB[1].isVP) {
                this.mode = GameModes.Classic_RPvRP;
            } else {
                this.mode = GameModes.Classic_RPvPP;
            }
        } else {
            if (this.teamB[1].isVP) {
                this.mode = GameModes.Classic_PPvRP;
            } else {
                this.mode = GameModes.Classic_PPvPP;
            }
        }
    }

    ngOnInit(): void {
        this.lobbySubscription = this.firebaseAPI.activeLobby.subscribe(lobby => {
            this.activeLobby = {
                host: lobby.host,
                id: lobby.id,
                gameId: lobby.gameId,
            } as Lobby;
            if (lobby.host !== '') {
                this.shareKey = lobby.shareKey;
                this.name = lobby.name;
                this.mode = lobby.mode;
                this.chatIsOpen = false;
                this.difficulty = lobby.difficulty;
                this.playerAvatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
                this.playerName = this.userService.currentUser.username;
                this.setPrivacy(lobby.isPublic);
                if (lobby.gameId === undefined || lobby.gameId === '') {
                    this.resetPlayers();
                    this.changePlayers(lobby);
                } else {
                    this.gameEngine.startGame(lobby.gameId, lobby.shareKey);
                    localStorage.setItem('mode', 'classic');
                    this.dialogRef.close();
                    this.router.navigateByUrl('/dessin');
                    this.isWaiting = false;
                    this.lobbySubscription.unsubscribe();
                    this.firebaseAPI.activeLobby.next({} as Lobby);
                }
                this.isHost = (localStorage.getItem('username') as string) === lobby.host ? true : false;
            } else {
                this.quitLobby();
            }
        });
    }

    resetPlayers(): void {
        this.teamA[0] = new LobbyEmptyPlayer();
        this.teamB[0] = new LobbyEmptyPlayer();
        this.teamA[1] = new LobbyEmptyPlayer();
        this.teamB[1] = new LobbyEmptyPlayer();
    }

    changePlayers(lobby: Lobby): void {
        if (lobby.players !== undefined) {
            for (const [key, value] of Object.entries(lobby.players)) {
                if (value % 2 === 0) {
                    this.processPlayer(Team.A, key, value);
                } else {
                    this.processPlayer(Team.B, key, value);
                }
            }
        }
    }

    setPrivacy(isPublic: boolean): void {
        if (isPublic) {
            this.privacy = 'Public';
        } else {
            this.privacy = 'Private';
        }
    }

    createMap(): void {
        this.isWaiting = true;
        this.playerMap.set(this.teamA[1].name, PlayerPositions.A1);
        this.playerMap.set(this.teamA[0].name, PlayerPositions.A2);
        this.playerMap.set(this.teamB[1].name, PlayerPositions.B1);
        this.playerMap.set(this.teamB[0].name, PlayerPositions.B2);
        this.firebaseAPI.updateLobbyBeforeStart(this.playerMap, this.mode, this.lobbyService.lobbyId).then(() => {});
    }

    startMusic(): void {
        this.musicPlayer.playMusic('assets/sounds/1 Min Music - Walkout.mp3');
    }

    openTutorialDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = '637px';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '65px', left: '429px' };
        this.dialog.open(TutorialComponent, dialogConfig);
    }

    ngOnDestroy(): void {
        this.lobbySubscription.unsubscribe();
    }
}
