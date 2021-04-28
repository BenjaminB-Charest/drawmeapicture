import { GameDifficulty } from '../enums/game-difficulty';
import { GameModes } from '../enums/game-modes';
import { GameStates } from '../enums/game-states';
import { PlayerPositions } from '../enums/player-positions';
import { PlayerStates } from '../enums/player-states';

export interface Game {
  id: string;
  host: string;
  currentImageId: string;
  mode: GameModes;
  state: GameStates;
  difficulty: GameDifficulty;
  round: number;
  start: Date;
  nextEvent: Date;
  players: Map<string, PlayerPositions>;
  roles: Map<string, PlayerStates>;
  scores: Map<string, number>;
  users: string[];
}
