import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import * as CONSTANTS from 'src/app/classes/constants';
import { EndGameSoloComponent } from 'src/app/components/end-game-solo/end-game-solo.component';
import { GameDifficulty } from 'src/app/enums/game-difficulty';
import { SoloGameStates } from 'src/app/enums/solo-game-states';
import { Channel } from 'src/app/interfaces/channel';
import { Image } from 'src/app/interfaces/image';
import { SoloGame } from 'src/app/interfaces/solo-game';
import { ChatService } from '../chat/chat.service';
import { CreateNewService } from '../create-new/create-new.service';
import { FirebaseApiService } from '../server/firebase-api.service';
import { UserService } from '../server/user.service';
// tslint:disable: deprecation
const SOLO_GAMES_COLLECTION = 'solo-games';
const DRAWINGS_LIBRARY_COLLECTION = 'drawings-library';
const CHANNELS_COLLECTION = 'channels';
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

@Injectable({
    providedIn: 'root',
})
export class SoloSprintEngineService implements OnDestroy {
    $game: BehaviorSubject<SoloGame>;
    $timer: BehaviorSubject<string>;
    $hintsLeft: BehaviorSubject<number>;
    $wordToGuess: BehaviorSubject<string>;
    $currentImage: BehaviorSubject<Image>;
    $remainingGuessesThisRound: BehaviorSubject<number>;
    tutorialCloseDialogSubject: BehaviorSubject<boolean>;

    currentPlayer: string;
    hasStarted: boolean;
    gameSubscription: Subscription;
    timerSubscription: Subscription;
    isUpdatingTime: boolean;
    lastHint: string;
    gameEnded: BehaviorSubject<boolean>;
    stopDrawing: BehaviorSubject<boolean>;

    round: number;
    correctGuessesThisRound: number;
    wrongGuessesThisRound: number;
    channelKey: string;

    gameEndTime: Date;

    constructor(
        private http: HttpClient,
        private userService: UserService,
        private router: Router,
        private createNewService: CreateNewService,
        private firestore: AngularFirestore,
        private chatService: ChatService,
        private matSnackBar: MatSnackBar,
        protected dialog: MatDialog,
        private firebaseAPI: FirebaseApiService,
    ) {
        this.initializeValues();
    }

    ngOnDestroy(): void {
        this.timerSubscription.unsubscribe();
        this.gameSubscription.unsubscribe();
    }

    initializeValues(): void {
        this.currentPlayer = this.userService.currentUser.username;
        this.hasStarted = false;
        this.round = 0;
        this.gameEnded = new BehaviorSubject<boolean>(false);
        this.stopDrawing = new BehaviorSubject<boolean>(false);
        this.tutorialCloseDialogSubject = new BehaviorSubject<boolean>(false);
        this.gameEndTime = new Date();
        this.isUpdatingTime = false;
        this.correctGuessesThisRound = 0;
        this.wrongGuessesThisRound = 0;
        this.channelKey = '';
        this.$remainingGuessesThisRound = new BehaviorSubject<number>(0);
        this.$timer = new BehaviorSubject<string>('00:00');
        this.$wordToGuess = new BehaviorSubject<string>('solo');
        this.$hintsLeft = new BehaviorSubject<number>(3);
        this.lastHint = '';
        this.$game = new BehaviorSubject<SoloGame>({
            id: '',
            host: this.currentPlayer,
            difficulty: GameDifficulty.Normal,
            currentImageId: '',
            state: SoloGameStates.GameStart,
            correctAttempts: 0,
            totalAttempts: 0,
            start: new Date(),
            end: new Date('January 1, 1900 00:00:00'),
            score: 0,
        });
        this.$currentImage = new BehaviorSubject<Image>({
            id: '',
            authorId: '',
            word: 'void',
            difficulty: GameDifficulty.Normal,
            hints: [],
            paths: [],
        });
    }

    resetValues(): void {
        this.currentPlayer = localStorage.getItem('username') as string;
        this.hasStarted = false;
        this.round = 0;
        this.gameEnded.next(false);
        this.stopDrawing.next(false);
        this.gameEndTime = new Date();
        this.isUpdatingTime = false;
        this.correctGuessesThisRound = 0;
        this.wrongGuessesThisRound = 0;
        this.channelKey = '';
        this.$remainingGuessesThisRound.next(0);
        this.$timer.next('00:00');
        this.$wordToGuess.next('solo');
        this.lastHint = '';
        this.$game.next({
            id: '',
            host: this.currentPlayer,
            difficulty: GameDifficulty.Normal,
            currentImageId: '',
            state: SoloGameStates.GameStart,
            correctAttempts: 0,
            totalAttempts: 0,
            start: new Date(),
            end: new Date('January 1, 1900 00:00:00'),
            score: 0,
        });
        this.$currentImage.next({
            id: '',
            authorId: '',
            word: 'void',
            difficulty: GameDifficulty.Normal,
            hints: [],
            paths: [],
        });
    }

