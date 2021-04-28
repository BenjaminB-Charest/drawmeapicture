import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { AvatarDictionary } from '../../classes/avatar-dictionary';
import { LEVEL_LIMIT } from '../../classes/constants';
import { Profile } from '../../classes/profile';
import { ChatService } from '../chat/chat.service';
import { FirebaseApiService } from './firebase-api.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    currentUserSubject: BehaviorSubject<Profile>;
    selectedBadge: number = 0;
    currentUser: Profile;
    private avatarDictionary: AvatarDictionary;
    canPlaySoloGame: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    musicToggled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    constructor(private firebaseAPI: FirebaseApiService, private db: AngularFirestore, private chatService: ChatService) {
        this.currentUserSubject = new BehaviorSubject<Profile>({} as Profile);
        this.currentUser = {} as Profile;
        this.avatarDictionary = new AvatarDictionary();
    }

    getProfile(): void {
        this.firebaseAPI.getUserProfile().then(profile => {
            this.currentUser.username = localStorage.getItem('username') as string;
            this.currentUser.firstName = profile.firstName;
            this.currentUser.lastName = profile.lastName;
            this.currentUser.experience = profile.experience > 0 ? profile.experience % LEVEL_LIMIT : 0;
            this.currentUser.avatar = profile.avatar;
            this.currentUser.selectedBadges = profile.selectedBadges;
            this.currentUser.level = profile.experience > 0 ? Math.floor(profile.experience / LEVEL_LIMIT) + 1 : 1;
            this.currentUser.name = profile.firstName + ' ' + profile.lastName;
            this.currentUser.avatarLink = this.avatarDictionary.avatarMap.get(profile.avatar) as string;
            if (profile.experience >= 20) {
                this.canPlaySoloGame.next(false);
            }
            this.currentUser.toggleMusic = profile.toggleMusic;
            this.musicToggled.next(profile.toggleMusic);
            this.chatService.$virtualPlayerVoiceActive.next(profile.toggleVP);
            this.currentUser.money = profile.money;
            this.currentUser.unlockedAvatars = profile.unlockedAvatars;
            this.currentUser.unlockedBadges = profile.unlockedBadges;
            this.currentUserSubject.next(this.currentUser);
        });
    }

    changeSelectedBadge(index: number, badgeName: string): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .get()
            .toPromise()
            .then(profileData => {
                const profile = profileData.data() as Profile;
                const selectedBadgesChange = profile.selectedBadges;
                selectedBadgesChange[index] = badgeName;
                this.db
                    .collection('userProfile')
                    .doc(localStorage.getItem('username') as string)
                    .update({
                        selectedBadges: selectedBadgesChange,
                    });
            });
    }

    setAvatar(avatar: string): void {
        this.firebaseAPI.setAvatar(avatar);
        this.currentUser.avatar = avatar;
        this.currentUser.avatarLink = this.avatarDictionary.avatarMap.get(avatar) as string;
        this.currentUserSubject.next(this.currentUser);
    }

    setBadgeList(badgeList: string[]): void {
        this.firebaseAPI.setBadgeList(badgeList);
    }

    avatarBought(): void {
        this.db
            .collection('userProfile')
            .doc(localStorage.getItem('username') as string)
            .update({
                unlockedAvatars: this.currentUserSubject.getValue().unlockedAvatars,
                money: this.currentUserSubject.getValue().money,
            });
    }
    signOut(): void {
        this.canPlaySoloGame.next(true);
        this.firebaseAPI.signOut();
    }
}
