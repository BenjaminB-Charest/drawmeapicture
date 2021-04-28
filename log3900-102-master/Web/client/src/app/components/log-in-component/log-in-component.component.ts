import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LogInInformations } from 'src/app/classes/log-in-informations';
import { LoginErrors } from 'src/app/classes/login-errors';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { LoginApiService } from 'src/app/services/server/login-api.service';
import { SignUpComponent } from '../sign-up-component/sign-up.component';

@Component({
    selector: 'app-log-in-component',
    templateUrl: './log-in-component.component.html',
    styleUrls: ['./log-in-component.component.scss'],
})
export class LogInComponent implements OnInit, OnDestroy {
    loginForm: FormGroup;
    loginUsername: FormControl;
    loginPassword: FormControl;
    loginRememberMe: FormControl;

    emptyUsername: boolean;
    emptyPassword: boolean;
    usernamePasswordMatch: boolean;
    accountExists: boolean;

    loginErrors: LoginErrors;

    private loginSuccessful: boolean;
    private loginObservable: Subscription;
    private signInObservable: Subscription;
    private accountExistSubscription: Subscription;
    private accountInfoMatchSubscription: Subscription;

    constructor(
        private dialog: MatDialog,
        formBuilder: FormBuilder,
        private router: Router,
        private loginService: LoginApiService,
        private firebaseAPI: FirebaseApiService,
    ) {
        this.loginUsername = new FormControl('', [Validators.required]);
        this.loginPassword = new FormControl('', [Validators.required]);
        this.loginRememberMe = new FormControl(false);

        this.emptyUsername = false;
        this.emptyPassword = false;
        this.loginErrors = new LoginErrors();

        this.loginForm = formBuilder.group({
            username: this.loginUsername,
            password: this.loginPassword,
        });
    }

    onLogin(): void {
        this.emptyUsername = false;
        this.emptyPassword = false;
        this.firebaseAPI.accountExists.next(true);
        this.firebaseAPI.accountInfoMatch.next(true);
        this.firebaseAPI.accountSnackBarOpen.next(false);

        if (this.loginUsername.value.trim() === '') {
            this.emptyUsername = true;
            return;
        }
        if (this.loginPassword.value.trim() === '') {
            this.emptyPassword = true;
            return;
        }

        this.loginService.loginInformations = {
            username: this.loginUsername.value,
            password: this.loginPassword.value,
        } as LogInInformations;

        this.loginService.authenticateAccount(this.loginService.loginInformations).then(() => {
            if (this.loginSuccessful) {
                this.router.navigateByUrl('/home'); // If username and password matches
            } else {
                if (this.accountExists) {
                    if (!this.firebaseAPI.accountSnackBarOpen.getValue()) {
                        this.usernamePasswordMatch = false; // If username and password do not match
                    }
                }
                if (this.usernamePasswordMatch) {
                    if (!this.firebaseAPI.accountSnackBarOpen.getValue()) {
                        this.accountExists = false;
                    }
                }
            }
        });
    }

    openLoginDialog(): void {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.width = 'auto';
        dialogConfig.height = 'auto';
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = false;
        this.dialog.open(SignUpComponent, dialogConfig);
    }

    closeSignUpDialog(): void {
        this.dialog.closeAll();
    }

    ngOnInit(): void {
        this.loginObservable = this.firebaseAPI.logInSuccessful.subscribe(loginReturn => {
            this.loginSuccessful = loginReturn;
        });

        this.signInObservable = this.loginService.signUpObservable.subscribe(signUp => {
            if (signUp) {
                this.closeSignUpDialog();
            }
        });

        this.accountExistSubscription = this.firebaseAPI.accountExists.subscribe(accountExists => {
            this.accountExists = accountExists;
        });

        this.accountInfoMatchSubscription = this.firebaseAPI.accountInfoMatch.subscribe(accountInfoMatch => {
            this.usernamePasswordMatch = accountInfoMatch;
        });
    }

    ngOnDestroy(): void {
        this.loginObservable.unsubscribe();
        this.signInObservable.unsubscribe();
        this.accountExistSubscription.unsubscribe();
        this.accountInfoMatchSubscription.unsubscribe();
    }
}
