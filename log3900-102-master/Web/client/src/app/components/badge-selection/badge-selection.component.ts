import { Component } from '@angular/core';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { BadgeDictionaryReverse } from 'src/app/classes/badge-dictionary-reverse';
import { BadgeNameDictionary } from 'src/app/classes/badge-name-dictionary';
import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-badge-selection',
    templateUrl: './badge-selection.component.html',
    styleUrls: ['./badge-selection.component.scss'],
})
export class BadgeSelectionComponent {
    badgeURL: string;
    badgeNameArray: string[] = [];
    badgeNameDictionary: BadgeNameDictionary = new BadgeNameDictionary();
    badgeDictionary: BadgeDictionary = new BadgeDictionary();
    badgeReverse: BadgeDictionaryReverse = new BadgeDictionaryReverse();
    oldBadge: string;
    badge0 = true;
    badge0Selected = false;
    badge1 = true;
    badge1Selected = false;
    badge2 = true;
    badge2Selected = false;
    badge3 = true;
    badge3Selected = false;
    badge4 = true;
    badge4Selected = false;
    badge5 = true;
    badge5Selected = false;
    badge6 = true;
    badge6Selected = false;
    badge7 = true;
    badge7Selected = false;
    badge8 = true;
    badge8Selected = false;
    badge9 = true;
    badge9Selected = false;
    badge10 = true;
    badge10Selected = false;
    badge11 = true;
    badge11Selected = false;
    badge12 = true;
    badge12Selected = false;
    badge13 = true;
    badge13Selected = false;
    badge14 = true;
    badge14Selected = false;
    badge15 = true;
    badge15Selected = false;
    badge16 = true;
    badge16Selected = false;
    badge17 = true;
    badge17Selected = false;
    badge18 = true;
    badge18Selected = false;
    badge19 = true;
    badge19Selected = false;

