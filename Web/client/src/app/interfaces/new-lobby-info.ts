import { GameDifficulty } from '../enums/game-difficulty';
import { GameModes } from '../enums/game-modes';
import { Privacy } from '../enums/privacy.enum';

export interface NewLobbyInfo {
    name: string;
    privacy: Privacy.private | Privacy.public;
    mode:
        | GameModes.Classic_PPvPP
        | GameModes.Classic_PPvRP
        | GameModes.Classic_RPvPP
        | GameModes.Classic_RPvRP
        | GameModes.Coop_Sprint
        | GameModes.Solo_Sprint;
    difficulty: GameDifficulty.Easy | GameDifficulty.Normal | GameDifficulty.Hard;
}
