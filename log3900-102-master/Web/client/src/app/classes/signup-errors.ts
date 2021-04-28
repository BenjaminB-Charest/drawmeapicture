export class SignupErrors {
    nonValidUsernameError: string;
    nonValidFirstnameError: string;
    nonValidLastnameError: string;
    nonValidPasswordError: string;
    nonEmptyFieldError: string;
    nonMatchPasswordError: string;
    nonTermsOfUseError: string;
    nonEmptySpaceError: string;
    usernameAlreadyExistsError: string;
    constructor() {
        this.nonValidUsernameError = 'Please enter a valid username';
        this.nonValidFirstnameError = 'Please enter a valid first name';
        this.nonValidLastnameError = 'Please enter a valid last name';
        this.nonValidPasswordError = 'Please enter a valid password';
        this.nonEmptyFieldError = 'One of the fields are empty';
        this.nonMatchPasswordError = 'Passwords do not match';
        this.nonTermsOfUseError = 'Please accept the Terms of User';
        this.nonEmptySpaceError = 'One of the fields contains an whitespace';
        this.usernameAlreadyExistsError = 'Your username already exists';
    }
}