    constructor(private userService: UserService) {
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge0') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge1') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge2') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge3') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge4') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge5') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge6') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge7') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge8') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge9') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge10') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge11') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge12') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge13') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge14') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge15') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge16') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge17') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge18') as string);
        this.badgeNameArray.push(this.badgeNameDictionary.badgeNameMap.get('badge19') as string);

        switch (this.userService.selectedBadge) {
            case 0:
                const badge = this.userService.currentUserSubject.getValue().selectedBadges[0];
                if (badge === 'noBadge') {
                    this.oldBadge = this.userService.currentUserSubject.getValue().selectedBadges[0];
                    this.badgeURL = 'assets/badge/noBadge.svg';
                } else {
                    this.oldBadge = this.userService.currentUserSubject.getValue().selectedBadges[0];
                    this.badgeURL =
                        this.badgeDictionary.badgeMap.get(this.userService.currentUserSubject.getValue().selectedBadges[0]) as string;
                }
                break;
            case 1:
                const badge1 = this.userService.currentUserSubject.getValue().selectedBadges[1];
                if (badge1 === 'noBadge') {
                    this.oldBadge = this.userService.currentUserSubject.getValue().selectedBadges[1];
                    this.badgeURL = 'assets/badge/noBadge.svg';
                } else {
                    this.oldBadge = this.userService.currentUserSubject.getValue().selectedBadges[1];
                    this.badgeURL =
                        this.badgeDictionary.badgeMap.get(this.userService.currentUserSubject.getValue().selectedBadges[1]) as string;
                }
                break;
            case 2:
                const badge2 = this.userService.currentUserSubject.getValue().selectedBadges[2];
                if (badge2 === 'noBadge') {
                    this.oldBadge = this.userService.currentUserSubject.getValue().selectedBadges[2];
                    this.badgeURL = 'assets/badge/noBadge.svg';
                } else {
                    this.oldBadge = this.userService.currentUserSubject.getValue().selectedBadges[2];
                    this.badgeURL =
                        this.badgeDictionary.badgeMap.get(this.userService.currentUserSubject.getValue().selectedBadges[2]) as string;
                }
                break;
        }
        for (const unlockedBadge of this.userService.currentUserSubject.getValue().unlockedBadges) {
            this.enableBadge(unlockedBadge);
        }
        for (const selectedBadge of this.userService.currentUserSubject.getValue().selectedBadges) {
            this.selectedBadge(selectedBadge, true);
        }
    }

    // tslint:disable-next-line: cyclomatic-complexity
    loadPreviewBadge(value: string): void {
        this.selectedBadge(this.badgeReverse.badgeMapReverse.get(this.badgeURL) as string, false);
        switch (value) {
            case 'one':
                this.badgeURL = 'assets/newbadges/002-trophy.svg';
                break;
            case 'two':
                this.badgeURL = 'assets/newbadges/004-first.svg';
                break;
            case 'three':
                this.badgeURL = 'assets/newbadges/007-medal.svg';
                break;
            case 'four':
                this.badgeURL = 'assets/newbadges/008-coat-of-arms.svg';
                break;
            case 'five':
                this.badgeURL = 'assets/newbadges/011-award.svg';
                break;
            case 'six':
                this.badgeURL = 'assets/newbadges/015-gold-medal.svg';
                break;
            case 'seven':
                this.badgeURL = 'assets/newbadges/016-silver-medal-1.svg';
                break;
            case 'eight':
                this.badgeURL = 'assets/newbadges/018-standard-1.svg';
                break;
            case 'nine':
                this.badgeURL = 'assets/newbadges/024-shield.svg';
                break;
            case 'ten':
                this.badgeURL = 'assets/newbadges/035-badge-3.svg';
                break;
            case 'eleven':
                this.badgeURL = 'assets/newbadges/036-star-1.svg';
                break;
            case 'twelve':
                this.badgeURL = 'assets/newbadges/038-star-3.svg';
                break;
            case 'thirteen':
                this.badgeURL = 'assets/newbadges/040-diploma-1.svg';
                break;
            case 'fourteen':
                this.badgeURL = 'assets/newbadges/004-certificate.svg';
                break;
            case 'fifteen':
                this.badgeURL = 'assets/newbadges/010-badge.svg';
                break;
            case 'sixteen':
                this.badgeURL = 'assets/newbadges/034-money.svg';
                break;
            case 'seventeen':
                this.badgeURL = 'assets/newbadges/040-money-bag.svg';
                break;
            case 'eighteen':
                this.badgeURL = 'assets/newbadges/006-trophy.svg';
                break;
            case 'nineteen':
                this.badgeURL = 'assets/newbadges/019-trophy-1.svg';
                break;
            case 'twenty':
                this.badgeURL = 'assets/newbadges/033-flag.svg';
                break;
        }
        this.selectedBadge(this.badgeReverse.badgeMapReverse.get(this.badgeURL) as string, true);
        this.userService.currentUserSubject.getValue().selectedBadges[this.userService.selectedBadge] =
            this.badgeReverse.badgeMapReverse.get(
            this.badgeURL,
        ) as string;
        this.userService.changeSelectedBadge(this.userService.selectedBadge,
            this.badgeReverse.badgeMapReverse.get(this.badgeURL) as string);
    }
    // tslint:disable-next-line: cyclomatic-complexity
    enableBadge(value: string): void {
        switch (value) {
            case 'badge0':
                this.badge0 = false;
                break;
            case 'badge1':
                this.badge1 = false;
                break;
            case 'badge2':
                this.badge2 = false;
                break;
            case 'badge3':
                this.badge3 = false;
                break;
            case 'badge4':
                this.badge4 = false;
                break;
            case 'badge5':
                this.badge5 = false;
                break;
            case 'badge6':
                this.badge6 = false;
                break;
            case 'badge7':
                this.badge7 = false;
                break;
            case 'badge8':
                this.badge8 = false;
                break;
            case 'badge9':
                this.badge9 = false;
                break;
            case 'badge10':
                this.badge10 = false;
                break;
            case 'badge11':
                this.badge11 = false;
                break;
            case 'badge12':
                this.badge12 = false;
                break;
            case 'badge13':
                this.badge13 = false;
                break;
            case 'badge14':
                this.badge14 = false;
                break;
            case 'badge15':
                this.badge15 = false;
                break;
            case 'badge16':
                this.badge16 = false;
                break;
            case 'badge17':
                this.badge17 = false;
                break;
            case 'badge18':
                this.badge18 = false;
                break;
            case 'badge19':
                this.badge19 = false;
                break;
        }
    }

    // tslint:disable-next-line: cyclomatic-complexity
    selectedBadge(value: string, toggle: boolean): void {
        switch (value) {
            case 'badge0':
                this.badge0Selected = toggle;
                break;
            case 'badge1':
                this.badge1Selected = toggle;
                break;
            case 'badge2':
                this.badge2Selected = toggle;
                break;
            case 'badge3':
                this.badge3Selected = toggle;
                break;
            case 'badge4':
                this.badge4Selected = toggle;
                break;
            case 'badge5':
                this.badge5Selected = toggle;
                break;
            case 'badge6':
                this.badge6Selected = toggle;
                break;
            case 'badge7':
                this.badge7Selected = toggle;
                break;
            case 'badge8':
                this.badge8Selected = toggle;
                break;
            case 'badge9':
                this.badge9Selected = toggle;
                break;
            case 'badge10':
                this.badge10Selected = toggle;
                break;
            case 'badge11':
                this.badge11Selected = toggle;
                break;
            case 'badge12':
                this.badge12Selected = toggle;
                break;
            case 'badge13':
                this.badge13Selected = toggle;
                break;
            case 'badge14':
                this.badge14Selected = toggle;
                break;
            case 'badge15':
                this.badge15Selected = toggle;
                break;
            case 'badge16':
                this.badge16Selected = toggle;
                break;
            case 'badge17':
                this.badge17Selected = toggle;
                break;
            case 'badge18':
                this.badge18Selected = toggle;
                break;
            case 'badge19':
                this.badge19Selected = toggle;
                break;
        }
    }
    onOK(): void {
        this.userService.currentUserSubject.next(this.userService.currentUserSubject.getValue());
    }

    onCancel(): void {
        this.userService.changeSelectedBadge(this.userService.selectedBadge,
            this.oldBadge);
        console.log(this.oldBadge);
        this.userService.currentUserSubject.getValue()
            .selectedBadges[this.userService.selectedBadge] = this.oldBadge;
        this.userService.currentUserSubject.next(this.userService.currentUserSubject.getValue());
        this.userService.selectedBadge = 0;
    }
}
