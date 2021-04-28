import { Component } from '@angular/core';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { BadgeNameDictionary } from 'src/app/classes/badge-name-dictionary';
import { GameModes } from 'src/app/enums/game-modes';
import { GameStates } from 'src/app/enums/game-states';
import { PlayerPositions } from 'src/app/enums/player-positions';
import { PlayerStates } from 'src/app/enums/player-states';
import { Game } from 'src/app/interfaces/game';
import { SoloGame } from 'src/app/interfaces/solo-game';
import { LobbyService } from 'src/app/services/create-new-lobby/lobby.service';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { UserService } from 'src/app/services/server/user.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
// tslint:disable: deprecation

export interface Participant {
    name: string;
    points: number;
    team: string;
    role: string;
    avatar: string;
    position: number;
    badges: string[];
    badgesDescription: string[];
}

@Component({
    selector: 'app-game-info',
    templateUrl: './game-info.component.html',
    styleUrls: ['./game-info.component.scss'],
})
export class GameInfoComponent {
    // Classic mode attributes
    actualGameMode: string;
    participants: Participant[];
    avatarDictionary: AvatarDictionary;
    badgeDictionary: BadgeDictionary;
    badgeNameDictionary: BadgeNameDictionary;
    robotMood: string[] = [];

    // Common attributes
    currentRound: number;
    gameMode: string;
    isGuessing: boolean;

    // Solo mode attribute
    name: string;
    avatar: string;
    score: number;
    guessesLeft: number;
    badges: string[];
    badgesName: string[] = [];

    constructor(
        public gameEngineService: GameEngineService,
        private userService: UserService,
        public soloSprintEngineService: SoloSprintEngineService,
        public lobbyService: LobbyService,
    ) {
        this.avatarDictionary = new AvatarDictionary();
        this.badgeDictionary = new BadgeDictionary();
        this.badgeNameDictionary = new BadgeNameDictionary();
        this.actualGameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';

        if (this.actualGameMode === 'classic') {
            this.participants = [];
            this.isGuessing = false;

            this.gameEngineService.$game.subscribe((game: Game) => {
                this.participants = [];
                this.gameMode = this.getMode(game.mode);
                this.currentRound = game.round + 1;
                for (const [player, position] of game.players.entries()) {
                    const badgeList = gameEngineService.firebaseAPI.userBadges.getValue().get(player) as string[];
                    this.participants.push({
                        name: player,
                        points: game.scores.get(player) as number,
                        team: this.getTeam(position),
                        role: this.getRole(player, game),
                        avatar: this.avatarDictionary.avatarMap.get(
                            gameEngineService.firebaseAPI.userAvatars.getValue().get(player) as string,
                        ) as string,
                        position,
                        badges: [
                            this.badgeDictionary.badgeMap.get(badgeList[0]) as string,
                            this.badgeDictionary.badgeMap.get(badgeList[1]) as string,
                            this.badgeDictionary.badgeMap.get(badgeList[2]) as string,
                        ],
                        badgesDescription: [
                            this.badgeNameDictionary.badgeNameMap.get(badgeList[0]) as string,
                            this.badgeNameDictionary.badgeNameMap.get(badgeList[1]) as string,
                            this.badgeNameDictionary.badgeNameMap.get(badgeList[2]) as string,
                        ],
                    });
                }
                this.participants.sort((a: Participant, b: Participant) => {
                    return a.position - b.position;
                });
            });

            this.gameEngineService.$isGuessing.subscribe((isGuessing: boolean) => {
                this.isGuessing = isGuessing;
            });
            this.determineRobotMood();
        } else if (this.actualGameMode === 'solo') {
            this.gameMode = 'Solo Sprint';
            this.isGuessing = true;
            this.name = this.userService.currentUser.username;
            const badgeList = gameEngineService.firebaseAPI.userBadges.getValue().get(this.name) as string[];
            this.badges = [
                this.badgeDictionary.badgeMap.get(badgeList[0]) as string,
                this.badgeDictionary.badgeMap.get(badgeList[1]) as string,
                this.badgeDictionary.badgeMap.get(badgeList[2]) as string,
            ];
            this.badgesName = [
                this.badgeNameDictionary.badgeNameMap.get(badgeList[0]) as string,
                this.badgeNameDictionary.badgeNameMap.get(badgeList[1]) as string,
                this.badgeNameDictionary.badgeNameMap.get(badgeList[2]) as string,
            ];
            this.avatar = this.avatarDictionary.avatarMap.get(
                gameEngineService.firebaseAPI.userAvatars.getValue().get(this.userService.currentUser.username) as string,
            ) as string;
            this.soloSprintEngineService.$game.subscribe((game: SoloGame) => {
                this.score = game.score;
                this.currentRound = game.correctAttempts + 1;
            });
            this.soloSprintEngineService.$remainingGuessesThisRound.subscribe((guesses: number) => {
                this.guessesLeft = guesses;
            });
        }
    }

