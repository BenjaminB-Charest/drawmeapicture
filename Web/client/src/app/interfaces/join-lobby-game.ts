import { JoinLobbyPlayer } from './join-lobby-player';

export interface JoinLobbyGame {
    name: string;
    players: JoinLobbyPlayer[];
    id: string;
}
