export class SignUpHints {
    nameHint: string;
    usernameHint: string;
    passwordHint: string;
    constructor() {
        this.nameHint = ' Min 1 characters, Max 20 characters';
        this.usernameHint = 'Please do not include spaces. Min 1 characters, Max 12 characters';
        this.passwordHint = 'Please do not include spaces. Min 6 characters';
    }
}
