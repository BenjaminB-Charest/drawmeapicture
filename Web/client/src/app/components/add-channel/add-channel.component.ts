import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { UserService } from 'src/app/services/server/user.service';
import { AddChannelAreYouSureComponent } from '../add-channel-are-you-sure/add-channel-are-you-sure.component';

@Component({
    selector: 'app-add-channel',
    templateUrl: './add-channel.component.html',
    styleUrls: ['./add-channel.component.scss'],
})
export class AddChannelComponent implements OnInit, OnDestroy {
    avatar: string;
    name: string;
    key: string;
    shouldDisable: boolean;
    avatarDictionary: AvatarDictionary;
    closeDialogSubscription: Subscription;
    @ViewChild('quit', { static: false }) quitButton: HTMLButtonElement;

    constructor(private userService: UserService, public channelPanelService: ChannelPanelService, private dialog: MatDialog) {
        this.name = '';
        this.key = '';
        this.shouldDisable = false;
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    shouldAddChannelDisable(): boolean {
        if (this.name.trim() === '' || this.name.trim().length > 15) {
            return true;
        } else {
            return false;
        }
    }

    shouldJoinChannelDisable(): boolean {
        if (this.key.trim() === '' || this.key.trim().length > 6) {
            return true;
        } else {
            return false;
        }
    }

    addChannel(): void {
        this.channelPanelService.setNewChannelName(this.name);
        this.channelPanelService.fromCreateChannel = true;
        this.openAreYouSureDialog();
        this.channelPanelService.shouldQuitButtonDisableSubject.next(true);
    }

    joinChannel(): void {
        this.channelPanelService.setJoinedKey(this.key);
        this.channelPanelService.fromCreateChannel = false;
        this.openAreYouSureDialog();
        this.channelPanelService.shouldQuitButtonDisableSubject.next(true);
    }

    onExit(): void {
        this.channelPanelService.shouldChannelButtonDisableSubject.next(false);
    }

    private openAreYouSureDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.hasBackdrop = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '145px', left: '1379px' };
        this.dialog.open(AddChannelAreYouSureComponent, dialogConfig);
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.closeDialogSubscription = this.channelPanelService.closeCreateDialogSubject.subscribe(shouldClose => {
            if (shouldClose) {
                this.dialog.closeAll();
                this.channelPanelService.closeCreateDialogSubject.next(false);
            }
        });
    }

    ngOnDestroy(): void {
        this.closeDialogSubscription.unsubscribe();
    }
}
