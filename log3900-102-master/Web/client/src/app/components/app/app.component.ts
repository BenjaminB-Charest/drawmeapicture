import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ChannelPanelService } from 'src/app/services/channel-pannel/channel-panel.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
    readonly title: string = 'Draw Me a Picture!';
    shouldRefreshToHomeSubscription: Subscription;
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    constructor(router: Router, private channelPanelService: ChannelPanelService) {
        this.shouldRefreshToHomeSubscription = this.channelPanelService.shouldRefreshToHome.subscribe(shoudlRefreshToHome => {
            if (shoudlRefreshToHome && this.channelPanelService.isFromSecondWindow) {
                if (localStorage.getItem('username') !== null) {
                    router.navigateByUrl('/home');
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.shouldRefreshToHomeSubscription.unsubscribe();
    }
}
