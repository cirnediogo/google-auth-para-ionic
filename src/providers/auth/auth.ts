import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular/util/events';

import { GoogleAuthProvider } from './google-auth';
import { User } from '../../models/user';

const PATH_UID:string = 'user_uid';

@Injectable()
export class AuthProvider {

  private user: User;

  constructor(
    private googleAuth: GoogleAuthProvider,
    private storage: Storage,
    private events: Events
  ) { }

  init(callback) {
    this.getStoredUid().then(storedUid => {
      if (storedUid) {
        this.googleAuth.init(storedUid, 
          resInit => this.handleGoogleLogin(resInit, callback)
        );
      }
    }).catch(() => { })
  }

  loginWithGoogle(callback) {
    this.googleAuth.login(res => this.handleGoogleLogin(res, callback));
  }

  logout(callback) {
    this.googleAuth.logout(res => {
      if (!res.erro) {
        this.saveUserState(null, null);
        this.events.publish('user:signedout');
      }
      callback(res);
    });
  }

  handleGoogleLogin(res, callback) {
    if (!res.erro) {
      this.saveUserState(this.googleAuth.getUser(), this.googleAuth.getToken());
      this.events.publish('user:signedin', this.googleAuth.getUser());
    }
    callback(res);
  }

  saveUserState(user?: any, token?: string) {
    this.user = new User();
    if (!user) {
      this.setStoredUid(null).then().catch();
    } else {
      this.user.uid = user.uid;
      this.user.displayName = user.displayName;
      this.user.photoURL = user.photoURL;
      this.user.email = user.email;
      this.user.idToken = token;
      this.setStoredUid(user.uid).then().catch();
    }
  }

  isSignedIn(): boolean {
    return (this.user != null && this.user.uid != null);
  }

  getUser() {
    return this.user;
  }

  setStoredUid(uid: string): Promise<any> {
    if (!uid) {
      return this.storage.remove(PATH_UID);
    } else {
      return this.storage.set(PATH_UID, uid);
    }
  }

  getStoredUid(): Promise<any> {
    return this.storage.get(PATH_UID);
  }

}
