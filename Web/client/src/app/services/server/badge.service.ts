import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { StatisticsService } from './statistics.service';
import { UserService } from './user.service';
// tslint:disable
@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  newBadge: BehaviorSubject<boolean>;
  newBadgeName: string[];

  constructor(private db: AngularFirestore,
              private userService: UserService,
              private statisticService: StatisticsService) {
    this.newBadge = new BehaviorSubject<boolean>(false);
    this.newBadgeName = [];
  }

  badgeUpdate(): void {
    this.statisticService.getTotalGames(true).then(() => {
      this.totalGameBadge();
      this.gameWonBadge();
      this.totalTimeBadge();
      this.totalMoneyBadge();
      this.totalImageCreated();
    });
  }

  totalGameBadge(): void {
    const total = this.statisticService.totalGames.getValue();
    if (total > 50) {
      this.addBadge('badge7');
    }
    if (total > 20) {
      this.addBadge('badge3');
    }
    if (total > 10) {
      this.addBadge('badge8');
    }
    if (total > 5) {
      this.addBadge('badge2');
    }
    if (total > 1) {
      this.addBadge('badge1');
    }
  }

  gameWonBadge(): void {
    const wins = this.statisticService.gamesWon.getValue();
    if (wins > 40) {
      this.addBadge('badge0');
    }
    if (wins > 20) {
      this.addBadge('badge4');
    }
    if (wins > 10) {
      this.addBadge('badge5');
    }
    if (wins > 3) {
      this.addBadge('badge6');
    }
  }

  totalTimeBadge(): void  {
    const totalTime = this.statisticService.totalGameTime.getValue() + this.statisticService.totalGameTimeSolo.getValue();
    if (totalTime > 180) {
      this.addBadge('badge12');
    }
    if (totalTime > 60) {
      this.addBadge('badge10');
    }
    if (totalTime > 30) {
      this.addBadge('badge9');
    }
    if (totalTime > 10) {
      this.addBadge('badge11');
    }
  }

  totalMoneyBadge(): void{
    const money = this.userService.currentUserSubject.getValue().money;
    if (money > 750) {
        this.addBadge('badge16');
    }
    if (money > 500) {
        this.addBadge('badge14');
    }
    if (money > 250) {
        this.addBadge('badge13');
    }
    if (money > 100) {
        this.addBadge('badge15');
    }
  }

  totalImageCreated(): void{
    const totalImages = this.statisticService.imagesCreated.getValue();
    if (totalImages > 10) {
      this.addBadge('badge17');
    }
    if (totalImages > 5) {
      this.addBadge('badge18');
    }
    if (totalImages > 1) {
      this.addBadge('badge19');
    }
  }

  addBadge(badgeName: string): void {
    if (this.userService.currentUserSubject.getValue().unlockedBadges === undefined) {
      this.userService.currentUserSubject.getValue().unlockedBadges = [];
    }
    if (!this.userService.currentUserSubject.getValue().unlockedBadges.includes(badgeName)) {
      this.userService.currentUserSubject.getValue().unlockedBadges.push(badgeName);
      this.db.collection('userProfile').doc(localStorage.getItem('username') as string).update({
        unlockedBadges: this.userService.currentUserSubject.getValue().unlockedBadges
      });
      this.newBadgeName.push(badgeName);
      this.newBadge.next(true);
    }
  }
}
