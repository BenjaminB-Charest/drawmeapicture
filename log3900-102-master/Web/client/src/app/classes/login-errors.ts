export class LoginErrors {
    nonValidUsernameError: string;
    emptySpaceUsernameError: string;
    emptyPasswordError: string;
    loginPasswordError: string;
    usernamePasswordNotMatchError: string;
    accountExistsError: string;
    constructor() {
        this.nonValidUsernameError = 'Please enter a username';
        this.emptySpaceUsernameError = 'Please enter a non empty username';
        this.emptyPasswordError = 'Please enter a non empty password';
        this.loginPasswordError = 'Please enter a password';
        this.usernamePasswordNotMatchError = 'The username and password does not match';
        this.accountExistsError = "The account doesn't exists";
    }
}
