import { Component, ElementRef, ViewChild } from '@angular/core';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { AvatarType } from 'src/app/enums/avatar-type.enum';
import { CurrentUserService } from 'src/app/services/current-user/current-user.service';
import { UserService } from 'src/app/services/server/user.service';

@Component({
    selector: 'app-avatar-selection',
    templateUrl: './avatar-selection.component.html',
    styleUrls: ['./avatar-selection.component.scss'],
})
export class AvatarSelectionComponent {
    avatarURL: string;
    private avatarDictionary: AvatarDictionary;
    private currentAvatarKey: string;
    woman: boolean = false;
    man: boolean = false;
    cat: boolean = false;
    dog: boolean = false;
    fox: boolean = false;
    panda: boolean= false;
    flamingo: boolean= false;
    yak: boolean= false;
    koala: boolean= false;
    bee: boolean= false;
    giraffe: boolean= false;
    polarBear: boolean= false;
    rhino: boolean= false;
    monkey: boolean= false;
    rabbit: boolean= false;
    lion: boolean= false;
    raccoon: boolean= false;
    octopus: boolean= false;
    leopard: boolean= false;
    elephant: boolean= false;

    @ViewChild('previewAvatar', { static: false }) previewAvatar: ElementRef<HTMLImageElement>;
    constructor(private userService: UserService, private currentUserService: CurrentUserService) {
        this.avatarDictionary = new AvatarDictionary();
        this.avatarURL = this.currentUserService.currentAvatar === undefined ? '' : this.currentUserService.currentAvatar;
        for (const avatar of userService.currentUserSubject.getValue().unlockedAvatars) {
            this.enableIcon(avatar);
        }

    }

    changePreviewAvatar(avatarKey: string): void {
        this.currentAvatarKey = avatarKey;
        this.previewAvatar.nativeElement.src = this.avatarDictionary.avatarMap.get(avatarKey) as string;
    }

    onOK(): void {
        this.userService.setAvatar(this.currentAvatarKey);
    }

    // tslint:disable-next-line: cyclomatic-complexity
    enableIcon(avatar: string): void {
        switch (avatar) {
            case AvatarType.Woman:
                this.woman = true;
                break;
            case AvatarType.Man:
                this.man = true;
                break;
            case AvatarType.Cat:
                this.cat = true;
                break;
            case AvatarType.Dog:
                this.dog = true;
                break;
            case AvatarType.Fox:
                this.fox = true;
                break;
            case AvatarType.PandaBear:
                this.panda = true;
                break;
            case AvatarType.Flamingo:
                this.flamingo = true;
                break;
            case AvatarType.Yak:
                this.yak = true;
                break;
            case AvatarType.Koala:
                this.koala = true;
                break;
            case AvatarType.Bee:
                this.bee = true;
                break;
            case AvatarType.Giraffe:
                this.giraffe = true;
                break;
            case AvatarType.PolarBear:
                this.polarBear = true;
                break;
            case AvatarType.Rhino:
                this.rhino = true;
                break;
            case AvatarType.Monkey:
                this.monkey = true;
                break;
            case AvatarType.Rabbit:
                this.rabbit = true;
                break;
            case AvatarType.Lion:
                this.lion = true;
                break;
            case AvatarType.Raccoon:
                this.raccoon = true;
                break;
            case AvatarType.Octopus:
                this.octopus = true;
                break;
            case AvatarType.Leopard:
                this.leopard = true;
                break;
            case AvatarType.Elephant:
                this.elephant = true;
                break;
        }
    }
}
