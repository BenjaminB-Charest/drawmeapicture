import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { Shop } from 'src/app/classes/shop';
import { ShopAvatar } from 'src/app/interfaces/shop-avatar';
import { ShopEmoji } from 'src/app/interfaces/shop-emoji';
import { UserService } from 'src/app/services/server/user.service';
import { ShopService } from 'src/app/services/shop/shop.service';
import { ShopDecisionComponent } from '../shop-decision/shop-decision.component';

@Component({
    selector: 'app-shop',
    templateUrl: './shop.component.html',
    styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit, OnDestroy {
    avatar: string;
    tokens: number;
    shop: Shop;
    item: ShopAvatar;
    avatarDictionary: AvatarDictionary;
    isBuyingSubscription: Subscription;
    userSubscription: Subscription;

    shownAvatars: ShopAvatar[];

    constructor(private userService: UserService, private snackBar: MatSnackBar, private dialog: MatDialog, private shopService: ShopService) {
        this.shop = new Shop();
        this.userService.getProfile();
        this.avatarDictionary = new AvatarDictionary();
        this.shownAvatars = [];
        this.userSubscription = this.userService.currentUserSubject.subscribe(profile => {
            this.tokens = profile.money;
        });
    }

    private determineShownItems(): void {
        // REMOVE ITEMS THAT THE USER ALREADY HAVE
        for (const value of this.shop.avatarMap.values()) {
            if (!this.userService.currentUserSubject.getValue().unlockedAvatars.includes(value.avatar)) {
                this.shownAvatars.push(value);
            }
        }
    }

    openAreYouSureDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '243px', left: '451px' };
        this.dialog.open(ShopDecisionComponent, dialogConfig);
    }

    onBuy(item: ShopAvatar | ShopEmoji): void {
        if (this.userService.currentUserSubject.getValue().money > item.price) {
            this.item = item;
            this.openAreYouSureDialog();
        } else {
            this.snackBar.open('Play more solo or classic games to earn more tokens.', 'Not enough tokens', {
                duration: 2000,
                verticalPosition: 'bottom',
                horizontalPosition: 'left',
            });
        }
    }

    private deleteItem(item: ShopAvatar | ShopEmoji): void {
        const index = this.shownAvatars.indexOf(item, 0);
        if (index !== undefined && index > -1) {
            this.shownAvatars.splice(index, 1);
            return;
        }
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
        this.determineShownItems();
        this.isBuyingSubscription = this.shopService.isBuyingSubject.subscribe(isBuying => {
            if (isBuying) {
                this.deleteItem(this.item);
                this.snackBar.open('Item Bought', 'Item added to you inventory', {
                    duration: 2000,
                    verticalPosition: 'bottom',
                    horizontalPosition: 'left',
                });
                this.userService.currentUserSubject.getValue().money -= this.item.price;
                this.userService.currentUserSubject.getValue().unlockedAvatars.push(this.item.avatar);
                this.userService.currentUserSubject.next(this.userService.currentUserSubject.getValue());
                this.userService.avatarBought();
                this.shopService.isBuyingSubject.next(false);
            }
        });
    }

    ngOnDestroy(): void {
        this.isBuyingSubscription.unsubscribe();
        this.userSubscription.unsubscribe();
    }
}
