import { Component, OnInit } from '@angular/core';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { BadgeDescriptionDictionary } from 'src/app/classes/badge-description-dictionary';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { BadgeNameDictionary } from 'src/app/classes/badge-name-dictionary';
import { BadgeService } from 'src/app/services/server/badge.service';
import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-badge-earned',
    templateUrl: './badge-earned.component.html',
    styleUrls: ['./badge-earned.component.scss'],
})
export class BadgeEarnedComponent implements OnInit {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    badgeDictionary: BadgeDictionary;
    badgeDescriptionDictionary: BadgeDescriptionDictionary;
    badgeNameDictionary: BadgeNameDictionary;
    badgeURL: string;
    badgeDescription: string;
    badgeName: string;

    constructor(private userService: UserService, private badgeService: BadgeService) {
        this.badgeDictionary = new BadgeDictionary();
        this.badgeDescriptionDictionary = new BadgeDescriptionDictionary();
        this.badgeNameDictionary = new BadgeNameDictionary();
        this.avatarDictionary = new AvatarDictionary();
        const badgeName = this.badgeService.newBadgeName.pop() as string;
        this.badgeURL = this.badgeDictionary.badgeMap.get(badgeName as string) as string;
        this.badgeDescription =
            this.badgeDescriptionDictionary.badgeDescriptionMap.get(badgeName) as string;
        this.badgeName = this.badgeNameDictionary.badgeNameMap.get(badgeName) as string;
        this.userService.getProfile();
        this.badgeService.newBadge.next(false);
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