    resetValuesEndGame(): void {
        this.currentPlayer = localStorage.getItem('username') as string;
        this.hasStarted = false;
        this.gameEnded.next(false);
        this.round = 0;
    }

    async createGame(difficulty: GameDifficulty): Promise<void> {
        this.resetValues();
        this.createNewService.resetCanvas();
        await this.http
            .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.CREATE_SOLO_SPRINT_ENDPOINT, {
                host: this.currentPlayer,
                difficulty,
            })
            .toPromise()
            .then(async (res: any) => {
                await this.firestore
                    .collection(CHANNELS_COLLECTION)
                    .doc(res.data.gameId)
                    .ref.get()
                    .then(querySnapshot => {
                        const channel = querySnapshot.data() as Channel;
                        channel.id = querySnapshot.id;
                        this.channelKey = channel.shareKey;
                        this.chatService.joinExistingChannel(this.channelKey);
                    });
                await this.getGame(res.data.gameId);
            });
    }

    async getGame(gameId: string): Promise<void> {
        this.gameSubscription = this.firestore
            .collection(SOLO_GAMES_COLLECTION)
            .doc(gameId)
            .snapshotChanges()
            .subscribe(async value => {
                const data = value.payload.data() as any;
                const game = {
                    id: gameId,
                    host: data!.host,
                    difficulty: data!.difficulty,
                    currentImageId: data!.currentImageId,
                    state: data!.state,
                    correctAttempts: data!.correctAttempts,
                    totalAttempts: data!.totalAttempts,
                    start: data!.start.toDate(),
                    end: data!.end.toDate(),
                    score: data!.score,
                } as SoloGame;

                const newImage = data!.currentImageId;
                if (newImage !== this.$game.getValue().currentImageId) {
                    await this.getImage(newImage);
                }

                this.$game.next(game);

                if (!this.hasStarted) {
                    this.startGame();
                }
            });
    }

    async getImage(imageId: string): Promise<void> {
        const docRef = await this.firestore
            .collection(DRAWINGS_LIBRARY_COLLECTION)
            .doc(imageId)
            .get()
            .toPromise();
        const image = docRef.data() as Image;
        this.$wordToGuess.next(image.word);
        this.$currentImage.next(image);
        this.$hintsLeft.next(this.$currentImage.getValue().hints.length);
    }

    startGame(): void {
        this.hasStarted = true;
        let time = 0;
        switch (this.$game.getValue().difficulty) {
            case GameDifficulty.Easy:
                time += CONSTANTS.SOLO_EASY_TIME;
                break;
            case GameDifficulty.Normal:
                time += CONSTANTS.SOLO_NORMAL_TIME;
                break;
            case GameDifficulty.Hard:
                time += CONSTANTS.SOLO_HARD_TIME;
                break;
        }
        const endGame = new Date();
        endGame.setSeconds(endGame.getSeconds() + time);
        this.gameEndTime = endGame;
        this.resetGuesses();
        this.timerSubscription = interval(1000).subscribe(x => {
            this.updateTimer();
        });
    }

    updateTimer(): void {
        const timeDifference = this.gameEndTime.getTime() - new Date().getTime();
        const secondsToNextEvent = Math.floor((timeDifference / MILLISECONDS_IN_SECOND) % SECONDS_IN_MINUTE);
        const minutesToNextEvent = Math.floor((timeDifference / (MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE)) % MINUTES_IN_HOUR);
        if (timeDifference >= 0) {
            let timerString = minutesToNextEvent < 10 ? '0' + minutesToNextEvent + ':' : minutesToNextEvent + ':';
            timerString += secondsToNextEvent < 10 ? '0' + secondsToNextEvent : secondsToNextEvent;
            this.$timer.next(timerString);
        } else if (!this.isUpdatingTime) {
            this.isUpdatingTime = true;
            this.quitGame();
        }
    }

    startNextRound(): void {
        setTimeout(() => {
            this.createNewService.resetCanvas();
            this.resetGuesses();
        }, 2000);
    }

    resetGuesses(): void {
        this.correctGuessesThisRound = 0;
        this.wrongGuessesThisRound = 0;
        this.round++;
        switch (this.$game.getValue().difficulty) {
            case GameDifficulty.Easy:
                this.$remainingGuessesThisRound.next(CONSTANTS.SOLO_EASY_GUESSES);
                break;
            case GameDifficulty.Normal:
                this.$remainingGuessesThisRound.next(CONSTANTS.SOLO_NORMAL_GUESSES);
                break;
            case GameDifficulty.Hard:
                this.$remainingGuessesThisRound.next(CONSTANTS.SOLO_HARD_GUESSES);
                break;
        }
    }

    guessWord(word: string): void {
        const remaining = this.$remainingGuessesThisRound.getValue();
        // tslint:disable-next-line: align
        if (remaining > 0) {
            this.$remainingGuessesThisRound.next(remaining - 1);
            if (word.toLowerCase() === this.$currentImage.getValue().word.toLowerCase()) {
                this.stopDrawing.next(true);
                this.correctGuessesThisRound++;
                let extraTime = 0;
                switch (this.$game.getValue().difficulty) {
                    case GameDifficulty.Easy:
                        extraTime += CONSTANTS.SOLO_EASY_EXTRA_TIME;
                        break;
                    case GameDifficulty.Normal:
                        extraTime += CONSTANTS.SOLO_NORMAL_EXTRA_TIME;
                        break;
                    case GameDifficulty.Hard:
                        extraTime += CONSTANTS.SOLO_HARD_EXTRA_TIME;
                        break;
                }
                const endGame = new Date();
                endGame.setSeconds(endGame.getSeconds() + extraTime);
                this.gameEndTime = endGame;
                this.firebaseAPI.addMessage({
                    content: 'Correct guess!',
                    senderID: '[System]',
                    timeStamp: new Date().toString(),
                    channel: this.channelKey,
                });
                this.http
                    .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.CORRECT_SOLO_ENDPOINT, {
                        gameId: this.$game.getValue().id,
                        correctAttemptsThisRound: this.correctGuessesThisRound,
                        badAttemptsThisRound: this.wrongGuessesThisRound,
                    })
                    .pipe()
                    .subscribe(res => {
                        this.startNextRound();
                    });
            } else if (this.$remainingGuessesThisRound.getValue() === 0) {
                this.wrongGuessesThisRound++;
                this.http
                    .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.NO_MORE_SOLO_ENDPOINT, {
                        gameId: this.$game.getValue().id,
                        badAttemptsThisRound: this.wrongGuessesThisRound,
                    })
                    .pipe()
                    .subscribe(res => {
                        this.firebaseAPI.addMessage({
                            content: 'Wrong guess.',
                            senderID: '[System]',
                            timeStamp: new Date().toString(),
                            channel: this.channelKey,
                        });
                        this.startNextRound();
                    });
            } else {
                this.wrongGuessesThisRound++;
                this.firebaseAPI.addMessage({
                    content: 'Wrong guess.',
                    senderID: '[System]',
                    timeStamp: new Date().toString(),
                    channel: this.channelKey,
                });
            }
        }
    }

    getHint(): void {
        let hint = '';
        if (this.$currentImage.getValue().hints.length > 0) {
            hint = this.$currentImage.getValue().hints.pop() as string;
        }
        this.$hintsLeft.next(this.$currentImage.getValue().hints.length);
        if (hint !== '') {
            this.firebaseAPI.addMessage({
                content: 'Your hint is: ' + hint.toUpperCase(),
                senderID: 'Hint',
                timeStamp: new Date().toString(),
                channel: this.channelKey,
            });
            if (this.chatService.$virtualPlayerVoiceActive.getValue()) {
                const speech = new SpeechSynthesisUtterance();
                const msg = 'Your hint is: ' + hint.toUpperCase();
                speech.text = msg;
                window.speechSynthesis.speak(speech);
            }
        }
    }

    async endGame(): Promise<void> {
        await this.http
            .post(CONSTANTS.CLOUD_FUNCTIONS_ROOT + CONSTANTS.END_SOLO_SPRINT_ENDPOINT, {
                gameId: this.$game.getValue().id,
                badAttemptsThisRound: this.wrongGuessesThisRound,
            })
            .toPromise()
            .then(async () => {
                this.chatService.quitChannel(this.channelKey);
                this.channelKey = '';
            });
    }

    quitGame(): void {
        this.stopDrawing.next(true);
        this.matSnackBar.open('Quitting game. Please wait...', 'OK', {
            duration: 3000,
            horizontalPosition: 'left',
            verticalPosition: 'bottom',
        });
        this.endGame().then(() => {
            this.gameSubscription.unsubscribe();
            this.timerSubscription.unsubscribe();
            localStorage.setItem('mode', 'menu');
            this.gameEnded.next(true);
            const end = this.dialog.open(EndGameSoloComponent, {
                width: 'auto',
                height: 'auto',
                disableClose: true,
                data: { score: this.$game.getValue().score },
            });
            this.tutorialCloseDialogSubject.next(true);
            end.afterClosed().subscribe(() => {
                this.router.navigateByUrl('/home');
            });
        });
    }

    quitGameCloseWindow(): void {
        this.firestore
            .collection('solo-games')
            .doc(this.$game.getValue().id)
            .update({
                state: 4,
            });
        this.chatService.quitChannel(this.channelKey);
    }
}
