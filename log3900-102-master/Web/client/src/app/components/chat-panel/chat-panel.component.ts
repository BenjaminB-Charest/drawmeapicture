import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/classes/message';
import { Channel } from 'src/app/interfaces/channel';
import { ChatService } from 'src/app/services/chat/chat.service';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
// tslint:disable: deprecation

@Component({
    selector: 'app-chat-panel',
    templateUrl: './chat-panel.component.html',
    styleUrls: ['./chat-panel.component.scss'],
    styles: [':host-context(.home-channel-pannel) .wrapper{max-height:50px}'],
})
export class ChatPanelComponent implements OnInit, OnDestroy {
    messages: Message[];
    chatContent: string;
    currentChannel: string;
    messageSentAudio: HTMLAudioElement = new Audio();
    readonly senderID: string;
    readonly currentDate: Date;
    isGuessing: boolean;
    gameMode: string;
    showHistory: boolean;

    private channelSubscription: Subscription;
    private chatSubscription: Subscription;
    private showHistorySubscription: Subscription;

    constructor(
        private firebaseAPI: FirebaseApiService,
        private gameEngineService: GameEngineService,
        private soloSprintEngineService: SoloSprintEngineService,
        private chatService: ChatService,
    ) {
        this.chatContent = '';
        this.isGuessing = false;
        this.messages = [];
        this.currentChannel = 'General';
        this.senderID = localStorage.getItem('username') as string;
        this.currentDate = new Date(Date.now());
        this.gameMode = localStorage.getItem('mode') != null ? (localStorage.getItem('mode') as string) : 'classic';
        if (this.gameMode === 'classic') {
            this.gameEngineService.$isGuessing.subscribe((isGuessing: boolean) => {
                this.isGuessing = isGuessing;
            });
        } else if (this.gameMode === 'solo') {
            this.isGuessing = true;
        }
    }

    ngOnInit(): void {
        if (localStorage.getItem('currentChannel') === undefined) {
            localStorage.setItem('currentChannel', this.chatService.$activeChannel.getValue().shareKey);
        } else {
            for (const channel of this.chatService.$availableChannels.getValue()) {
                if (channel.shareKey === localStorage.getItem('currentChannel')) {
                    this.chatService.changeChannel(channel);
                }
            }
        }
        this.channelSubscription = this.chatService.$activeChannel.subscribe((channel: Channel) => {
            this.currentChannel = channel.name;
        });
        this.chatSubscription = this.chatService.$activeChat.subscribe((messages: Message[]) => {
            this.messages = messages;
            for (const message of messages) {
                if (new Date(message.timeStamp) > this.chatService.$lastMessageTimeStamp.getValue()) {
                    if (message.senderID.includes('[Robot]') && this.chatService.$virtualPlayerVoiceActive.getValue()) {
                        const speech = new SpeechSynthesisUtterance();
                        speech.text = message.content;
                        window.speechSynthesis.speak(speech);
                    }
                    this.chatService.$lastMessageTimeStamp.next(new Date(message.timeStamp));
                }
            }
        });
        this.showHistorySubscription = this.chatService.$showHistory.subscribe((showHistory: boolean) => {
            this.showHistory = showHistory;
        });
    }

    ngOnDestroy(): void {
        if (this.channelSubscription) {
            this.channelSubscription.unsubscribe();
        }
        if (this.chatSubscription) {
            this.chatSubscription.unsubscribe();
        }
        if (this.showHistorySubscription) {
            this.showHistorySubscription.unsubscribe();
        }
    }

    sendMessage(): void {
        if (this.chatContent.trim() !== '') {
            const sentMessage = {
                content: this.chatContent,
                senderID: this.senderID,
                channel: this.chatService.$activeChannel.getValue().shareKey,
                timeStamp: Date(),
            } as Message;
            this.playSent();
            this.firebaseAPI.addMessage(sentMessage);
            this.chatContent = '';
        }
    }

    getHistory(): void {
        this.chatService.getHistory();
    }

    playSent(): void {
        this.messageSentAudio = new Audio();
        this.messageSentAudio.crossOrigin = 'anonymous';
        this.messageSentAudio.src = 'assets/sounds/message_sent.mp3';
        this.messageSentAudio.load();
        this.messageSentAudio.play();
    }

    recieveMessages(message: Message): void {
        const dateOnline = new Date(message.timeStamp);
        if (message.senderID !== this.senderID && this.currentDate < dateOnline) {
            this.messages.push(message);
        }
    }

    sendGuess(): void {
        if (this.chatContent.trim() !== '') {
            if (this.gameMode === 'classic') {
                this.gameEngineService.guessWord(this.chatContent);
                this.sendMessage();
            } else if (this.gameMode === 'solo') {
                this.soloSprintEngineService.guessWord(this.chatContent);
                this.sendMessage();
            }
        }
    }
}
