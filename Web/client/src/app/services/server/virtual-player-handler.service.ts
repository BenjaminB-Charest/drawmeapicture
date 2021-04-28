import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GameModes } from 'src/app/enums/game-modes';
import { GameStates } from 'src/app/enums/game-states';
import { PlayerStates } from 'src/app/enums/player-states';
import { Game } from 'src/app/interfaces/game';
import { SoloGame } from 'src/app/interfaces/solo-game';
import { GameEngineService } from 'src/app/services/game-engine/game-engine.service';
import { SoloSprintEngineService } from 'src/app/services/solo-srpint-engine/solo-sprint-engine.service';
 // tslint:disable: deprecation
@Injectable({
  providedIn: 'root'
})
export class VirtualPlayerHandlerService {
    gameSubscription: Subscription;
    soloSprintSubscription: Subscription;
    virtualPlayerRoles: PlayerStates[] = [];
    drawingVP: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    doneDrawing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    soloDrawingVP: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    timeoutVal: NodeJS.Timeout;
    lastImageId: string;

    constructor(private gameEngine: GameEngineService, private sprintSolo: SoloSprintEngineService) {
      this.virtualPlayerRoles.push(PlayerStates.Waiting, PlayerStates.Waiting);
      this.lastImageId = '';
      this.gameSubscription = this.gameEngine.$game.subscribe((game) => {
        clearInterval(this.timeoutVal);
        this.timeoutVal = setTimeout(() => {
          this.hostDrawingForVP(game);
        },2000);
      });
      this.soloSprintSubscription = this.sprintSolo.$game.subscribe(() => {
        clearInterval(this.timeoutVal);
        this.timeoutVal = setTimeout(() => {
          this.virtualPlayerDrawSoloGame(sprintSolo.$game.getValue());
        },3000);
      });
    }

    hostDrawingForVP(game: Game): void {
      // tslint:disable-next-line: prefer-switch
      if (game.mode === GameModes.Classic_PPvPP ||
          game.mode === GameModes.Solo_Sprint ||
          game.mode === GameModes.Coop_Sprint) {
        return;
      }
      this.virtualPlayerRoles[0] = PlayerStates.Waiting;
      this.virtualPlayerRoles[1] = PlayerStates.Waiting;
      switch (game.mode) {
        case GameModes.Classic_RPvRP:
          this.virtualPlayerRoles[0] = this.gameEngine.getRole(GameModes.Classic_RPvRP, game.round, 0);
          this.virtualPlayerRoles[1] = this.gameEngine.getRole(GameModes.Classic_RPvRP, game.round, 1);
          break;
        case GameModes.Classic_RPvPP:
          this.virtualPlayerRoles[0] = this.gameEngine.getRole(GameModes.Classic_RPvPP, game.round, 0);
          break;
        case GameModes.Classic_PPvRP:
          this.virtualPlayerRoles[1] = this.gameEngine.getRole(GameModes.Classic_PPvRP, game.round, 1);
          break;
      }
      this.processRoles(game);
    }

    processRoles(game: Game): void {
      if ((this.virtualPlayerRoles[0] === PlayerStates.DrawingRobot ||
          this.virtualPlayerRoles[1] === PlayerStates.DrawingRobot) &&
          game.state === GameStates.DrawAndGuessFirst) {
        this.drawingVP.next(true);
      }
    }

  virtualPlayerDrawSoloGame(soloGame: SoloGame): void {
    if (soloGame.currentImageId !== this.lastImageId && soloGame.currentImageId !== '') {
        this.lastImageId = soloGame.currentImageId;
        this.soloDrawingVP.next(true);
      }
  }

  initializeValues(): void {
    this.virtualPlayerRoles = [];
    this.virtualPlayerRoles.push(PlayerStates.Waiting, PlayerStates.Waiting);
    this.lastImageId = '';
    this.drawingVP.next(false);
    this.doneDrawing.next(false);
    this.soloDrawingVP.next(false);
  }
}
