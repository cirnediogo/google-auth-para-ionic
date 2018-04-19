import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import * as firebase from 'firebase';

import config from '../../project-specific-config.json'

@Injectable()
export class GoogleAuthProvider {

  private user: firebase.User;
  private token: any;

  constructor(
    public platform: Platform,
    private googlePlus: GooglePlus
  ) { }

  init(uid, callback) {
    this.handleLoginResponse({ 'uid': uid }, callback);
  }

  login(callback) {
    if (this.platform.is('cordova')) {
      this.deviceLoginWithGoogle(res => this.handleLoginResponse(res, callback));
    } else {
      this.webLoginWithGoogle(res => this.handleLoginResponse(res, callback));
    }
  }

  deviceLoginWithGoogle(callback) {
    this.googlePlus.login({
      webClientId: config.auth.webClientId
    }).then(res => {
      firebase.auth().signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(res.idToken)
      ).then(result => {
        callback({ 'uid': result.uid });
      }).catch(error => {
        callback({ 'erro': error });
      });
    }).catch(err => {
      callback({ 'erro': err });
    });
  }

  webLoginWithGoogle(callback) {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(result => {
      callback({ 'uid': result.user.uid });
    }).catch(error => {
      callback({ 'erro': error });
    });
  }

  handleLoginResponse(res, callback) {
    if (res.erro) {
      callback({ 'erro': 'Erro, não foi possível fazer o login pelo Google.' });
    } else {
      var unsubscribe = firebase.auth().onAuthStateChanged(user => {
        unsubscribe();
        if (user) {
          this.user = user;
          user.getIdToken().then(idToken => {
            this.token = idToken;
            callback({ 'uid': user.uid });
          }).catch(error => {
            this.token = null;
            callback({ 'uid': user.uid });
          })
        } else {
          this.user = null;
          this.token = null;
          callback({ 'erro': 'Erro, não foi possível fazer o login pelo Google.' });
        }
      });
    }
  }

  logout(callback) {
    if (this.platform.is('cordova')) {
      this.googlePlus.logout().then(() => {
        this.logoutFromFirebase(callback);
      }).catch(error => {
        callback({ 'erro': error });
      });
    } else {
      this.logoutFromFirebase(callback);
    }
  }

  logoutFromFirebase(callback) {
    firebase.auth().signOut().then(() => {
      this.user = null;
      this.token = null;
      callback({ 'ok': true });
    }).catch(error => {
      callback({ 'erro': error });
    });
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

}
