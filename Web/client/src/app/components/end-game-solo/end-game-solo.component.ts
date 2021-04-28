import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { BadgeLinkDictionary } from 'src/app/classes/badge-link-dictionary';
import { EndGamePlayer } from 'src/app/classes/end-game-player';
import { SoloGame } from 'src/app/interfaces/solo-game';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';

@Component({
  selector: 'app-end-game-solo',
  templateUrl: './end-game-solo.component.html',
  styleUrls: ['./end-game-solo.component.scss']
})
export class EndGameSoloComponent {
    avatar: string;
    badgeNameDictionary: BadgeLinkDictionary = new BadgeLinkDictionary();
    badgeDictionary: BadgeDictionary = new BadgeDictionary();
    avatarDictionary: AvatarDictionary = new AvatarDictionary();
    score: number;
    players: EndGamePlayer[];
    won: string;
    wordsGuessed: string;

    sortedArray: EndGamePlayer[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: SoloGame, private firebaseAPI: FirebaseApiService) {
        this.players = [];
        const game = data;
        this.sortedArray = [];
        if (game !== undefined) {
          this.score = game.score;
          if (game.correctAttempts === undefined) {
            this.wordsGuessed = ('0');
          } else {
            this.wordsGuessed = game.correctAttempts.toString();
          }
          this.won = 'Your final score: ';
          this.createPlayer(localStorage.getItem('username') as string, game.score);
          this.sortedArray = this.players;
        }
    }

    createPlayer(player: string, score: number): void {
        let newPlayer = {} as EndGamePlayer;
        newPlayer = new EndGamePlayer(player,
        [this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![0] as string) as string,
        this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![1] as string) as string,
        this.badgeDictionary.badgeMap.get(this.firebaseAPI.userBadges.getValue().get(player)![2] as string) as string],
        this.avatarDictionary.avatarMap.get(this.firebaseAPI.userAvatars.getValue().get(player) as string) as string,
        false, score, 'A', 1);
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
