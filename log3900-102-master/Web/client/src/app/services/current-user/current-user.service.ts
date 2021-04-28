import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CurrentUserService {
    selectedBadge: number;
    currentAvatar: string;
    constructor() {
        this.selectedBadge = 0;
        this.currentAvatar = '';
    }
}
