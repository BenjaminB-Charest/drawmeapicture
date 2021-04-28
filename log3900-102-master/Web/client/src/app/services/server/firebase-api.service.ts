import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { CLOUD_FUNCTIONS_ROOT, CREATE_GAME_ENDPOINT, OPACITY_CONSTANT } from 'src/app/classes/constants';
import { Message } from 'src/app/classes/message';
import { Profile } from 'src/app/classes/profile';
import { SignUpInformations } from 'src/app/classes/sign-up-informations';
import { Stroke } from 'src/app/classes/stroke';
import { StrokeType } from 'src/app/enums/stroke-type.enum';
import { Image } from 'src/app/interfaces/image';
import { Lobby } from 'src/app/interfaces/lobby';
import { NewLobbyInfo } from 'src/app/interfaces/new-lobby-info';
import { LobbyService } from 'src/app/services/create-new-lobby/lobby.service';
import { LogInInformations } from '../../classes/log-in-informations';
import { ChatService } from '../chat/chat.service';
import { DrawableService } from '../drawable/drawable.service';
import { GameLobbyService } from '../game-lobby/game-lobby.service';

@Injectable({
    providedIn: 'root',
})
// tslint:disable: deprecation
export class FirebaseApiService implements OnDestroy {
    userAvatars: BehaviorSubject<Map<string, string>> = new BehaviorSubject(new Map<string, string>());
    userBadges: BehaviorSubject<Map<string, string[]>> = new BehaviorSubject(new Map<string, string[]>());
    logInSuccessful: Subject<boolean> = new Subject<boolean>();
    accountCreationSuccessful: Subject<boolean> = new Subject<boolean>();
    accountExists: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    accountInfoMatch: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    accountSnackBarOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    newStroke: Subject<Stroke> = new Subject<Stroke>();
    activeLobby: BehaviorSubject<Lobby> = new BehaviorSubject<Lobby>({} as Lobby);
    lobbyList: BehaviorSubject<Lobby[]> = new BehaviorSubject<Lobby[]>([]);
    hasJoinedLobby: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    lobbyFullSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    wrongKeySubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    updateLobbies: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    activeStroke: Stroke = { path: [], opacity: 255, color: '', id: 0, size: 0, type: StrokeType.Added } as Stroke;
    activeMessage: Subject<Message> = new Subject<Message>();
    firebaseMessage: Subscription = new Subscription();
    strokeSubscription: Subscription = new Subscription();
    lobbySubscription: Subscription = new Subscription();
    messageSubscription: Subscription = new Subscription();
    watchLobbiesSubscription: Subscription = new Subscription();
    avatarsFetched: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    logOffDoc: string;

    ignoreFirstStroke: boolean;
    instructions: Stroke[];
    strokePlacement: string;

    constructor(
        private db: AngularFirestore,
        public router: Router,
        public auth: AngularFireAuth,
        public drawStack: DrawableService,
        private lobbyService: LobbyService,
        private chatService: ChatService,
        private http: HttpClient,
        private gameLobbyService: GameLobbyService,
        private matSnack: MatSnackBar,
    ) {
        auth.setPersistence('local');
        this.ignoreFirstStroke = false;
        this.activeStroke.path = [];
        this.getAllAvatars();
    }

    async addMessage(value: Message): Promise<void> {
        this.db
            .collection('messages')
            .add({
                content: value.content,
                senderID: value.senderID,
                timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
                channel: value.channel,
            })
            .catch((error) => {
                console.error('Error writing document: ', error);
            });
    }

    async addUser(userList: string[]): Promise<void> {
        this.db
            .collection('users')
            .doc('userlist')
            .set({ list: userList })
            .catch((error) => {
                console.error('Error writing document: ', error);
            });
    }

