import { Injectable, NgZone, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Channel } from 'src/app/interfaces/channel';
import { ChatService } from '../chat/chat.service';
import { IpcService } from '../ipc/ipc.service';

@Injectable({
    providedIn: 'root',
})
export class ChannelPanelService implements OnInit {
    newChannelName: string;
    joinChannelKey: string;
    deletedChannel: Channel;

    fromCreateChannel: boolean;
    fromDeleteChannel: boolean;
    isFromSecondWindow: boolean;
    closeCreateDialogSubject: BehaviorSubject<boolean>;
    closeDeleteDialogSubject: BehaviorSubject<boolean>;
    shouldQuitButtonDisableSubject: BehaviorSubject<boolean>;
    shouldChannelButtonDisableSubject: BehaviorSubject<boolean>;
    windowShouldOpenSubject: BehaviorSubject<boolean>;
    isDetachedSubject: BehaviorSubject<boolean>;
    shouldRefreshToHome: BehaviorSubject<boolean>;
    timer: any;

    constructor(readonly ipc: IpcService, public ngZone: NgZone, private chatService: ChatService) {
        this.isFromSecondWindow = false;
        this.fromDeleteChannel = false;
        this.newChannelName = '';
        this.joinChannelKey = '';
        this.deletedChannel = {} as Channel;
        this.closeCreateDialogSubject = new BehaviorSubject<boolean>(false);
        this.closeDeleteDialogSubject = new BehaviorSubject<boolean>(false);
        this.shouldQuitButtonDisableSubject = new BehaviorSubject<boolean>(false);
        this.shouldChannelButtonDisableSubject = new BehaviorSubject<boolean>(false);
        this.isDetachedSubject = new BehaviorSubject<boolean>(false);
        this.windowShouldOpenSubject = new BehaviorSubject<boolean>(false);
        this.shouldRefreshToHome = new BehaviorSubject<boolean>(false);
    }

    setNewChannelName(name: string): void {
        this.newChannelName = name;
    }

    setJoinedKey(key: string): void {
        this.joinChannelKey = key;
    }

    setDeletedChannel(channel: Channel): void {
        this.deletedChannel = channel;
    }

    createWindow(): void {
        this.shouldRefreshToHome.next(true);
        this.fromCreateChannel = true;
        this.isFromSecondWindow = true;

        this.ipc.send('createWindow');
        this.closeChildWindow();
        localStorage.setItem('currentChannel', this.chatService.$activeChannel.getValue().shareKey);
        localStorage.setItem('joinTime', this.chatService.joinTime.toString());
    }

    closeChildWindow(): void {
        this.ipc.on('shouldChildWindowClose', async (event: any, arg: any) => {
            this.ngZone.run(() => {
                this.isDetachedSubject.next(false);
                this.windowShouldOpenSubject.next(false);
                this.shouldRefreshToHome.next(false);
                this.isFromSecondWindow = false;
            });
        });
    }

    ngOnInit(): void {}
}
