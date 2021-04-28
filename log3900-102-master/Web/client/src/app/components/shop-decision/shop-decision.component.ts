import { Component, OnInit } from '@angular/core';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { UserService } from 'src/app/services/server/user.service';
import { ShopService } from 'src/app/services/shop/shop.service';

@Component({
    selector: 'app-shop-decision',
    templateUrl: './shop-decision.component.html',
    styleUrls: ['./shop-decision.component.scss'],
})
export class ShopDecisionComponent implements OnInit {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    constructor(private userService: UserService, private shopService: ShopService) {
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
    }

    onDone(): void {
        this.shopService.isBuyingSubject.next(true);
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