    // tslint:disable-next-line: cyclomatic-complexity
    private determineRobotMood(): void {
        if (this.actualGameMode === 'solo' || this.actualGameMode === 'wordImagePair') {
            return;
        }
        switch (this.lobbyService.lobbyId[0].toLowerCase()) {
            case 'a':
                this.robotMood.push('Sad');
                break;
            case 'b':
                this.robotMood.push('Sad');
                break;
            case 'c':
                this.robotMood.push('Sad');
                break;
            case 'd':
                this.robotMood.push('Sad');
                break;
            case 'e':
                this.robotMood.push('Sad');
                break;
            case 'f':
                this.robotMood.push('Sad');
                break;
            case 'g':
                this.robotMood.push('Sad');
                break;
            case 'h':
                this.robotMood.push('Sad');
                break;
            case 'i':
                this.robotMood.push('Sad');
                break;
            case 'j':
                this.robotMood.push('Sad');
                break;
            case 'k':
                this.robotMood.push('Sad');
                break;
            case 'l':
                this.robotMood.push('Sad');
                break;
            case 'm':
                this.robotMood.push('Sad');
                break;
            case 'n':
                this.robotMood.push('Arrogant');
                break;
            case 'o':
                this.robotMood.push('Arrogant');
                break;
            case 'p':
                this.robotMood.push('Arrogant');
                break;
            case 'q':
                this.robotMood.push('Arrogant');
                break;
            case 'r':
                this.robotMood.push('Arrogant');
                break;
            case 's':
                this.robotMood.push('Arrogant');
                break;
            case 't':
                this.robotMood.push('Arrogant');
                break;
            case 'u':
                this.robotMood.push('Arrogant');
                break;
            case 'v':
                this.robotMood.push('Arrogant');
                break;
            case 'w':
                this.robotMood.push('Arrogant');
                break;
            case 'x':
                this.robotMood.push('Arrogant');
                break;
            case 'y':
                this.robotMood.push('Arrogant');
                break;
            case 'z':
                this.robotMood.push('Arrogant');
                break;
            default:
                this.robotMood.push('Funny');
        }

        switch (this.lobbyService.lobbyId[0].toLowerCase()) {
            case 'a':
                this.robotMood.push('Arrogant');
                break;
            case 'b':
                this.robotMood.push('Arrogant');
                break;
            case 'c':
                this.robotMood.push('Arrogant');
                break;
            case 'd':
                this.robotMood.push('Arrogant');
                break;
            case 'e':
                this.robotMood.push('Arrogant');
                break;
            case 'f':
                this.robotMood.push('Arrogant');
                break;
            case 'g':
                this.robotMood.push('Arrogant');
                break;
            case 'h':
                this.robotMood.push('Arrogant');
                break;
            case 'i':
                this.robotMood.push('Arrogant');
                break;
            case 'j':
                this.robotMood.push('Arrogant');
                break;
            case 'k':
                this.robotMood.push('Arrogant');
                break;
            case 'l':
                this.robotMood.push('Arrogant');
                break;
            case 'm':
                this.robotMood.push('Arrogant');
                break;
            case 'n':
                this.robotMood.push('Funny');
                break;
            case 'o':
                this.robotMood.push('Funny');
                break;
            case 'p':
                this.robotMood.push('Funny');
                break;
            case 'q':
                this.robotMood.push('Funny');
                break;
            case 'r':
                this.robotMood.push('Funny');
                break;
            case 's':
                this.robotMood.push('Funny');
                break;
            case 't':
                this.robotMood.push('Funny');
                break;
            case 'u':
                this.robotMood.push('Funny');
                break;
            case 'v':
                this.robotMood.push('Funny');
                break;
            case 'w':
                this.robotMood.push('Funny');
                break;
            case 'x':
                this.robotMood.push('Funny');
                break;
            case 'y':
                this.robotMood.push('Funny');
                break;
            case 'z':
                this.robotMood.push('Funny');
                break;
            default:
                this.robotMood.push('Sad');
        }
    }

    getMode(mode: GameModes): string {
        switch (mode) {
            case GameModes.Solo_Sprint:
                return 'Solo Sprint';
            case GameModes.Coop_Sprint:
                return 'Coop Sprint';
            default:
                return 'Classic';
        }
    }

    getTeam(position: PlayerPositions): string {
        switch (position) {
            case PlayerPositions.A1:
            case PlayerPositions.A2:
                return 'A';
            default:
                return 'B';
        }
    }

    getRole(player: string, game: Game): string {
        const currentRole = game.roles.get(player) as PlayerStates;
        const currentPosition = game.players.get(player) as PlayerPositions;

        if (currentRole === PlayerStates.DrawingPlayer || currentRole === PlayerStates.DrawingRobot) {
            return 'Drawing';
        } else if (
            game.state === GameStates.DrawAndGuessFirst &&
            this.gameEngineService.getRole(game.mode, game.round, currentPosition) === PlayerStates.GuessingFirst
        ) {
            return 'Guessing';
        } else if (
            game.state === GameStates.DrawAndGuessSecond &&
            this.gameEngineService.getRole(game.mode, game.round, currentPosition) === PlayerStates.GuessingSecond
        ) {
            return 'Guessing';
        } else {
            return 'Waiting';
        }
    }

    getHint(): void {
        if (this.actualGameMode === 'classic') {
            this.gameEngineService.getHint();
        } else if (this.actualGameMode === 'solo') {
            this.soloSprintEngineService.getHint();
        }
    }
}
