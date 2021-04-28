import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NAME_MAX_LIMIT, NAME_MIN_LIMIT, PASSWORD_MIN_LIMIT, USERNAME_MAX_LIMIT } from 'src/app/classes/constants';
import { SignUpHints } from 'src/app/classes/sign-up-hints';
import { SignUpInformations } from 'src/app/classes/sign-up-informations';
import { SignupAvatar } from 'src/app/classes/signup-avatar';
import { SignupErrors } from 'src/app/classes/signup-errors';
import { SignupAvatarType } from 'src/app/enums/signup-avatar-type.enum';
import { FirebaseApiService } from 'src/app/services/server/firebase-api.service';
import { LoginApiService } from 'src/app/services/server/login-api.service';
import { SignupService } from 'src/app/services/signup/signup.service';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    styles: ['::ng-deep .cdk-overlay-backdrop{right:0px;}'],
})
export class SignUpComponent implements OnInit, OnDestroy {
    fieldEmpty: boolean;
    passwordMatch: boolean;
    hasEmptySpaces: boolean;
    private isSuccessful: boolean;
    usernameAlreadyExists: boolean;

    signupHints: SignUpHints;
    signupErrors: SignupErrors;

    signupForm: FormGroup;
    signupAvatar: FormControl;
    signupFirstName: FormControl;
    signupLastName: FormControl;
    signupUserName: FormControl;
    signupInitPassword: FormControl;
    signupConfirmPassword: FormControl;

    private manAvatar: SignupAvatar;
    private womanAvatar: SignupAvatar;
    private accountCreationObservable: Subscription;

    @ViewChild('previewAvatar', { static: false }) previewAvatar: ElementRef<HTMLImageElement>;

    constructor(
        formBuilder: FormBuilder,
        private signupService: SignupService,
        private firebaseAPI: FirebaseApiService,
        private loginService: LoginApiService,
    ) {
        this.initSignupControlVariables();
        this.assignFormControlToForm(formBuilder);
    }

    changePreviewAvatar(sexe: string): void {
        switch (sexe) {
            case SignupAvatarType.Man:
                this.changeAvatarTo(this.manAvatar);
                break;
            case SignupAvatarType.Woman:
                this.changeAvatarTo(this.womanAvatar);
                break;
        }
    }

    private changeAvatarTo(avatar: SignupAvatar): void {
        this.previewAvatar.nativeElement.src = avatar.imageURL;
        this.signupAvatar.setValue(avatar.type);
    }

    onSignUp(): void {
        this.setErrorBooleanToNonErrorValue();
        if (this.usernameAndPasswordHaveSpaces()) {
            this.hasEmptySpaces = true;
            return;
        }
        if (this.passwordsDoNotMatches()) {
            this.passwordMatch = false;
            return;
        }
        if (this.fieldsAreEmpty()) {
            this.fieldEmpty = true;
            return;
        }
        this.sendUserInformationToService();
        this.createProfile();
        this.signupService.isOnFirstSignInSubject.next(true);
    }

    private sendUserInformationToService(): void {
        this.signupService.signupInformations = {
            firstname: this.signupFirstName.value,
            lastname: this.signupLastName.value,
            username: this.signupUserName.value,
            password: this.signupConfirmPassword.value,
            avatar: this.signupAvatar.value,
        } as SignUpInformations;
    }

    private createProfile(): void {
        this.firebaseAPI.createProfile(this.signupService.signupInformations).then(() => {
            if (this.isSuccessful) {
                this.loginService.signUpSuccessful();
            } else {
                this.usernameAlreadyExists = true; // ON FAIL, DO ACTIONS HERE
                return;
            }
        });
    }

    private fieldsAreEmpty(): boolean {
        return (
            this.signupFirstName.value.trim() === '' ||
            this.signupLastName.value.trim() === '' ||
            this.signupUserName.value.trim() === '' ||
            this.signupInitPassword.value.trim() === '' ||
            this.signupConfirmPassword.value.trim() === ''
        );
    }

    private passwordsDoNotMatches(): boolean {
        return this.signupInitPassword.value !== this.signupConfirmPassword.value;
    }

    private usernameAndPasswordHaveSpaces(): boolean {
        return (
            this.signupService.hasEmptySpaces(this.signupUserName.value) ||
            this.signupService.hasEmptySpaces(this.signupInitPassword.value) ||
            this.signupService.hasEmptySpaces(this.signupConfirmPassword.value)
        );
    }

    private initSignupControlVariables(): void {
        this.initFormControls();
        this.initBasicAvatarValues();
        this.initErrorAndWarningMessages();
        this.setErrorBooleanToNonErrorValue();
    }

    private setErrorBooleanToNonErrorValue(): void {
        this.passwordMatch = true;
        this.fieldEmpty = false;
        this.hasEmptySpaces = false;
        this.usernameAlreadyExists = false;
        this.isSuccessful = false;
    }

    private initFormControls(): void {
        this.signupFirstName = new FormControl('', [Validators.required, Validators.minLength(NAME_MIN_LIMIT), Validators.maxLength(NAME_MAX_LIMIT)]);
        this.signupLastName = new FormControl('', [Validators.required, Validators.minLength(NAME_MIN_LIMIT), Validators.maxLength(NAME_MAX_LIMIT)]);
        this.signupUserName = new FormControl('', [
            Validators.required,
            Validators.minLength(NAME_MIN_LIMIT),
            Validators.maxLength(USERNAME_MAX_LIMIT),
        ]);
        this.signupInitPassword = new FormControl('', [Validators.required, Validators.minLength(PASSWORD_MIN_LIMIT)]);
        this.signupConfirmPassword = new FormControl('', [Validators.required, Validators.minLength(PASSWORD_MIN_LIMIT)]);
        this.signupAvatar = new FormControl('', [Validators.required]);
        this.signupAvatar.setValue(SignupAvatarType.Man); // THE PATHS FOR THIS ELEMENT NEED TO BE ADDED
    }

    private initBasicAvatarValues(): void {
        this.manAvatar = { type: SignupAvatarType.Man, imageURL: 'assets/avatar/avatar_init_homme.png' };
        this.womanAvatar = { type: SignupAvatarType.Woman, imageURL: 'assets/avatar/avatar_init_femme.png' };
    }

    private initErrorAndWarningMessages(): void {
        this.signupErrors = new SignupErrors();
        this.signupHints = new SignUpHints();
    }

    private assignFormControlToForm(formBuilder: FormBuilder): void {
        this.signupForm = formBuilder.group({
            firstname: this.signupFirstName,
            lastname: this.signupLastName,
            username: this.signupUserName,
            initPassword: this.signupInitPassword,
            confirmPassword: this.signupConfirmPassword,
            avatar: this.signupAvatar,
        });
    }

    ngOnInit(): void {
        this.accountCreationObservable = this.firebaseAPI.accountCreationSuccessful.subscribe(successful => {
            this.isSuccessful = successful;
        });
    }

    ngOnDestroy(): void {
        this.accountCreationObservable.unsubscribe();
    }
}
