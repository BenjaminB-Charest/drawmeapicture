import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameLobbyService implements OnInit {
    fromCreateLobby: boolean;
    shouldCloseDialogSubject: BehaviorSubject<boolean>;
    constructor() {
        this.shouldCloseDialogSubject = new BehaviorSubject<boolean>(false);
    }

    setFromCreateLobby(fromCreateLobby: boolean): void {
        this.fromCreateLobby = fromCreateLobby;
    }

    ngOnInit(): void {}
}
