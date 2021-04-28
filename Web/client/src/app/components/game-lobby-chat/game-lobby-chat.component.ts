import { Component } from '@angular/core';

@Component({
    selector: 'app-game-lobby-chat',
    templateUrl: './game-lobby-chat.component.html',
    styleUrls: ['./game-lobby-chat.component.scss'],
    styles: [':host-context(.game-lobby) .lobby-chat-wrapper{height:170px}'],
})
export class GameLobbyChatComponent {
    channels: any[];
    selectedChannel: any;

    constructor() {
        // Temporary fills
        this.channels = [
            { name: 'Benjamin', participants: 1, privacy: 'private' },
            { name: 'Vlad', participants: 1, privacy: 'private' },
            { name: 'Body', participants: 1, privacy: 'private' },
            { name: 'ody', participants: 1, privacy: 'private' },
            { name: 'ody', participants: 1, privacy: 'private' },
            { name: 'ody', participants: 1, privacy: 'private' },
            { name: 'ody', participants: 1, privacy: 'private' },
            { name: 'ody', participants: 1, privacy: 'private' },
            { name: 'ody', participants: 1, privacy: 'private' },
        ];
        this.selectedChannel = this.channels[0];
    }

    setSelectedChannel(channel: any): void {
        this.selectedChannel = channel;
    }
}