    updateLogoutTime(): void {
        this.db
            .collection('loginHistory')
            .doc(this.logOffDoc)
            .update({
                logoff: new Date(),
            });
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                isLoggedIn: false,
            });
    }

    setStroke(gameId: string): void {
        this.strokePlacement = gameId;
    }

    async getAllAvatars(): Promise<void> {
        this.db
            .collection('userProfile')
            .get()
            .toPromise()
            .then((snapShot) => {
                snapShot.forEach((profileData) => {
                    const profile = profileData.data() as Profile;
                    const map = this.userAvatars.getValue();
                    map.set(profileData.id, profile.avatar);
                    this.userAvatars.next(map);
                    const badgeList = [];
                    for (const badge of profile.selectedBadges) {
                        badgeList.push(badge);
                    }
                    const badgeMap = this.userBadges.getValue();
                    badgeMap.set(profileData.id, badgeList);
                    this.userBadges.next(badgeMap);
                });
                this.avatarsFetched.next(true);
            });
    }

    async sendStroke(): Promise<void> {
        if (localStorage.getItem('mode') === 'wordImagePair') {
            console.log('Creation pair mot image');
        } else {
            this.db
                .collection('strokes')
                .doc(this.strokePlacement)
                .set({
                    path: this.activeStroke.path,
                    color: this.activeStroke.color,
                    size: this.activeStroke.size,
                    opacity: this.activeStroke.opacity * OPACITY_CONSTANT,
                    id: this.activeStroke.id,
                    type: this.activeStroke.type,
                });
        }
    }

    async getImage(imageId: string): Promise<Image> {
        let image = {} as Image;
        await this.db
            .collection('drawings-library')
            .doc(imageId)
            .get()
            .toPromise()
            .then((value) => {
                image = value.data() as Image;
            });
        return image;
    }

    async saveImage(image: Image, path: Stroke[]): Promise<void> {
        await this.db.collection('drawings-library').add({
            authorId: image.authorId,
            word: image.word.toLowerCase(),
            difficulty: image.difficulty,
            hints: image.hints,
            paths: path,
        });
    }

    getStrokes(): void {
        this.strokeSubscription = this.db
            .collection('strokes')
            .doc(this.strokePlacement)
            .snapshotChanges()
            .subscribe((value) => {
                const stroke = (value.payload.data() as unknown) as Stroke;
                this.newStroke.next(stroke);
            });
    }

    addPlayerToLobby(lobbyID: string, position: number, username: string): void {
        this.db
            .collection('lobbies')
            .doc(lobbyID)
            .get()
            .toPromise()
            .then((val) => {
                const lobby = val.data() as Lobby;
                const playersMap: Map<string, number> = new Map<string, number>();
                for (const [key, valueNumber] of Object.entries(lobby.players)) {
                    playersMap.set(key, valueNumber);
                }
                playersMap.set(username, position);
                this.db
                    .collection('lobbies')
                    .doc(lobbyID)
                    .update({
                        players: this.convertMapToObject(playersMap),
                    });
            });
    }

    removeChannel(shareKey: string): void {
        const channelList: string[] = [];
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .get()
            .toPromise()
            .then((data) => {
                const profile = data.data() as Profile;
                for (const channel of profile.channels) {
                    if (channel !== shareKey) {
                        channelList.push(channel);
                    }
                    this.db
                        .collection('userProfile')
                        .doc(localStorage.getItem('username') as string)
                        .update({
                            channels: channelList,
                        });
                }
            });
    }

    removePlayerFromLobby(lobbyID: string, username: string): void {
        this.db
            .collection('lobbies')
            .doc(lobbyID)
            .get()
            .toPromise()
            .then((val) => {
                const lobby = val.data() as Lobby;
                const playersMap: Map<string, number> = new Map<string, number>();
                for (const [key, valueNumber] of Object.entries(lobby.players)) {
                    playersMap.set(key, valueNumber);
                }
                playersMap.delete(username);
                this.db
                    .collection('lobbies')
                    .doc(lobbyID)
                    .update({
                        players: this.convertMapToObject(playersMap),
                    });
            });
    }

    getLobby(lobbyID: string): void {
        if (lobbyID !== '') {
            this.lobbySubscription = this.db
                .collection('lobbies')
                .doc(lobbyID)
                .snapshotChanges()
                .subscribe((value) => {
                    const newLobby = (value.payload.data() as unknown) as Lobby;
                    newLobby.id = lobbyID;
                    this.activeLobby.next(newLobby);
                });
        }
    }

    watchCollectionLobbies(): void {
        this.watchLobbiesSubscription = this.db
            .collection('lobbies')
            .snapshotChanges()
            .subscribe(() => {
                this.updateLobbies.next(true);
            });
    }

    getPublicFilteredLobbies(difficulty: string): void {
        const lobbies: Lobby[] = [];
        this.db
            .collection('lobbies')
            .ref.where('isPublic', '==', true)
            .where('gameId', '==', '')
            .where('host', '!=', '')
            .where('difficulty', '==', difficulty)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const lobby = (doc.data() as unknown) as Lobby;
                    lobby.id = doc.id;
                    lobbies.push(lobby);
                });
                this.lobbyList.next(lobbies);
            });
    }

    joinLobby(gameId: string): void {
        this.db
            .collection('lobbies')
            .doc(gameId)
            .get()
            .toPromise()
            .then((value) => {
                const lobby = value.data() as Lobby;
                const valueList: number[] = [];
                const playersMap: Map<string, number> = new Map<string, number>();
                for (const [key, valueNumber] of Object.entries(lobby.players)) {
                    playersMap.set(key, valueNumber);
                    valueList.push(valueNumber);
                }
                if (playersMap.size < 4) {
                    this.lobbyService.lobbyInfos = {
                        name: lobby.name,
                        privacy: lobby.isPublic as any,
                        mode: lobby.mode,
                        difficulty: lobby.difficulty,
                    } as NewLobbyInfo;
                    for (let i = 3; i < 6; i++) {
                        if (valueList.find((element) => element === i % 4) === undefined) {
                            playersMap.set(localStorage.getItem('username') as string, (i % 4) as number);
                            this.db
                                .collection('lobbies')
                                .doc(gameId)
                                .update({
                                    players: this.convertMapToObject(playersMap),
                                })
                                .then(() => {
                                    this.lobbyService.lobbyId = gameId;
                                    this.hasJoinedLobby.next(true);
                                    this.chatService.joinExistingChannel(lobby.shareKey);
                                });
                            break;
                        }
                    }
                    this.gameLobbyService.shouldCloseDialogSubject.next(true);
                } else {
                    this.lobbyFullSubject.next(true);
                }
            });
    }

    joinPrivateLobby(shareKey: string): void {
        this.db
            .collection('lobbies')
            .ref.where('shareKey', '==', shareKey.toUpperCase())
            .get()
            .then((lobby) => {
                if (lobby.docs[0] !== undefined) {
                    this.joinLobby(lobby.docs[0].id);
                } else {
                    this.wrongKeySubject.next(true);
                }
            });
    }

    async updateLobbyBeforeStart(playerMap: Map<string, number>, gameMode: string, gameId: string): Promise<void> {
        this.db
            .collection('lobbies')
            .doc(gameId)
            .update({
                mode: gameMode,
                players: this.convertMapToObject(playerMap),
            })
            .then(() => {
                this.http
                    .post(CLOUD_FUNCTIONS_ROOT + CREATE_GAME_ENDPOINT, {
                        lobbyId: gameId,
                    })
                    .toPromise();
            });
    }

    quitLobby(gameId: string): void {
        this.db
            .collection('lobbies')
            .doc(gameId)
            .get()
            .toPromise()
            .then((value) => {
                const lobby = value.data() as Lobby;
                const valueList: number[] = [];
                const playersMap: Map<string, number> = new Map<string, number>();
                for (const [key, valueNumber] of Object.entries(lobby.players)) {
                    playersMap.set(key, valueNumber);
                    valueList.push(valueNumber);
                }
                playersMap.delete(localStorage.getItem('username') as string);
                this.db
                    .collection('lobbies')
                    .doc(gameId)
                    .update({
                        players: this.convertMapToObject(playersMap),
                    })
                    .then(() => {
                        this.lobbyService.lobbyId = '';
                        this.hasJoinedLobby.next(false);
                    });
            });
    }

    deleteLobby(gameId: string): void {
        this.db
            .collection('lobbies')
            .doc(gameId)
            .update({
                host: '',
            });
    }
    async authenticateNewUser(loginInfo: LogInInformations): Promise<void> {
        await this.auth
            .signInWithEmailAndPassword(loginInfo.username + '@DrawMeAPicturePolyMTL.com', loginInfo.password)
            .then(() => {
                if (this.auth.user != null) {
                    this.logInSuccessful.next(true);
                    localStorage.setItem('username', loginInfo.username.toLowerCase());
                    this.addLogin();
                }
            })
            .catch(() => {
                this.logInSuccessful.next(false);
            });
    }

    async authenticateUser(loginInfo: LogInInformations): Promise<void> {
        const ok = await this.checkLoggedIn(loginInfo.username);
        if (ok) {
            await this.auth
                .signInWithEmailAndPassword(loginInfo.username + '@DrawMeAPicturePolyMTL.com', loginInfo.password)
                .then(() => {
                    if (this.auth.user != null) {
                        this.logInSuccessful.next(true);
                        localStorage.setItem('username', loginInfo.username.toLowerCase());
                        this.addLogin();
                    }
                })
                .catch(() => {
                    // This should be bad password.
                    this.accountInfoMatch.next(false);
                    this.logInSuccessful.next(false);
                });
        } else {
            // This should be account is logged in.
            if (this.accountExists.getValue()) {
                this.accountSnackBarOpen.next(true);
                this.matSnack.open('Account already in use.', 'OK', {
                    duration: 2000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                });
            }
        }
    }

    async checkLoggedIn(username: string): Promise<boolean> {
        let join = false;
        await this.db
            .collection('userProfile')
            .doc(username)
            .get()
            .toPromise()
            .then(async () => {
                await this.db
                    .collection('userProfile')
                    .doc(username)
                    .get()
                    .toPromise()
                    .then((profileData) => {
                        const profile = profileData.data() as Profile;
                        if (!profile.isLoggedIn) {
                            join = true;
                        }
                    });
            })
            .catch(() => {
                this.accountExists.next(false);
                this.logInSuccessful.next(false); // this should be account does not exist.
            });
        return join;
    }

    addLogin(): void {
        this.db
            .collection('loginHistory')
            .add({
                user: localStorage.getItem('username') as string,
                login: new Date(),
                logoff: new Date(),
            })
            .then((ref) => {
                this.logOffDoc = ref.id;
            });
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                isLoggedIn: true,
            });
    }

    async createProfile(profileInformation: SignUpInformations): Promise<void> {
        await this.auth
            .createUserWithEmailAndPassword(profileInformation.username.toLowerCase() + '@DrawMeAPicturePolyMTL.com', profileInformation.password)
            .then(() => {
                this.accountCreationSuccessful.next(true);
                this.db
                    .collection('userProfile')
                    .doc(profileInformation.username.toLowerCase())
                    .set({
                        username: profileInformation.username.toLowerCase(),
                        firstName: profileInformation.firstname,
                        lastName: profileInformation.lastname,
                        avatar: profileInformation.avatar,
                        experience: 0,
                        money: 0,
                        unlockedBadges: [],
                        selectedBadges: ['noBadge', 'noBadge', 'noBadge'],
                        unlockedAvatars: ['girl', 'male'],
                        channels: ['ABCDEF'],
                        toggleMusic: true,
                        toggleVP: true,
                        isLoggedIn: false,
                    })
                    .then(() => {
                        this.authenticateNewUser(profileInformation).then(() => {
                            this.router.navigateByUrl('/home');
                        });
                    })
                    .catch((e: Error) => {
                        console.log(e);
                    });
            })
            .catch((e: Error) => {
                console.log(e);
            });
    }

    async createMessageDocument(value: Message): Promise<DocumentReference<unknown>> {
        return this.db.collection('messages').add({
            text: value.content.toString(),
        });
    }

    // DEPRECATED
    getMessages(): void {
        this.messageSubscription = this.firebaseMessage = this.db
            .collection('messages')
            .snapshotChanges()
            .subscribe((value) => {
                const message = value.map((recievedMessage) => recievedMessage.payload.doc.data() as Message)[0];
                this.activeMessage.next(message);
            });
    }

    toggleMusic(musicStatus: boolean): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                toggleMusic: musicStatus,
            });
    }

    async getUserProfile(): Promise<Profile> {
        let recievedProfile = {} as Profile;
        await this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .get()
            .toPromise()
            .then((element) => {
                recievedProfile = element.data() as Profile;
            });
        return recievedProfile;
    }

    async getOtherUserProfile(username: string): Promise<Profile> {
        let recievedProfile = {} as Profile;
        await this.db
            .collection('userProfile')
            .doc(username)
            .get()
            .toPromise()
            .then((element) => {
                recievedProfile = element.data() as Profile;
            });
        return recievedProfile;
    }

    async setLobby(username: string, lobbyId: string): Promise<void> {
        this.db
            .collection('lobbies')
            .doc(lobbyId)
            .get()
            .toPromise()
            .then((value) => {
                const playerMap = Object((value.data() as Lobby).players).entries() as Map<string, number>;
                const val = Object(playerMap).values();
                let index = 0;
                for (let i = 0; i < 4; i++) {
                    if (val[i] !== i) {
                        index = i;
                        break;
                    }
                }
                playerMap.set(username, index);
                this.db
                    .collection('lobbies')
                    .doc(lobbyId)
                    .set({
                        players: playerMap,
                    });
            });
    }

    setAvatar(avatarLink: string): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                avatar: avatarLink,
            })
            .catch((e) => console.log(e));
    }

    setBadgeList(badgeList: string[]): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                badges: badgeList,
            })
            .then((returnVal) => console.log(returnVal))
            .catch((e) => console.log(e));
    }

    signOut(): void {
        this.auth
            .signOut()
            .then((_) => {
                this.updateLogoutTime();
                localStorage.clear();
                this.firebaseMessage.unsubscribe();
                this.strokeSubscription.unsubscribe();
                this.lobbySubscription.unsubscribe();
                this.messageSubscription.unsubscribe();
                this.watchLobbiesSubscription.unsubscribe();
            })
            .catch((e) => {
                console.log('Following error occured' + e);
            });
    }

    convertMapToObject(map: Map<any, any>): Object {
        return Array.from(map.entries()).reduce((main, [key, value]) => ({ ...main, [key]: value }), {});
    }

    ngOnDestroy(): void {
        this.firebaseMessage.unsubscribe();
        this.strokeSubscription.unsubscribe();
        this.lobbySubscription.unsubscribe();
        this.messageSubscription.unsubscribe();
        this.watchLobbiesSubscription.unsubscribe();
    }
}
