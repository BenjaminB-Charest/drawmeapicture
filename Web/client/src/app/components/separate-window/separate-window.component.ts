import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { Channel } from 'src/app/interfaces/channel';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { SeparateAddChannelComponent } from '../separate-add-channel/separate-add-channel.component';
import { SeparateRemoveChannelComponent } from '../separate-remove-channel/separate-remove-channel.component';

@Component({
    selector: 'app-separate-window',
    templateUrl: './separate-window.component.html',
    styleUrls: ['./separate-window.component.scss'],
})
export class SeparateWindowComponent implements OnInit, OnDestroy {
    isDetached: boolean;
    channels: Channel[] = [];
    selectedChannel: Channel;
    shouldButtonBeDisabledSubscription: Subscription;
    @ViewChild('add', { static: false }) addButton: HTMLButtonElement;
    @ViewChild('remove', { static: false }) removeButton: HTMLButtonElement;

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
        this.dialog.open(SeparateAddChannelComponent, dialogConfig);
        this.channelPanelService.shouldChannelButtonDisableSubject.next(true);
    }

    openDeleteChannelDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '300px';
        dialogConfig.height = 'auto';
        dialogConfig.autoFocus = false;
        dialogConfig.hasBackdrop = false;
        this.dialog.open(SeparateRemoveChannelComponent, dialogConfig);
        this.channelPanelService.shouldChannelButtonDisableSubject.next(true);
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
            if (this.addButton && this.removeButton) {
                this.addButton.disabled = shouldDisable;
                this.removeButton.disabled = shouldDisable;
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
