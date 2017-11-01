import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent {
    user: Observable<firebase.User>;
    loginStatusMsg: string = '';
    successResponse;

    constructor(public afAuth: AngularFireAuth, private router:Router) {
        this.user = afAuth.authState;
        this.updateLoginStatusMsg();
    }

    updateLoginStatusMsg() {
        if(this.isLogged()) this.loginStatusMsg = 'Your are logged in';
        else this.loginStatusMsg = 'Please log in';
    }

    login() {
        this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then((success) => {
            this.router.navigateByUrl('/add-story');
            this.updateLoginStatusMsg();
            this.successResponse = success;
        }).catch((error) => {
            this.loginStatusMsg = 'Login failed, please try again';
        });
    }

    logout() {
        this.afAuth.auth.signOut();
        this.updateLoginStatusMsg();
    }

    isLogged(): boolean {
        return this.afAuth.auth.currentUser !== null;
    }
}