import { LobbyPlayerInterface } from './lobby-player-interface';

export class GameLobbyPlayer implements LobbyPlayerInterface {
    name: string;
    badges: string[];
    avatar: string;
    isVP: boolean;
    constructor(name: string, badges: string[], avatar: string) {
        this.name = name;
        this.badges = badges;
        this.avatar = avatar;
        this.isVP = false;
    }
}
