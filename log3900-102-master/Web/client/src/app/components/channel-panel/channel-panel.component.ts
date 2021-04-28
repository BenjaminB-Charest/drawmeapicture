import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Channel } from 'src/app/interfaces/channel';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { AddChannelComponent } from '../add-channel/add-channel.component';
import { RemoveChannelComponent } from '../remove-channel/remove-channel.component';

@Component({
    selector: 'app-channel-panel',
    templateUrl: './channel-panel.component.html',
    styleUrls: ['./channel-panel.component.scss'],
})
export class ChannelPanelComponent implements OnInit, OnDestroy {
    isDetached: boolean;
    channels: Channel[] = [];
    selectedChannel: Channel;
    shouldButtonBeDisabledSubscription: Subscription;
    @ViewChild('add', { static: false }) addButton: HTMLButtonElement;
    @ViewChild('remove', { static: false }) removeButton: HTMLButtonElement;
    @ViewChild('detach', { static: false }) detachButton: HTMLButtonElement;

    isDetachedSubscription: Subscription;
    channelSubscription: Subscription;
    availableChannelsSubscription: Subscription;

    constructor(public channelPanelService: ChannelPanelService, public chatService: ChatService, private dialog: MatDialog) {
        this.chatService.getAvailableChannels();
        this.chatService.subscribeToChannel(this.chatService.$activeChannel.getValue());
    }

    openAddChannelDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '280px';
        dialogConfig.height = 'auto';
        dialogConfig.autoFocus = false;
        dialogConfig.hasBackdrop = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '123px', left: '1361px' };
        this.dialog.open(AddChannelComponent, dialogConfig);
        this.channelPanelService.shouldChannelButtonDisableSubject.next(true);
    }

    openDeleteChannelDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '300px';
        dialogConfig.height = 'auto';
        dialogConfig.autoFocus = false;
        dialogConfig.hasBackdrop = false;
        dialogConfig.position = { top: '120px', left: '1361px' };
        this.dialog.open(RemoveChannelComponent, dialogConfig);
        this.channelPanelService.shouldChannelButtonDisableSubject.next(true);
    }

    onDetach(): void {
        this.isDetached = true;
        this.channelPanelService.isDetachedSubject.next(true);
        this.channelPanelService.createWindow();
    }

    ngOnInit(): void {
        this.isDetachedSubscription = this.channelPanelService.isDetachedSubject.subscribe(isDetached => {
            this.isDetached = isDetached;
        });
        this.channelSubscription = this.chatService.$activeChannel.subscribe((channel: Channel) => {
            this.selectedChannel = channel;
        });
        this.availableChannelsSubscription = this.chatService.$availableChannels.subscribe((channels: Channel[]) => {
            this.channels = channels;
        });
        this.shouldButtonBeDisabledSubscription = this.channelPanelService.shouldChannelButtonDisableSubject.subscribe(shouldDisable => {
            if (this.addButton && this.removeButton && this.detachButton) {
                this.addButton.disabled = shouldDisable;
                this.removeButton.disabled = shouldDisable;
                this.detachButton.disabled = shouldDisable;
            }
        });
    }

    ngOnDestroy(): void {
        if (this.isDetachedSubscription) {
            this.isDetachedSubscription.unsubscribe();
        }
        if (this.channelSubscription) {
            this.channelSubscription.unsubscribe();
        }
        if (this.availableChannelsSubscription) {
            this.availableChannelsSubscription.unsubscribe();
        }
        if (this.shouldButtonBeDisabledSubscription) {
            this.shouldButtonBeDisabledSubscription.unsubscribe();
        }
    }

    setSelectedChannel(channel: Channel): void {
        localStorage.setItem('channelName', channel.name);
        this.chatService.changeChannel(channel);
    }
}
