import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { BadgeLinkDictionary } from 'src/app/classes/badge-link-dictionary';
import { EndGamePlayer } from 'src/app/classes/end-game-player';
import { Game } from 'src/app/interfaces/game';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
// import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-end-game-dialog',
    templateUrl: './end-game-dialog.component.html',
    styleUrls: ['./end-game-dialog.component.scss'],
})
export class EndGameDialogComponent {
    avatar: string;
    badgeNameDictionary: BadgeLinkDictionary = new BadgeLinkDictionary();
    badgeDictionary: BadgeDictionary = new BadgeDictionary();
    avatarDictionary: AvatarDictionary = new AvatarDictionary();
    score: number;
    myTeamScore = 0;
    enemyTeamScore = 0;
    players: EndGamePlayer[];
    won: string;

    sortedArray: EndGamePlayer[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: Game, private firebaseAPI: FirebaseApiService) {
        const teamA = [];
        const teamB = [];
        this.players = [];
        const game = data;
        let teamAScore = 0;
        this.sortedArray = [];
        let teamBScore = 0;
        if (game !== undefined) {
            for (const [key, val] of game.players.entries()) { // Build teams
                if (val % 2 === 0) {
                    teamA.push(key);
                } else {
                    teamB.push(key);
                }
            }
            for (const [player, score] of game.scores.entries()) {
                if (teamA.includes(player)) {
                    teamAScore += score;
                    this.createPlayer('A', player, score);
                } else {
                    teamBScore += score;
                    this.createPlayer('B', player, score);
                }
            }
            this.players.sort((a: EndGamePlayer, b: EndGamePlayer) => {
                if (a.score > b.score) {
                    return -1;
                } else if (a.score < b.score) {
                    return 1;
                } else {
                    return 0;
                }
            });
            this.sortedArray = this.players;
            for (let i = 0; i < 4; i++) {
                this.sortedArray[i].position = i + 1;
            }
            if (teamA.includes(localStorage.getItem('username') as string)) {
                this.myTeamScore = teamAScore;
                this.enemyTeamScore = teamBScore;
            } else {
                this.myTeamScore = teamBScore;
                this.enemyTeamScore = teamAScore;
            }
            if (this.myTeamScore > this.enemyTeamScore) {
                this.won = 'Your team won ';
            } else if (this.myTeamScore < this.enemyTeamScore) {
                this.won = 'Your team lost ';
            } else {
                this.won = 'The game was a tie ';
            }
        }
    }

    createPlayer(team: string, player: string, score: number): void {
        let newPlayer = {} as EndGamePlayer;
        const isVP = player.includes('[Robot]');
        switch (team) {
            case 'A':
                newPlayer = new EndGamePlayer(player,
                [this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![0] as string) as string,
                    this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![1] as string) as string,
                    this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![2] as string) as string],
                    this.avatarDictionary.avatarMap.get(this.firebaseAPI.userAvatars.getValue().get(player) as string) as string,
                    isVP, score, 'A', 1);
                break;
            case 'B':
                newPlayer = new EndGamePlayer(player,
                [this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![0] as string) as string,
                    this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![1] as string) as string,
                    this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![2] as string) as string],
                    this.avatarDictionary.avatarMap.get(this.firebaseAPI.userAvatars.getValue().get(player) as string) as string,
                    isVP, score, 'B', 1);
                break;
        }
        this.players.push(newPlayer);
    }

    determinePlacesURL(position: number): string {
        switch (position) {
            case 1:
                return 'assets/podium/first.svg';
            case 2:
                return 'assets/podium/second.svg';
            case 3:
                return 'assets/podium/third.svg';
            case 4:
                return 'assets/podium/four.svg';
            default:
                return '';
        }
    }
}
