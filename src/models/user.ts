export class User {

    uid: string;
    email: string;
    photoURL: string;
    displayName: string;
    idToken: string;

    constructor() {
        this.uid = null;
        this.email = null;
        this.photoURL = null;
        this.displayName = null;
        this.idToken = null;
    }
}