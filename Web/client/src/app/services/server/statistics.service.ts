import { Injectable } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import firebase from 'firebase';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MILLISECOND_MULTIPLIER } from 'src/app/classes/constants';
import { Game } from 'src/app/interfaces/game';
import { SoloGame } from 'src/app/interfaces/solo-game';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  gameList: Game[];
  totalGames: BehaviorSubject<number>;
  victoryPercent: BehaviorSubject<number>;
  gamesWon: BehaviorSubject<number>;
  averageGameTime: BehaviorSubject<number>;
  averageGameSeconds: BehaviorSubject<number>;
  averageGameMinutes: BehaviorSubject<number>;
  totalGameTime: BehaviorSubject<number>;
  bestClassicGameScore: BehaviorSubject<number>;
  totalGamesSolo: BehaviorSubject<number>;
  averageGameTimeSolo: BehaviorSubject<number>;
  averageGameSecondsSolo: BehaviorSubject<number>;
  averageGameMinutesSolo: BehaviorSubject<number>;
  totalGameTimeSolo: BehaviorSubject<number>;
  bestGameScoreSolo: BehaviorSubject<number>;
  imagesCreated: BehaviorSubject<number>;
  statisticsCalculated: BehaviorSubject<boolean>;
  constructor(private db: AngularFirestore) {
    this.gameList = [];
    this.averageGameSeconds = new BehaviorSubject<number>(0);
    this.averageGameMinutes = new BehaviorSubject<number>(0);
    this.averageGameSecondsSolo = new BehaviorSubject<number>(0);
    this.averageGameMinutesSolo = new BehaviorSubject<number>(0);
    this.victoryPercent = new BehaviorSubject<number>(0);
    this.totalGames = new BehaviorSubject<number>(0);
    this.gamesWon = new BehaviorSubject<number>(0);
    this.averageGameTime = new BehaviorSubject<number>(0);
    this.totalGameTime = new BehaviorSubject<number>(0);
    this.imagesCreated = new BehaviorSubject<number>(0);
    this.bestClassicGameScore = new BehaviorSubject<number>(0);
    this.totalGamesSolo = new BehaviorSubject<number>(0);
    this.averageGameTimeSolo = new BehaviorSubject<number>(0);
    this.totalGameTimeSolo = new BehaviorSubject<number>(0);
    this.bestGameScoreSolo = new BehaviorSubject<number>(0);
    this.statisticsCalculated = new BehaviorSubject<boolean>(false);
  }

  async getTotalGames(withDrawings?: boolean): Promise<void> {
      this.averageGameSeconds = new BehaviorSubject<number>(0);
      this.averageGameMinutes = new BehaviorSubject<number>(0);
      this.averageGameSecondsSolo = new BehaviorSubject<number>(0);
      this.averageGameMinutesSolo = new BehaviorSubject<number>(0);
      this.victoryPercent = new BehaviorSubject<number>(0);
      this.totalGames = new BehaviorSubject<number>(0);
      this.gamesWon = new BehaviorSubject<number>(0);
      this.averageGameTime = new BehaviorSubject<number>(0);
      this.totalGameTime = new BehaviorSubject<number>(0);
      this.imagesCreated = new BehaviorSubject<number>(0);
      this.bestClassicGameScore = new BehaviorSubject<number>(0);
      this.totalGamesSolo = new BehaviorSubject<number>(0);
      this.averageGameTimeSolo = new BehaviorSubject<number>(0);
      this.totalGameTimeSolo = new BehaviorSubject<number>(0);
      this.bestGameScoreSolo = new BehaviorSubject<number>(0);
      await this.db.collection('games').ref
        .where('users', 'array-contains', localStorage.getItem('username') as string)
        .get()
        .then((querySnapshot) => {
          this.totalGames.next(querySnapshot.size);
          this.victoryPercentage(querySnapshot as any);
        });

      await this.db.collection('solo-games').ref.
        where('host', '==', localStorage.getItem('username') as string)
        .where('state', '==', 4)
        .get()
        .then((querySnapshotSolo) => {
          this.statsSolo(querySnapshotSolo as any);
        });
      if (withDrawings !== undefined && withDrawings) {
        await this.db.collection('drawings-library').ref
          .where('authorId', '==', localStorage.getItem('username') as string)
        .get()
        .then((querySnapshotDrawings) => {
          this.imagesCreated.next(querySnapshotDrawings.size);
        });
      }
  }

  victoryPercentage(gameList: QuerySnapshot<unknown>): void {
    let counter = 1;
    gameList.forEach((gameVal) => {
      const game = gameVal.data() as Game;
      const teamA = [];
      let isInTeamA = false;
      let teamAScore = 0;
      let teamBScore = 0;
      const teamB = [];
      for (const [key, position] of Object.entries(game.players)) {
        if (key === localStorage.getItem('username')) {
          if (position % 2) {
            isInTeamA = true;
          }
        }
        if (position % 2) {
          teamA.push(key);
        } else {
          teamB.push(key);
        }
      }
      for (const [key, score] of Object.entries(game.scores)) {
        if (key === localStorage.getItem('username') && score > this.bestClassicGameScore.getValue()) {
          this.bestClassicGameScore.next(score);
        }
        if (teamA.includes(key)) {
          teamAScore += score;
        } else if (teamB.includes(key)) {
          teamBScore += score;
        }
      }
      if (isInTeamA && teamAScore >= teamBScore) {
        this.gamesWon.next(this.gamesWon.getValue() + 1);
      } else if (!isInTeamA && teamBScore >= teamAScore) {
        this.gamesWon.next(this.gamesWon.getValue() + 1);
      }
      this.victoryPercent.next(Math.floor(this.gamesWon.getValue() / this.totalGames.getValue() * 100));
      const nextEvent = this.dateToMilliSeconds(game.nextEvent);
      const start = this.dateToMilliSeconds(game.start);
      this.totalGameTime.next( this.totalGameTime.getValue() +
        this.millisecondsToMinutes(
        + (new Date(nextEvent).getTime()
        - new Date(start).getTime())));
      this.averageGameTime.next((((new Date(nextEvent).getTime() - new Date(start).getTime()) +
        (this.minutesToMilliSeconds(this.averageGameTime.getValue()) * (counter - 1)))
        / (counter++ * MILLISECOND_MULTIPLIER)));
      this.averageGameMinutes.next(Math.floor(this.averageGameTime.getValue()));
      this.averageGameSeconds.next(Math.floor(((this.averageGameTime.getValue() * 100) % 100) / 100 * 60));
    });
  }

  statsSolo(soloGameList: QuerySnapshot<unknown>): void {
    let counter = 1;
    soloGameList.forEach((gameData) => {
      const game = gameData.data() as SoloGame;
      const end = this.dateToMilliSeconds(game.end);
      const start = this.dateToMilliSeconds(game.start);
      const time = this.millisecondsToMinutes(
        + new Date(end).getTime()
        - new Date(start).getTime());
      if (time > 0) {
        this.totalGamesSolo.next(this.totalGamesSolo.getValue() + 1);
        if (game.score > this.bestGameScoreSolo.getValue()) {
        this.bestGameScoreSolo.next(game.score);
        }
        this.totalGameTimeSolo.next(this.totalGameTimeSolo.getValue() +
        this.millisecondsToMinutes(
        + new Date(end).getTime()
        - new Date(start).getTime()));
        this.averageGameTimeSolo.next((((new Date(end).getTime() - new Date(start).getTime()) +
        (this.minutesToMilliSeconds(this.averageGameTimeSolo.getValue()) * (counter - 1)))
        / (counter++ * MILLISECOND_MULTIPLIER)));
        this.averageGameMinutesSolo.next(Math.floor(this.averageGameTimeSolo.getValue()));
        this.averageGameSecondsSolo.next(Math.floor(((this.averageGameTimeSolo.getValue() * 100) % 100) / 100 * 60));
      }
    });
  }

  millisecondsToMinutes(time: number): number {
    return time / MILLISECOND_MULTIPLIER;
  }

  minutesToMilliSeconds(time: number): number {
    return time * MILLISECOND_MULTIPLIER;
  }

  dateToMilliSeconds(date: Date): number {
    return (date as unknown as firebase.firestore.Timestamp).toMillis();
  }
}
