import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { LogInInformations } from '../../classes/log-in-informations';
import { FirebaseApiService } from '../server/firebase-api.service';

@Injectable({
    providedIn: 'root',
})
export class LoginApiService {
    loginInformations: LogInInformations;
    signUpObservable: Subject<boolean> = new Subject<boolean>();

    constructor(private firebaseAPI: FirebaseApiService) { }

    async authenticateAccount(loginInfo: LogInInformations): Promise<void> {
        await this.firebaseAPI.authenticateUser(loginInfo);
    }

    signUpSuccessful(): void {
        this.signUpObservable.next(true);
        console.log('Successful'); // DO NOT REMOVE OTHERWISE THIS IS NOT A FUNCTION AND WILL CRASH
    }
}
