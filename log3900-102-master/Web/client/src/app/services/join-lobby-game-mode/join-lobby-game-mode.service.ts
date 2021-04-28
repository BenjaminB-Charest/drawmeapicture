import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class JoinLobbyGameModeService {
    mode: string;
    constructor() {
        this.mode = '';
    }

    setGameMode(mode: string): void {
        this.mode = mode;
    }
}
