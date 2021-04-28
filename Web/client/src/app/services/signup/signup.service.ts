import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SignUpInformations } from '../../classes/sign-up-informations';

@Injectable({
    providedIn: 'root',
})
export class SignupService {
    signupInformations: SignUpInformations;
    isOnFirstSignInSubject: BehaviorSubject<boolean>;

    constructor(private router: Router) {
        this.isOnFirstSignInSubject = new BehaviorSubject<boolean>(false);
    }

    hasEmptySpaces(field: string): boolean {
        return /\s/.test(field);
    }

    goToMainMenu(): void {
        this.router.navigateByUrl('/home');
    }
}
