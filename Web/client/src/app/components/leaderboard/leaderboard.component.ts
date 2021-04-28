import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { LeaderboardPlayer } from 'src/app/interfaces/leaderboard-player';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { LeaderboardService } from 'src/app/services/server/leaderboard.service';
import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit, OnDestroy {
    avatar: string;
    avatarDictionary: AvatarDictionary;

    tabArray: number[] = [0, 0];
    rank: number;
    score: number;

    classicToday: LeaderboardPlayer[] = [];
    classicWeek: LeaderboardPlayer[] = [];
    classicMonth: LeaderboardPlayer[] = [];
    classicAllTime: LeaderboardPlayer[] = [];

    soloToday: LeaderboardPlayer[] = [];
    soloWeek: LeaderboardPlayer[] = [];
    soloMonth: LeaderboardPlayer[] = [];
    soloAllTime: LeaderboardPlayer[] = [];
    leaderboardSubscription: Subscription;
    isWaiting: boolean;
    constructor(public userService: UserService, private leaderboardService: LeaderboardService, private firebaseAPI: FirebaseApiService) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
        this.isWaiting = true;
    }

    ngOnInit(): void {
        this.classicToday = [];
        this.classicWeek = [];
        this.classicMonth = [];
        this.classicAllTime = [];
        this.soloToday = [];
        this.soloWeek = [];
        this.soloMonth = [];
        this.soloAllTime = [];
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.leaderboardSubscription = this.leaderboardService.leaderBoardSubject.subscribe((leaderboard) => {
            if (leaderboard !== undefined && leaderboard.classicDay !== undefined) {
                for (let i = 0; i < 10; i++) {
                    if (i < leaderboard.classicDay.length - 1) {
                        this.classicToday.push({
                            name: leaderboard.classicDay[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.classicDay[i].player) as string,
                            ),
                            point: leaderboard.classicDay[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.classicWeek.length - 1) {
                        this.classicWeek.push({
                            name: leaderboard.classicWeek[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.classicWeek[i].player) as string,
                            ),
                            point: leaderboard.classicWeek[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.classicMonth.length - 1) {;
                        this.classicMonth.push({
                            name: leaderboard.classicMonth[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.classicMonth[i].player) as string,
                            ),
                            point: leaderboard.classicMonth[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.classicAll.length - 1) {
                        this.classicAllTime.push({
                            name: leaderboard.classicAll[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.classicAll[i].player) as string,
                            ),
                            point: leaderboard.classicAll[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.soloDay.length - 1) {
                        this.soloToday.push({
                            name: leaderboard.soloDay[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.soloDay[i].player) as string,
                            ),
                            point: leaderboard.soloDay[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.soloWeek.length - 1) {
                        this.soloWeek.push({
                            name: leaderboard.soloWeek[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.soloWeek[i].player) as string,
                            ),
                            point: leaderboard.soloWeek[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.soloMonth.length - 1) {
                        this.soloMonth.push({
                            name: leaderboard.soloMonth[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.soloMonth[i].player) as string,
                            ),
                            point: leaderboard.soloMonth[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                    if (i < leaderboard.soloAll.length - 1) {
                        this.soloAllTime.push({
                            name: leaderboard.soloAll[i].player,
                            avatar: this.avatarDictionary.avatarMap.get(
                                this.firebaseAPI.userAvatars.getValue().get(leaderboard.soloAll[i].player) as string,
                            ),
                            point: leaderboard.soloAll[i].score,
                            position: i + 1,
                        } as LeaderboardPlayer);
                    }
                }
                this.isWaiting = false;
            }
            this.evaluatedRank();
        });
    }

    tabChanged1(tabChangeEvent: MatTabChangeEvent): void {
        this.tabArray[0] = tabChangeEvent.index;
        if (this.tabArray[0] === 0) {
            this.evaluatedRank();
        } else {
            this.evaluatedRankSolo();
        }
    }

    tabChanged2(tabChangeEvent: MatTabChangeEvent): void {
        this.tabArray[1] = tabChangeEvent.index;
        if (this.tabArray[0] === 0) {
            this.evaluatedRank();
        } else {
            this.evaluatedRankSolo();
        }
    }

    evaluatedRank(): void {
        switch (this.tabArray[1]) {
            case 0:
                const index = this.classicToday.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.classicToday[index].position;
                    this.score = this.classicToday[index].point;
                }
                break;
            case 1:
                const index2 = this.classicWeek.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index2 === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.classicWeek[index2].position;
                    this.score = this.classicWeek[index2].point;
                }
                break;
            case 2:
                const index3 = this.classicMonth.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index3 === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.classicMonth[index3].position;
                    this.score = this.classicMonth[index3].point;
                }
                break;
            case 3:
                const index4 = this.classicAllTime.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index4 === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.classicAllTime[index4].position;
                    this.score = this.classicAllTime[index4].point;
                }
                break;
        }
    }

    evaluatedRankSolo(): void {
         switch (this.tabArray[1]) {
            case 0:
                const index = this.soloToday.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.soloToday[index].position;
                    this.score = this.soloToday[index].point;
                }
                break;
            case 1:
                const index2 = this.soloWeek.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index2 === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.soloWeek[index2].position;
                    this.score = this.soloWeek[index2].point;
                }
                break;
            case 2:
                const index3 = this.soloMonth.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index3 === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.soloMonth[index3].position;
                    this.score = this.soloMonth[index3].point;
                }
                break;
            case 3:
                const index4 = this.soloAllTime.findIndex((leaderboardPlayer: LeaderboardPlayer) => {
                    if (leaderboardPlayer.name === localStorage.getItem('username')) {
                        return true;
                    }
                    return false;
                });
                if (index4 === -1) {
                    this.rank = 0;
                    this.score = 0;
                } else {
                    this.rank = this.soloAllTime[index4].position;
                    this.score = this.soloAllTime[index4].point;
                }
                break;
        }
    }

    ngOnDestroy(): void {
        this.leaderboardSubscription.unsubscribe();
    }
}
