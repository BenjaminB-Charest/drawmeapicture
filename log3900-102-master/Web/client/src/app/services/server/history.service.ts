import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { MILLISECOND_MULTIPLIER } from 'src/app/classes/constants';
import { Game } from 'src/app/interfaces/game';
import { LoginHistory } from 'src/app/interfaces/login-history';
import { ProfilGame } from 'src/app/interfaces/profil-game';
import { SoloGame } from 'src/app/interfaces/solo-game';
import { FirebaseApiService } from './firebase-api.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  avatarDictionary: AvatarDictionary;
  constructor(private db: AngularFirestore, public firebaseAPI: FirebaseApiService) {
    this.avatarDictionary = new AvatarDictionary();
  }

  async getGames(): Promise<ProfilGame[]> {
    const gameList: ProfilGame[] = [];
    await this.db.collection('games').ref
      .where('users', 'array-contains', localStorage.getItem('username') as string)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((val) => {
          const game = val.data() as Game;
          let playerScore = 0;
          const playerNames: string[] = [];
          const avatarsList: string[] = [];
          for (const [key, score] of Object.entries(game.scores)) {
            if (key === localStorage.getItem('username') as string) {
              playerScore = score;
            }
            playerNames.push(key);
          }
          let playerPlacement = 1;
          for (const score of Object.values(game.scores)) {
            if (score > playerScore) {
              playerPlacement++;
            }
          }
          for (const user of playerNames) {
            avatarsList.push(this.avatarDictionary.avatarMap.get(this.firebaseAPI.userAvatars.getValue().get(user) as string) as string);
          }
          const time = this.calculateTime(game);
          const secondsCalculated = Math.floor(((time * 100) % 100) / 100 * 60);
          const minutesCalculated = Math.floor(time);
          gameList.push({
              gameMode: 'Classic',
              players: playerNames,
              score: playerScore,
              time: time.toFixed(2),
              seconds: secondsCalculated.toString(),
              minutes: minutesCalculated.toString(),
              placement: playerPlacement,
              startTime: game.start,
              date: new Date(this.dateToMilliSeconds(game.start)),
              avatars: avatarsList,
          });
        });
      });
    return this.db.collection('solo-games').ref
      .where('host', '==', localStorage.getItem('username') as string)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((val) => {
          console.log(val.id);
          const game = val.data() as SoloGame;
          const playerNames: string[] = [];
          const avatarsList: string[] = [];
          playerNames.push(game.host);
          for (const user of playerNames) {
            avatarsList.push(this.avatarDictionary.avatarMap.get(this.firebaseAPI.userAvatars.getValue().get(user) as string) as string);
          }
          const time = this.calculateSoloTime(game);
          const secondsCalculated = Math.floor(((time * 100) % 100) / 100 * 60);
          const minutesCalculated = Math.floor(time);
          if (time > 0) {
            gameList.push({
                gameMode: 'Solo',
                players: playerNames,
                score: game.score,
                time: time.toFixed(2),
                seconds: secondsCalculated.toString(),
                minutes: minutesCalculated.toString(),
                placement: -1,
                startTime: game.start,
                date: new Date(this.dateToMilliSeconds(game.start)),
                avatars: avatarsList,
            });
          }
        });
        gameList.sort((a: ProfilGame, b: ProfilGame) => {
          if (new Date(this.dateToMilliSeconds(a.startTime)) < new Date(this.dateToMilliSeconds(b.startTime))) {
            return 1;
          } else if (new Date(this.dateToMilliSeconds(a.startTime)) > new Date(this.dateToMilliSeconds(b.startTime))) {
            return -1;
          }
          return 0;
        });
        return gameList;
      });
  }

  async getLoginHistory(): Promise<LoginHistory[]> {
    const loginsList: LoginHistory[] = [];
    return this.db.collection('loginHistory')
      .ref
      .where('user', '==', localStorage.getItem('username') as string)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          const login = doc.data() as LoginHistory;
          if (login.logoff > login.login) {
            const newLogin = {
              login: new Date(this.dateToMilliSeconds(login.login)),
              logoff: new Date(this.dateToMilliSeconds(login.logoff)),
              user: login.user,
            };
            loginsList.push(newLogin);
          }
        });
        loginsList.sort((a: LoginHistory, b: LoginHistory) => {
          if (new Date(a.login) < new Date(b.login)) {
            return 1;
          } else if (new Date(a.login) > new Date(b.login)) {
            return -1;
          }
          return 0;
        });
        return loginsList;
      });
  }

  calculateTime(game: Game): number {
    const start = this.dateToMilliSeconds(game.start);
    const end = this.dateToMilliSeconds(game.nextEvent);
    return this.millisecondsToMinutes(end - start);
  }

  calculateSoloTime(game: SoloGame): number {
    const start = this.dateToMilliSeconds(game.start);
    const end = this.dateToMilliSeconds(game.end);
    return this.millisecondsToMinutes(end - start);
  }

  millisecondsToMinutes(time: number): number {
    return time / MILLISECOND_MULTIPLIER;
  }

  compareDate(firstDate: Date, secondDate: Date): boolean {
    return firstDate < secondDate;
  }

  dateToMilliSeconds(date: Date): number {
    return (date as unknown as firebase.firestore.Timestamp).toMillis();
  }

}
