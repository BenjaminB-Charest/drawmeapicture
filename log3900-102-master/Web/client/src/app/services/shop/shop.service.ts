import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ShopService implements OnInit {
    isBuyingSubject: BehaviorSubject<boolean>;
    constructor() {
        this.isBuyingSubject = new BehaviorSubject<boolean>(false);
    }

    ngOnInit(): void {}
}
