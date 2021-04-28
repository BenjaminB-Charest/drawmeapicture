import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { Channel } from 'src/app/interfaces/channel';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { UserService } from 'src/app/services/server/user.service';
import { SeparateAddChannelAreYouSureComponent } from '../separate-add-channel-are-you-sure/separate-add-channel-are-you-sure.component';

@Component({
    selector: 'app-separate-remove-channel',
    templateUrl: './separate-remove-channel.component.html',
    styleUrls: ['./separate-remove-channel.component.scss'],
})
export class SeparateRemoveChannelComponent implements OnInit, OnDestroy {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    channels: Channel[] = [];
    channelSubscription: Subscription;
    shouldCloseDialogSubscription: Subscription;
    constructor(
        private userService: UserService,
        private chatService: ChatService,
        public channelPanelService: ChannelPanelService,
        private dialog: MatDialog,
    ) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    deleteChannel(channel: Channel): void {
        this.channelPanelService.setDeletedChannel(channel);
        this.channelPanelService.shouldQuitButtonDisableSubject.next(true);
        this.channelPanelService.fromDeleteChannel = true;
        this.openAreYouSureDialog();
    }

    onExit(): void {
        this.channelPanelService.shouldChannelButtonDisableSubject.next(false);
    }

    private openAreYouSureDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.autoFocus = false;
        dialogConfig.hasBackdrop = false;
        this.dialog.open(SeparateAddChannelAreYouSureComponent, dialogConfig);
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.channelSubscription = this.chatService.$availableChannels.subscribe((channels: Channel[]) => {
            for (const channel of channels) {
                if (channel.shareKey !== 'ABCDEF') {
                    this.channels.push(channel);
                }
            }
        });
        this.shouldCloseDialogSubscription = this.channelPanelService.closeDeleteDialogSubject.subscribe(shouldClose => {
            if (shouldClose) {
                this.dialog.closeAll();
                this.channelPanelService.closeDeleteDialogSubject.next(false);
            }
        });
    }
    ngOnDestroy(): void {
        this.channelSubscription.unsubscribe();
        this.shouldCloseDialogSubscription.unsubscribe();
    }
}
