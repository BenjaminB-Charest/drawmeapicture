import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SHARE_KEY_LENGTH } from 'src/app/classes/constants';
import { Message } from 'src/app/classes/message';
import { Profile } from 'src/app/classes/profile';
import { Channel } from 'src/app/interfaces/channel';
import { Lobby } from 'src/app/interfaces/lobby';
import { User } from 'src/app/interfaces/user';

@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    $activeChannel: BehaviorSubject<Channel>;
    $availableChannels: BehaviorSubject<Channel[]>;
    $activeChat: BehaviorSubject<Message[]>;
    $lastMessageTimeStamp: BehaviorSubject<Date>;
    $showHistory: BehaviorSubject<boolean>;
    $virtualPlayerVoiceActive: BehaviorSubject<boolean>;
    channelSubscription: Subscription;
    activeChannelSubscription: Subscription;
    virtualPlayerSubscription: Subscription;

    joinTime: Date;

    constructor(private db: AngularFirestore, private ngZone: NgZone, private matSnackBar: MatSnackBar) {
        this.initializeValues();
    }

    ngOnDestroy(): void {
        if (this.channelSubscription) {
            this.channelSubscription.unsubscribe();
        }
        if (this.activeChannelSubscription) {
            this.activeChannelSubscription.unsubscribe();
        }
        if (this.virtualPlayerSubscription) {
            this.virtualPlayerSubscription.unsubscribe();
        }
    }
    initializeValues(): void {
        // this.getVirtualPlayerVoice();
        this.$activeChannel = new BehaviorSubject<Channel>({
            id: '',
            shareKey: 'ABCDEF',
            isPublic: true,
            host: '',
            name: 'General',
        });
        this.$virtualPlayerVoiceActive = new BehaviorSubject<boolean>(true);
        this.$availableChannels = new BehaviorSubject<Channel[]>([]);
        this.$activeChat = new BehaviorSubject<Message[]>([]);
        this.joinTime = new Date();
        this.$lastMessageTimeStamp = new BehaviorSubject<Date>(new Date());
        this.$showHistory = new BehaviorSubject<boolean>(false);
    }

    getHistory(): void {
        this.$showHistory.next(true);
        this.getMessages();
    }

    changeChannel(newChannel: Channel): void {
        this.$activeChannel.next(newChannel);
        localStorage.setItem('currentChannel', newChannel.shareKey);
        this.$showHistory.next(false);
        this.getMessages();
        this.activeChannelSubscription.unsubscribe();
        this.subscribeToChannel(this.$activeChannel.getValue());
    }

    getMessages(): void {
        this.ngZone.run(() => {
            this.db
                .collection('messages')
                .ref.where('channel', '==', this.$activeChannel.getValue().shareKey)
                .get()
                .then((querySnapshot) => {
                    let messagelist = [] as Message[];
                    querySnapshot.forEach((doc) => {
                        const message = (doc.data() as unknown) as Message;
                        messagelist.push(message);
                    });
                    messagelist.forEach((message) => {
                        if (message.timeStamp !== null) {
                            const ms = ((message.timeStamp as unknown) as firebase.firestore.Timestamp).toMillis();
                            message.timeStamp = new Date(ms).toString();
                        }
                    });
                    messagelist.sort(function(x, y) {
                        const xDate = new Date(x.timeStamp).getTime();
                        const yDate = new Date(y.timeStamp).getTime();
                        return xDate - yDate;
                    });
                    if (!this.$showHistory.getValue()) {
                        messagelist = messagelist.filter((message) => {
                            return new Date(message.timeStamp) >= this.joinTime;
                        });
                    }
                    this.$activeChat.next(messagelist);
                });
        });
    }

    getAvailableChannels(): void {
        this.channelSubscription = this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .snapshotChanges()
            .subscribe((querySnapshot) => {
                const channelKeys = (querySnapshot.payload.data() as User).channels;
                const channels = [] as Channel[];
                channelKeys.forEach((key) => {
                    this.db
                        .collection('channels')
                        .ref.where('shareKey', '==', key)
                        .limit(1)
                        .get()
                        .then((value) => {
                            value.docs.forEach((doc) => {
                                const channel = doc.data() as Channel;
                                channel.id = doc.id;
                                channels.push(channel);
                            });
                        });
                });
                this.$availableChannels.next(channels);
            });
    }

    subscribeToChannel(channel: Channel): void {
        this.activeChannelSubscription = this.db
            .collection('messages').snapshotChanges().subscribe((querySnapshot) => {
               console.log(channel.shareKey);
               let messagelist = [] as Message[];
               querySnapshot.forEach((doc) => {
                    const message = (doc.payload.doc.data() as unknown) as Message;
                    if (message.channel === channel.shareKey) {
                       messagelist.push(message);
                    }
                });
               messagelist.forEach((message) => {
                    if (message.timeStamp !== null) {
                        const ms = ((message.timeStamp as unknown) as firebase.firestore.Timestamp).toMillis();
                        message.timeStamp = new Date(ms).toString();
                    }
                });
               messagelist.sort(function(x, y) {
                    const xDate = new Date(x.timeStamp).getTime();
                    const yDate = new Date(y.timeStamp).getTime();
                    return xDate - yDate;
                });
               if (!this.$showHistory.getValue()) {
                    messagelist = messagelist.filter((message) => {
                        return new Date(message.timeStamp) >= this.joinTime;
                    });
                }
               this.$activeChat.next(messagelist);
            });
    }

    private generateKey(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charactersLength = characters.length;
        let key = '';
        for (let i = 0; i < SHARE_KEY_LENGTH; i++) {
            key += characters.substr(Math.floor(Math.random() * charactersLength + 1), 1);
        }
        return key;
    }

    async generateUniqueShareKey(): Promise<string> {
        return await this.db
            .collection('lobbies')
            .ref.get()
            .then((querySnapshot) => {
                const lobbies = querySnapshot.docs.map(function(doc) {
                    return doc.data() as Lobby;
                });
                let newKey = this.generateKey();
                for (const lobby of lobbies) {
                    while (lobby.shareKey === newKey) {
                        newKey = this.generateKey();
                    }
                }
                return newKey;
            });
    }

    quitChannel(shareKey: string): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .ref.get()
            .then((querySnapshot) => {
                const channels = (querySnapshot.data() as User).channels;
                const newChannels = channels.filter((cnl) => cnl !== shareKey);
                this.db
                    .collection('userProfile')
                    .doc(localStorage.getItem('username') as string)
                    .update({ channels: newChannels })
                    .then(() => {
                        if (this.$availableChannels.getValue().length > 0) {
                            this.changeChannel(this.$availableChannels.getValue()[0]);
                        } else {
                            this.changeChannel({
                                id: '',
                                shareKey: 'ABCDEF',
                                isPublic: true,
                                host: '',
                                name: 'General',
                            });
                        }
                    });
            });
    }

    joinExistingChannel(shareKey: string): void {
        if (this.$activeChannel.getValue().shareKey !== shareKey.toUpperCase()) {
            // Update current channel
            let channelExist = false;
            this.db
                .collection('channels')
                .ref.where('shareKey', '==', shareKey.toUpperCase())
                .limit(1)
                .get()
                .then((querySnapshot) => {
                    let channel = {} as Channel;
                    querySnapshot.forEach((doc) => {
                        channelExist = true;
                        channel = (doc.data() as unknown) as Channel;
                        channel.id = doc.id;
                    });
                    if (channelExist) {
                            this.changeChannel(channel);
                            this.db
                                .collection('userProfile')
                                .doc(localStorage.getItem('username') as string)
                                .ref.get()
                                .then(querySnapshot => {
                                    const channels = (querySnapshot.data() as User).channels;
                                    channels.push(shareKey);
                                    this.db
                                        .collection('userProfile')
                                        .doc(localStorage.getItem('username') as string)
                                        .update({ channels })
                                        .then(() => {
                                            this.matSnackBar.open('Channel Joined!', 'OK', {
                                                duration: 2000,
                                                horizontalPosition: 'left',
                                                verticalPosition: 'bottom',
                                            });
                                        });
                                });
                    } else {
                        this.matSnackBar.open("Channel doesn't exists!", 'OK', {
                            duration: 2000,
                            horizontalPosition: 'left',
                            verticalPosition: 'bottom',
                        });
                    }
                })
                .catch(() => {
                    this.matSnackBar.open("Channel doesn't exists!", 'OK', {
                        duration: 2000,
                        horizontalPosition: 'left',
                        verticalPosition: 'bottom',
                    });
                });
        }
    }

    joinExistingChannelButton(shareKey: string): void {
        if (this.$activeChannel.getValue().shareKey !== shareKey.toUpperCase()) {
            // Update current channel
            let channelExist = false;
            this.db
                .collection('channels')
                .ref.where('shareKey', '==', shareKey.toUpperCase())
                .limit(1)
                .get()
                .then((querySnapshot) => {
                    let channel = {} as Channel;
                    querySnapshot.forEach((doc) => {
                        channelExist = true;
                        channel = (doc.data() as unknown) as Channel;
                        channel.id = doc.id;
                    });
                    if (channelExist) {
                        if (channel.isPublic) {
                            this.changeChannel(channel);
                            this.db
                                .collection('userProfile')
                                .doc(localStorage.getItem('username') as string)
                                .ref.get()
                                .then(querySnapshot => {
                                    const channels = (querySnapshot.data() as User).channels;
                                    channels.push(shareKey);
                                    this.db
                                        .collection('userProfile')
                                        .doc(localStorage.getItem('username') as string)
                                        .update({ channels })
                                        .then(() => {
                                            this.matSnackBar.open('Channel Joined!', 'OK', {
                                                duration: 2000,
                                                horizontalPosition: 'left',
                                                verticalPosition: 'bottom',
                                            });
                                        });
                                });
                        } else {
                            this.matSnackBar.open('Game channels cannot be joined!', 'OK', {
                            duration: 2000,
                            horizontalPosition: 'left',
                            verticalPosition: 'bottom',
                        });
                        }
                    } else {
                        this.matSnackBar.open("Channel doesn't exists!", 'OK', {
                            duration: 2000,
                            horizontalPosition: 'left',
                            verticalPosition: 'bottom',
                        });
                    }
                })
                .catch(() => {
                    this.matSnackBar.open("Channel doesn't exists!", 'OK', {
                        duration: 2000,
                        horizontalPosition: 'left',
                        verticalPosition: 'bottom',
                    });
                });
        }
    }

    createChannel(channelName: string): void {
        this.generateUniqueShareKey().then((shareKeyVal) => {
            this.db
                .collection('channels')
                .add({
                    isPublic: true,
                    name: channelName,
                    host: localStorage.getItem('username') as string,
                    shareKey: shareKeyVal,
                })
                .then(() => {
                    this.joinExistingChannel(shareKeyVal);
                });
        });
    }

    getVirtualPlayerVoice(): void {
        this.db.collection('userProfile')
            .doc(localStorage.getItem('username') as string).snapshotChanges()
            .subscribe((data) => {
                const virtualPlayer = data.payload.data() as Profile;
                this.$virtualPlayerVoiceActive.next(virtualPlayer.toggleVP);
            });
    }

    toggleVirtualPlayerVoice(): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                toggleVP: this.$virtualPlayerVoiceActive.getValue(),
            });
    }
}
