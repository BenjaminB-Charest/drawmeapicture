import {GameDifficulty} from "../enums/game-difficulty";
import {GameModes} from "../enums/game-modes";
import {PlayerPositions} from "../enums/player-positions";

export interface Lobby {
    id: string,
    name: string,
    gameId: string,
    difficulty: GameDifficulty,
    host: string,
    mode: GameModes,
    players: Map<string, PlayerPositions>,
    isPublic: boolean,
    shareKey: string
}
