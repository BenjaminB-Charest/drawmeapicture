import { GameLobbyPlayer } from './game-lobby-player';

export class EndGamePlayer implements GameLobbyPlayer {
    name: string;
    badges: string[];
    avatar: string;
    isVP: boolean;
    score: number;
    team: string;
    position: number;
    constructor(name: string, badges: string[], avatar: string, isVp: boolean, score: number, team: string, position: number) {
        this.name = name;
        this.badges = badges;
        this.avatar = avatar;
        this.isVP = isVp;
        this.score = score;
        this.team = team;
        this.position = position;
    }
}
