import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { BadgeDictionary } from 'src/app/classes/badge-dictionary';
import { LoginHistory } from 'src/app/interfaces/login-history';
import { ProfilGame } from 'src/app/interfaces/profil-game';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { CurrentUserService } from 'src/app/services/current-user/current-user.service';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { HistoryService } from 'src/app/services/server/history.service';
import { StatisticsService } from 'src/app/services/server/statistics.service';
import { UserService } from 'src/app/services/server/user.service';
import { AvatarSelectionComponent } from '../avatar-selection/avatar-selection.component';
import { BadgeSelectionComponent } from '../badge-selection/badge-selection.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    styles: ['::ng-deep .cdk-overlay-backdrop{right:304px;'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
    isDetached: boolean;
    toggleMusic: boolean;
    toggleVP: boolean;
    isDetachedSubscription: Subscription;
    games: ProfilGame[];
    logins: LoginHistory[];
    tokens: number;
    totalTimeSolo: number;
    totalTimeSoloSubscription: Subscription;
    totalTimeClassic: number;
    totalTimeClassicSubscription: Subscription;
    avatarDictionary: AvatarDictionary;
    placement: string;
    musicToggle: Subscription;
    vpVoiceToggle: Subscription;
    userSubscription: Subscription;
    avatarSubscription: Subscription;
    badges: string[] = [];
    badgeDictionary: BadgeDictionary = new BadgeDictionary();

    constructor(
        public userService: UserService,
        private dialog: MatDialog,
        private channelPanelService: ChannelPanelService,
        private musicPlayer: MusicPlayerService,
        private router: Router,
        public statisticsService: StatisticsService,
        public currentUserService: CurrentUserService,
        private chatService: ChatService,
        private historyService: HistoryService,
        private firebaseAPI: FirebaseApiService,
    ) {
        this.avatarDictionary = new AvatarDictionary();
        this.isDetached = false;
        this.historyService.firebaseAPI.getAllAvatars();
        this.avatarSubscription = this.firebaseAPI.avatarsFetched.subscribe(val => {
            if (val) {
                this.historyService.getGames().then(games => {
                    this.games = games;
                    this.firebaseAPI.avatarsFetched.next(false);
                });
            }
        });
        this.historyService.getLoginHistory().then(loginHistory => {
            this.logins = loginHistory;
        });
        this.userService.getProfile();
        this.statisticsService.getTotalGames();
        this.totalTimeSoloSubscription = this.statisticsService.totalGameTimeSolo.subscribe((totalTime) => {
            this.totalTimeSolo = Math.floor(totalTime);
        });
        this.totalTimeClassicSubscription = this.statisticsService.totalGamesSolo.subscribe((totalTime) => {
            this.totalTimeClassic = Math.floor(totalTime);
        });
        this.musicToggle = this.userService.musicToggled.subscribe(val => {
            this.toggleMusic = val;
        });
        this.vpVoiceToggle = this.chatService.$virtualPlayerVoiceActive.subscribe(val => {
            this.toggleVP = val;
        });
        window.addEventListener('beforeunload', () => {
            this.firebaseAPI.updateLogoutTime();
        });
    }

    determinePlacement(place: number): string {
        switch (place) {
            case 1:
                return 'assets/podium/first.svg';
                break;
            case 2:
                return 'assets/podium/second.svg';
                break;
            case 3:
                return 'assets/podium/third.svg';
                break;
            case 4:
                return 'assets/podium/four.svg';
                break;
            case -1:
                return 'assets/podium/trophy.svg';
                break;
            default:
                return '';
        }
    }

    startMusic(): void {
        this.musicPlayer.playMusic('assets/sounds/epic_music.mp3');
    }

    openAvatarSelectionDialog(): void {
        this.currentUserService.currentAvatar = this.userService.currentUser.avatarLink;
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '39px', left: '414px' };
        this.dialog.open(AvatarSelectionComponent, dialogConfig);
    }

    openBadgeSelectionDialog(value: string): void {
        this.determineWhichBadge(value);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.position = { top: '39px', left: '414px' };
        this.dialog.open(BadgeSelectionComponent, dialogConfig);
    }

    changeMusic(): void {
        this.toggleMusic = !this.toggleMusic;
        this.musicPlayer.toggleMusic(this.toggleMusic);
    }

    changeVPVoice(): void {
        this.toggleVP = !this.toggleVP;
        this.chatService.$virtualPlayerVoiceActive.next(this.toggleVP);
        this.chatService.toggleVirtualPlayerVoice();
    }

    private determineWhichBadge(value: string): void {
        switch (value) {
            case 'one':
                this.userService.selectedBadge = 0;
                break;
            case 'two':
                this.userService.selectedBadge = 1;
                break;
            case 'three':
                this.userService.selectedBadge = 2;
                break;
        }
    }

    returnMainMenu(): void {
        this.musicPlayer.stopMusic();
        this.router.navigateByUrl('/home');
    }

    ngOnInit(): void {
        this.isDetachedSubscription = this.channelPanelService.isDetachedSubject.subscribe(isDetached => {
            this.isDetached = isDetached;
        });
        this.userSubscription = this.userService.currentUserSubject.subscribe(profile => {
            this.badges = [];
            if (profile !== undefined && profile.selectedBadges !== undefined) {
                this.tokens = profile.money;
                for (let i = 0; i < 3; i++) {
                    if (this.userService.currentUserSubject.getValue().selectedBadges[i] === 'noBadge') {
                        this.badges.push('assets/badge/noBadge.svg');
                    } else {
                        this.badges.push(
                            this.badgeDictionary.badgeMap.get(this.userService.currentUserSubject.getValue().selectedBadges[i]) as string,
                        );
                    }
                }
            }
        });

        this.startMusic();
    }

    ngOnDestroy(): void {
        this.isDetachedSubscription.unsubscribe();
        this.musicToggle.unsubscribe();
        this.userSubscription.unsubscribe();
        this.avatarSubscription.unsubscribe();
        this.vpVoiceToggle.unsubscribe();
        this.totalTimeClassicSubscription.unsubscribe();
        this.totalTimeSoloSubscription.unsubscribe();
    }
}
