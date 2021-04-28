import {PlayerStates} from "./enums/player-states";

// All positions arrays have the following structure:
// POSITIONS[PlayerPositions][GameRounds] = PlayerStates
// e.g. POSITIONS_PPvRP[B2][R1] = GuessingSecond

export const POSITIONS_PPvPP = [
  [PlayerStates.DrawingPlayer, PlayerStates.GuessingSecond, PlayerStates.GuessingFirst, PlayerStates.Waiting],
  [PlayerStates.GuessingSecond, PlayerStates.DrawingPlayer, PlayerStates.Waiting, PlayerStates.GuessingFirst],
  [PlayerStates.GuessingFirst, PlayerStates.Waiting, PlayerStates.DrawingPlayer, PlayerStates.GuessingSecond],
  [PlayerStates.Waiting, PlayerStates.GuessingFirst, PlayerStates.GuessingSecond, PlayerStates.DrawingPlayer],
];

export const POSITIONS_RPvPP = [
  [PlayerStates.DrawingRobot, PlayerStates.Waiting, PlayerStates.DrawingRobot, PlayerStates.Waiting],
  [PlayerStates.GuessingSecond, PlayerStates.DrawingPlayer, PlayerStates.Waiting, PlayerStates.GuessingFirst],
  [PlayerStates.GuessingFirst, PlayerStates.GuessingSecond, PlayerStates.GuessingFirst, PlayerStates.GuessingSecond],
  [PlayerStates.Waiting, PlayerStates.GuessingFirst, PlayerStates.GuessingSecond, PlayerStates.DrawingPlayer],
];

export const POSITIONS_PPvRP = [
  [PlayerStates.DrawingPlayer, PlayerStates.GuessingSecond, PlayerStates.GuessingFirst, PlayerStates.Waiting],
  [PlayerStates.Waiting, PlayerStates.DrawingRobot, PlayerStates.Waiting, PlayerStates.DrawingRobot],
  [PlayerStates.GuessingFirst, PlayerStates.Waiting, PlayerStates.DrawingPlayer, PlayerStates.GuessingSecond],
  [PlayerStates.GuessingSecond, PlayerStates.GuessingFirst, PlayerStates.GuessingSecond, PlayerStates.GuessingFirst],
];

export const POSITIONS_RPvRP = [
  [PlayerStates.DrawingRobot, PlayerStates.Waiting, PlayerStates.DrawingRobot, PlayerStates.Waiting],
  [PlayerStates.Waiting, PlayerStates.DrawingRobot, PlayerStates.Waiting, PlayerStates.DrawingRobot],
  [PlayerStates.GuessingFirst, PlayerStates.GuessingSecond, PlayerStates.GuessingFirst, PlayerStates.GuessingSecond],
  [PlayerStates.GuessingSecond, PlayerStates.GuessingFirst, PlayerStates.GuessingSecond, PlayerStates.GuessingFirst],
];
