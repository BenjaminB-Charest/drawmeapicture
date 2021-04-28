import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { Channel } from 'src/app/interfaces/channel';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-separate-add-channel-are-you-sure',
    templateUrl: './separate-add-channel-are-you-sure.component.html',
    styleUrls: ['./separate-add-channel-are-you-sure.component.scss'],
})
export class SeparateAddChannelAreYouSureComponent implements OnInit {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    constructor(
        private channelPanelService: ChannelPanelService,
        private chatService: ChatService,
        private userService: UserService,
        private matSnackBar: MatSnackBar,
        private firebaseAPI: FirebaseApiService,
    ) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    onBack(): void {
        this.channelPanelService.shouldQuitButtonDisableSubject.next(false);
    }

    onOK(): void {
        this.channelPanelService.shouldChannelButtonDisableSubject.next(false);
        if (this.channelPanelService.fromDeleteChannel) {
            this.channelPanelService.closeDeleteDialogSubject.next(true);
            this.channelPanelService.shouldQuitButtonDisableSubject.next(false);
            this.firebaseAPI.removeChannel(this.channelPanelService.deletedChannel.shareKey);
            const generalChannel = this.chatService.$availableChannels.getValue().find(channel => {
                if (channel.shareKey === 'ABCDEF') {
                    return true;
                }
                return false;
            });
            this.chatService.changeChannel(generalChannel as Channel);
            this.matSnackBar.open('Channel Deleted!', 'OK', { duration: 2000, horizontalPosition: 'left', verticalPosition: 'bottom' });
            this.channelPanelService.fromDeleteChannel = false;
            return;
        }
        if (this.channelPanelService.fromCreateChannel) {
            this.channelPanelService.shouldQuitButtonDisableSubject.next(false);
            this.channelPanelService.closeCreateDialogSubject.next(true);
            this.channelPanelService.shouldQuitButtonDisableSubject.next(false);
            this.chatService.createChannel(this.channelPanelService.newChannelName);
            this.matSnackBar.open('Channel Created!', 'OK', { duration: 2000, horizontalPosition: 'left', verticalPosition: 'bottom' });
            this.channelPanelService.fromCreateChannel = false;
        } else if (!this.channelPanelService.fromCreateChannel) {
            this.channelPanelService.shouldQuitButtonDisableSubject.next(false);
            this.channelPanelService.closeCreateDialogSubject.next(true);
            this.chatService.joinExistingChannelButton(this.channelPanelService.joinChannelKey.toUpperCase());
        }
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
