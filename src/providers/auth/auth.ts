import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular/util/events';

import { GoogleAuthProvider } from './google-auth';

const PATH_UID:string = 'user_uid';

@Injectable()
export class AuthProvider {

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
      this.events.publish('user:signedout');
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
    if (!user) {
      this.setStoredUid(null).then().catch();
    } else {
      this.setStoredUid(user.uid).then().catch();
    }
  }

  isSignedIn(): boolean {
    var user = this.googleAuth.getUser();
    return (user != null && user.uid != null && user.uid != "");
  }

  getUser() {
    return this.googleAuth.getUser();
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
