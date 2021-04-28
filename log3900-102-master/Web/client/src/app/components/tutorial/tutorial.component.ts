import { Component, OnInit } from '@angular/core';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.component.html',
    styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit {
    avatar: string;
    avatarDictionary: AvatarDictionary;
    constructor(private userService: UserService) {
        this.avatarDictionary = new AvatarDictionary();
        this.userService.getProfile();
    }

    ngOnInit(): void {
        this.avatar = this.avatarDictionary.avatarMap.get(this.userService.currentUser.avatar) as string;
    }
}
