import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CLOUD_FUNCTIONS_ROOT, LEADERBOARD_ENDPOINT } from 'src/app/classes/constants';
import { Leaderboard } from 'src/app/interfaces/leaderboard';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  leaderboard: Leaderboard;
  leaderBoardSubject: BehaviorSubject<Leaderboard>;
  constructor(private http: HttpClient) {
    this.leaderBoardSubject = new BehaviorSubject<Leaderboard>({} as Leaderboard);
  }

  async getLeaderBoards(): Promise<void> {
    this.leaderboard = {} as Leaderboard;
    this.leaderBoardSubject.next({} as Leaderboard);
    this.http.post(CLOUD_FUNCTIONS_ROOT + LEADERBOARD_ENDPOINT, {}).toPromise().then((res: any) => {
      this.leaderboard = res.data.leaderboard;
      this.leaderBoardSubject.next(res.data.leaderboard as Leaderboard);
    });
  }
}
