import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { EndGameDialogComponent } from 'src/app/components/end-game-dialog/end-game-dialog.component';
import { WarningDialogComponent } from 'src/app/components/warning/warning-dialog.component';
import { GameDifficulty } from 'src/app/enums/game-difficulty';
import { GameModes } from 'src/app/enums/game-modes';
import { GameStates } from 'src/app/enums/game-states';
import { PlayerPositions } from 'src/app/enums/player-positions';
import { PlayerStates } from 'src/app/enums/player-states';
import { Game } from 'src/app/interfaces/game';
import { Image } from 'src/app/interfaces/image';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { POSITIONS_PPvPP, POSITIONS_PPvRP, POSITIONS_RPvPP, POSITIONS_RPvRP } from '../../enums/positions-by-round';
import { ChatService } from '../chat/chat.service';
import { CreateNewService } from '../create-new/create-new.service';
// tslint:disable: no-non-null-assertion
// tslint:disable: deprecation
const GAMES_COLLECTION = 'games';
const DRAWINGS_LIBRARY_COLLECTION = 'drawings-library';
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

@Injectable({
    providedIn: 'root',
})
export class GameEngineService implements OnDestroy {
    $game: BehaviorSubject<Game>;
    $currentImage: BehaviorSubject<Image>;
    $isDrawing: BehaviorSubject<boolean>;
    $isGuessing: BehaviorSubject<boolean>;
    $timer: BehaviorSubject<string>;
    $wordToGuess: BehaviorSubject<string>;
    $hintsLeft: BehaviorSubject<number>;
    tutorialShouldCloseSubject: BehaviorSubject<boolean>;

    currentPlayer: string;
    isHost: boolean;
    lastHint: string;
    isUpdatingTime: boolean;
    hasGameEnded: boolean;
    gameEnded: BehaviorSubject<boolean>;
    canvasCanReset: boolean;
    timerInterval: NodeJS.Timeout;
    stopDrawing: BehaviorSubject<boolean>;
    imageChoice: BehaviorSubject<Image[]>;
    canOpenChoice: BehaviorSubject<boolean>;
    imageList: Image[];
    usedWords: string[];

    chatShareKey: string;
    gameSubscription: Subscription;

    constructor(
        private firestore: AngularFirestore,
        private http: HttpClient,
        public firebaseAPI: FirebaseApiService,
        private createNewService: CreateNewService,
        private chatService: ChatService,
        private matSnackBar: MatSnackBar,
        public router: Router,
        protected dialog: MatDialog,
    ) {
        this.initializeValues();
        this.imageChoice = new BehaviorSubject<Image[]>([]);
    }

