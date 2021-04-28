import { GameDifficulty } from "../enums/game-difficulty";

export interface SoloGame {
    id: string;
    host: string;
    difficulty: GameDifficulty;
    currentImageId: string;
    state: number;
    correctAttempts: number;
    totalAttempts: number;
    start: Date;
    end: Date;
    score: number;
}
