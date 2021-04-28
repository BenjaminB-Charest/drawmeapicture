import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AvatarDictionary } from 'src/app/classes/avatar-dictionary';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';
import { GameLobbyService } from 'src/app/services/game-lobby/game-lobby.service';
import { IpcService } from 'src/app/services/ipc/ipc.service';
import { MusicPlayerService } from 'src/app/services/music-player.service';
import { BadgeService } from 'src/app/services/server/badge.service';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { LeaderboardService } from 'src/app/services/server/leaderboard.service';
import { UserService } from 'src/app/services/server/user.service';
import { SignupService } from 'src/app/services/signup/signup.service';
import { BadgeEarnedComponent } from '../badge-earned/badge-earned.component';
import { ClassicModeDecisionComponent } from '../classic-mode-decision/classic-mode-decision.component';
import { EndGameDialogComponent } from '../end-game-dialog/end-game-dialog.component';
import { LeaderboardComponent } from '../leaderboard/leaderboard.component';
import { ShopComponent } from '../shop/shop.component';
import { TutorialComponent } from '../tutorial/tutorial.component';
import { WaitingDialogComponent } from '../waiting-dialog/waiting-dialog.component';
import { WordImagePairComponent } from '../word-image-pair/word-image-pair.component';
// tslint:disable: deprecation

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    @ViewChild('createNewBtn', { static: true }) createNewBtn: ElementRef<HTMLAnchorElement>;
    @ViewChild('openGalleryBtn', { static: true }) openGalleryBtn: ElementRef<HTMLAnchorElement>;
    // tslint:disable-next-line: no-inferrable-types | Reason: hadDrawing needs a typedef
    avatarDictionary: AvatarDictionary;
    options: object[];
    profileImageURL: string;
    isDetached: boolean;
    tokens: number;
    isDetachedSubscription: Subscription;
    shouldCloseDialogSubscription: Subscription;
    isOnFirstSignInSubscription: Subscription;
    userSubscription: Subscription;
    badgeSubscription: Subscription;

    readonly messageAccueil: string = 'Draw Me a Picture!';
    readonly messageDescriptif: string = "It's your turn to guess;)";

    constructor(
        public dialog: MatDialog,
        public userService: UserService,
        public router: Router,
        public channelPanelService: ChannelPanelService,
        private musicPlayer: MusicPlayerService,
        private gameLobbyService: GameLobbyService,
        private signupService: SignupService,
        private leaderboardService: LeaderboardService,
        private firebaseAPI: FirebaseApiService,
        private badgeService: BadgeService,
        readonly ipc: IpcService,
    ) {
        this.avatarDictionary = new AvatarDictionary();
        this.profileImageURL = '';
        this.userService.getProfile();
        this.startMusic();
        this.userSubscription = this.userService.currentUserSubject.subscribe(profile => {
            this.tokens = profile.money;
        });

        window.addEventListener('beforeunload', () => {
            if (this.firebaseAPI.activeLobby.getValue().host === (localStorage.getItem('username') as string)) {
                this.firebaseAPI.deleteLobby(this.firebaseAPI.activeLobby.getValue().id);
                this.firebaseAPI.removeChannel(this.firebaseAPI.activeLobby.getValue().shareKey);
            } else {
                this.firebaseAPI.quitLobby(this.firebaseAPI.activeLobby.getValue().id);
                this.firebaseAPI.removeChannel(this.firebaseAPI.activeLobby.getValue().shareKey);
            }
            this.firebaseAPI.updateLogoutTime();
        });
    }

    startMusic(): void {
        this.musicPlayer.playMusic('assets/sounds/action_music.mp3');
    }

    startSoloSprint(): void {
        localStorage.setItem('mode', 'solo');
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '196px', left: '515px' };
        const modal = this.dialog.open(WaitingDialogComponent, dialogConfig);
        modal.afterClosed().subscribe(result => {
            // redirect after match found
        });
    }

    openClassicModeDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '196px', left: '509px' };
        this.dialog.open(ClassicModeDecisionComponent, dialogConfig);
    }

    openWordImagePairDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '179px', left: '290px' };
        this.dialog.open(WordImagePairComponent, dialogConfig);
    }

    openTutorialDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = '638px';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '65px', left: '429px' };
        this.dialog.open(TutorialComponent, dialogConfig);
    }

    openShopDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '636px';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '107px', left: '397px' };
        this.dialog.open(ShopComponent, dialogConfig);
    }

    openLeaderboard(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '65px', left: '403px' };
        this.leaderboardService.getLeaderBoards().then(() => {
            this.dialog.open(LeaderboardComponent, dialogConfig);
        });
    }

    openBadgeDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '600px';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '65px', left: '403px' };
        this.leaderboardService.getLeaderBoards().then(() => {
            this.dialog.open(BadgeEarnedComponent, dialogConfig);
        });
    }

    openEndGameDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = '600px';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        dialogConfig.position = { top: '65px', left: '403px' };
        this.leaderboardService.getLeaderBoards().then(() => {
            this.dialog.open(EndGameDialogComponent, dialogConfig);
        });
    }

    onLogout(): void {
        this.firebaseAPI.accountExists.next(true);
        this.firebaseAPI.accountInfoMatch.next(true);
        this.firebaseAPI.accountSnackBarOpen.next(false);
        if (this.channelPanelService.isDetachedSubject.getValue()) {
            this.ipc.send('closeChildWindowLogout');
        }
        this.userService.signOut();
        this.router.navigateByUrl('/');
    }

    ngOnInit(): void {
        this.badgeService.badgeUpdate();
        this.firebaseAPI.getAllAvatars();
        this.isDetachedSubscription = this.channelPanelService.isDetachedSubject.subscribe(isDetached => {
            this.isDetached = isDetached;
        });
        this.shouldCloseDialogSubscription = this.gameLobbyService.shouldCloseDialogSubject.subscribe(shouldClose => {
            if (shouldClose) {
                this.dialog.closeAll();
            }
        });
        this.isOnFirstSignInSubscription = this.signupService.isOnFirstSignInSubject.subscribe(isOnFirstSignIn => {
            if (isOnFirstSignIn) {
                setTimeout(() => {
                    this.openTutorialDialog();
                    this.signupService.isOnFirstSignInSubject.next(false);
                }, 500);
            }
        });
        this.badgeSubscription = this.badgeService.newBadge.subscribe(val => {
            if (val) {
                this.openBadgeDialog();
            }
        });
    }

    ngOnDestroy(): void {
        this.musicPlayer.stopMusic();
        this.isDetachedSubscription.unsubscribe();
        this.shouldCloseDialogSubscription.unsubscribe();
        this.isOnFirstSignInSubscription.unsubscribe();
        this.badgeSubscription.unsubscribe();
    }
}