    startGame(gameId: string, shareKey: string): void {
        this.resetValues();
        this.chatShareKey = shareKey;
        this.createNewService.resetCanvas();
        this.firebaseAPI.setStroke(gameId);
        this.getGame(gameId);
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    ngOnDestroy(): void {
        this.gameSubscription.unsubscribe();
    }

    initializeValues(): void {
        this.currentPlayer = localStorage.getItem('username') as string;
        this.isHost = false;
        this.canvasCanReset = true;
        this.gameEnded = new BehaviorSubject<boolean>(false);
        this.stopDrawing = new BehaviorSubject<boolean>(false);
        this.canOpenChoice = new BehaviorSubject<boolean>(true);
        this.tutorialShouldCloseSubject = new BehaviorSubject<boolean>(false);
        this.imageChoice = new BehaviorSubject<Image[]>([]);
        this.usedWords = [];
        this.$game = new BehaviorSubject<Game>({
            id: '',
            host: '',
            currentImageId: '',
            mode: GameModes.Classic_PPvPP,
            state: GameStates.GameStart,
            difficulty: GameDifficulty.Normal,
            round: 0,
            start: new Date(),
            nextEvent: new Date('Jan 01 2021 00:00:00'),
            players: new Map<string, PlayerPositions>(),
            roles: new Map<string, PlayerStates>(),
            scores: new Map<string, number>(),
            users: [],
        });
        this.$currentImage = new BehaviorSubject<Image>({
            id: '',
            authorId: '',
            word: '',
            difficulty: GameDifficulty.Normal,
            hints: [],
            paths: [],
        });
        this.$isDrawing = new BehaviorSubject<boolean>(false);
        this.$isGuessing = new BehaviorSubject<boolean>(false);
        this.$timer = new BehaviorSubject<string>('00:00');
        this.$wordToGuess = new BehaviorSubject<string>('house');
        this.$hintsLeft = new BehaviorSubject<number>(0);
        this.lastHint = '';
        this.isUpdatingTime = false;
    }

    resetValues(): void {
        this.currentPlayer = localStorage.getItem('username') as string;
        this.isHost = false;
        this.canvasCanReset = true;
        this.gameEnded.next(false);
        this.stopDrawing.next(false);
        this.canOpenChoice.next(true);
        this.imageChoice.next([]);
        this.usedWords = [];
        this.$game.next({
            id: '',
            host: '',
            currentImageId: '',
            mode: GameModes.Classic_PPvPP,
            state: GameStates.GameStart,
            difficulty: GameDifficulty.Normal,
            round: 0,
            start: new Date(),
            nextEvent: new Date('Jan 01 2021 00:00:00'),
            players: new Map<string, PlayerPositions>(),
            roles: new Map<string, PlayerStates>(),
            scores: new Map<string, number>(),
            users: [],
        });
        this.$currentImage.next({
            id: '',
            authorId: '',
            word: '',
            difficulty: GameDifficulty.Normal,
            hints: [],
            paths: [],
        });
        this.$isDrawing.next(false);
        this.$isGuessing.next(false);
        this.$timer.next('00:00');
        this.$wordToGuess.next('house');
        this.$hintsLeft.next(0);
        this.lastHint = '';
        this.isUpdatingTime = false;
    }

    getGame(gameId: string): void {
        this.gameSubscription = this.firestore
            .collection(GAMES_COLLECTION)
            .doc(gameId)
            .snapshotChanges()
            // tslint:disable-next-line: cyclomatic-complexity
            .subscribe(valeur => {
                const data = valeur.payload.data() as any;

                // Convert Firestore objects to Maps
                const players = data!.players;
                const playersMap = new Map<string, PlayerPositions>();
                for (const player of Object.keys(players)) {
                    playersMap.set(player, players[player] as PlayerPositions);
                }

                const scores = data!.scores;
                const scoresMap = new Map<string, number>();
                for (const player of Object.keys(scores)) {
                    scoresMap.set(player, scores[player] as number);
                }

                const roles = data!.roles;
                const rolesMap = new Map<string, PlayerStates>();
                for (const player of Object.keys(roles)) {
                    rolesMap.set(player, roles[player] as PlayerStates);
                }

                const game = {
                    id: gameId,
                    difficulty: data!.difficulty,
                    currentImageId: data!.currentImageId,
                    host: data!.host,
                    mode: data!.mode,
                    nextEvent: data!.nextEvent.toDate(),
                    players: playersMap,
                    roles: rolesMap,
                    scores: scoresMap,
                    start: data!.start.toDate(),
                    state: data!.state,
                    round: data!.round,
                    users: data!.users,
                } as Game;

                this.getImage(game.currentImageId);
                this.isHost = game.host === this.currentPlayer;

                const currentRole = game.roles.get(this.currentPlayer)!;
                this.$isDrawing.next(currentRole === PlayerStates.DrawingPlayer);

                const currentPosition = game.players.get(this.currentPlayer)!;
                if (
                    game.state === GameStates.DrawAndGuessFirst &&
                    this.getRole(game.mode, game.round, currentPosition) === PlayerStates.GuessingFirst
                ) {
                    this.$isGuessing.next(true);
                } else if (
                    game.state === GameStates.DrawAndGuessSecond &&
                    this.getRole(game.mode, game.round, currentPosition) === PlayerStates.GuessingSecond
                ) {
                    this.$isGuessing.next(true);
                } else {
                    this.$isGuessing.next(false);
                }

                if (game.state === GameStates.DrawAndGuessFirst && this.canvasCanReset) {
                    this.canvasCanReset = false;
                } else if (game.state === GameStates.DrawAndGuessFirstWon) {
                    this.usedWords.push(this.$currentImage.getValue().word);
                    this.canvasCanReset = true;
                }

                if (game.state === GameStates.DrawAndGuessSecond && this.canvasCanReset) {
                    this.canvasCanReset = false;
                } else if (game.state === GameStates.DrawAndGuessSecondWon) {
                    this.usedWords.push(this.$currentImage.getValue().word);
                    this.canvasCanReset = true;
                }

                if (game.state === GameStates.NoneHasGuessed) {
                    this.usedWords.push(this.$currentImage.getValue().word);
                    this.canvasCanReset = true;
                }

                if (game.state === GameStates.GameEnd) {
                    this.gameEnded.next(true);
                    const end = this.dialog.open(EndGameDialogComponent, {
                        width: 'auto',
                        height: 'auto',
                        disableClose: true,
                        data: game as Game,
                    });
                    this.tutorialShouldCloseSubject.next(true);
                    end.afterClosed().subscribe((result) => {
                        this.gameSubscription.unsubscribe();
                        this.chatService.quitChannel(this.chatShareKey);
                        clearInterval(this.timerInterval);
                        localStorage.setItem('mode', 'menu');
                        this.router.navigateByUrl('/home');
                    });
                }
                this.$game.next(game);
            });
    }

    getImage(imageId: string): void {
        this.firestore
            .collection(DRAWINGS_LIBRARY_COLLECTION)
            .doc(imageId)
            .snapshotChanges()
            .subscribe(valeur => {
                const image = valeur.payload.data() as Image;
                this.$wordToGuess.next(image.word);
                this.$hintsLeft.next(image.hints.length);
                this.$currentImage.next(image);
            });
    }

    getRole(mode: GameModes, round: number, position: PlayerPositions): PlayerStates {
        switch (mode) {
            case GameModes.Classic_PPvPP:
                return POSITIONS_PPvPP[position][round];
            case GameModes.Classic_RPvPP:
                return POSITIONS_RPvPP[position][round];
            case GameModes.Classic_PPvRP:
                return POSITIONS_PPvRP[position][round];
            case GameModes.Classic_RPvRP:
                return POSITIONS_RPvRP[position][round];
        }
        return PlayerStates.Waiting;
    }

    getHint(): void {
        let hint = '';
        if (this.$currentImage.getValue().hints.length > 0) {
            hint = this.$currentImage.getValue().hints.pop() as string;
        }
        this.$hintsLeft.next(this.$currentImage.getValue().hints.length);
        if (hint !== '') {
            this.firebaseAPI.addMessage({
                content: this.currentPlayer + " asked for a hint. Here's your hint: " + hint.toUpperCase(),
                senderID: 'Hint',
                timeStamp: Date(),
                channel: this.chatService.$activeChannel.getValue().shareKey,
            });
        }
    }

    guessWord(guess: string): void {
        if (this.$isGuessing.getValue() && this.$game.getValue().id !== '' && this.$currentImage.getValue().word !== '') {
            const wordToGuess = this.$currentImage.getValue().word.toLowerCase();
            let confirmationMessage = '';
            if (guess.toLowerCase() === wordToGuess) {
                this.canOpenChoice.next(true);
            }
            this.shouldStopDrawing(guess);
            this.http
                .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.GUESS_WORD_ENDPOINT, {
                    gameId: this.$game.getValue().id,
                    guesserUsername: this.currentPlayer,
                    word: guess.toLowerCase(),
                })
                .pipe()
                .subscribe(res => {
                    confirmationMessage =
                        guess === wordToGuess
                            ? this.currentPlayer + ' guessed correctly! The word was ' + wordToGuess.toUpperCase()
                            : this.currentPlayer + " didn't guess correctly.";
                    this.firebaseAPI.addMessage({
                        content: confirmationMessage,
                        senderID: '[System]',
                        timeStamp: Date(),
                        channel: this.chatService.$activeChannel.getValue().shareKey,
                    });
                });
        }
    }

    shouldStopDrawing(guess: string): void {
        if (guess.toLowerCase() === this.$currentImage.getValue().word.toLowerCase()) {
            this.stopDrawing.next(true);
        }
    }

    updateTimer(): void {
        const gameId = this.$game.getValue().id;
        if (this.$game.getValue().nextEvent !== new Date('Jan 01 2021 00:00:00') && gameId && gameId !== '') {
            const timeDifference = this.$game.getValue().nextEvent.getTime() - new Date().getTime();
            const secondsToNextEvent = Math.floor((timeDifference / MILLISECONDS_IN_SECOND) % SECONDS_IN_MINUTE);
            const minutesToNextEvent = Math.floor((timeDifference / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE)) % MINUTES_IN_HOUR);
            if (timeDifference >= 0) {
                let timerString = minutesToNextEvent < 10 ? '0' + minutesToNextEvent + ':' : minutesToNextEvent + ':';
                timerString += secondsToNextEvent < 10 ? '0' + secondsToNextEvent : secondsToNextEvent;
                this.$timer.next(timerString);
            } else {
                this.canOpenChoice.next(true);
                if (this.$game.getValue().host === this.currentPlayer &&
                    !this.isUpdatingTime && this.$game.getValue().state !== GameStates.GameEnd) {
                    this.isUpdatingTime = true;
                    this.http
                        .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.TIMER_EXPIRED_ENDPOINT, { gameId })
                        .pipe()
                        .subscribe(res => {
                            this.isUpdatingTime = false;
                        });
                }
            }
        }
    }

    quitGame(): void {
        if (this.$game.getValue().id !== '') {
            const warning = this.dialog.open(WarningDialogComponent, { disableClose: true });
            warning.afterClosed().subscribe(result => {
                if (!result) {
                    this.matSnackBar.open('Quitting game. Please wait...', 'OK', {
                        duration: 3000,
                        horizontalPosition: 'left',
                        verticalPosition: 'bottom',
                    });
                    this.http
                        .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.QUIT_GAME_ENDPOINT, {
                            gameId: this.$game.getValue().id,
                            quitterUsername: this.currentPlayer,
                        })
                        .pipe()
                        .subscribe((res) => {
                            this.chatService.quitChannel(this.chatShareKey);
                            clearInterval(this.timerInterval);
                            localStorage.setItem('mode', 'menu');
                            this.router.navigateByUrl('/home');
                            this.gameSubscription.unsubscribe();
                        });
                }
            });
        }
    }

    quitGameCloseWindow(): void {
        this.firestore
            .collection('games')
            .doc(this.$game.getValue().id)
            .update({
                state: 8,
            });
        this.firebaseAPI.removeChannel(this.chatShareKey);
    }
}
