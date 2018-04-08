import { HttpClient } from '@angular/common/http';
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
    public http: HttpClient,
    public platform: Platform,
    private googlePlus: GooglePlus
  ) {}

  init(uid, callback) {
    this.handleLoginResponse({ 'uid': uid }, callback);
  }

  login(callback) {
    if (this.platform.is('cordova')) {
      this.deviceLoginWithGoogle((res) => this.handleLoginResponse(res, callback));
    } else {
      this.webLoginWithGoogle((res) => this.handleLoginResponse(res, callback));
    }
  }

  deviceLoginWithGoogle(callback) {
    this.googlePlus.login({
      webClientId: config.auth.webClientId
    }).then(res => {
      // this.presentToast('Login com google: ' + JSON.stringify(res));
      // console.log('Login com google:', JSON.stringify(res));
      firebase.auth().signInWithCredential(
        firebase.auth.GoogleAuthProvider.credential(res.idToken)
      ).then(function (result) {
        // console.log('login', JSON.stringify(result));
        callback({ 'uid': result.uid });
      }).catch(function (error) {
        callback({ 'erro': error });
      });
    }).catch(err => {
      callback({ 'erro': err });
    });
  }

  webLoginWithGoogle(callback) {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // console.log('login',result);
      callback({ 'uid': result.user.uid });
    }).catch(function (error) {
      callback({ 'erro': error });
    });
  }

  handleLoginResponse(res, callback) {
    if (res.erro) {
      console.error('Erro no Login via Google');
      console.error(res.error);
      callback({ 'erro': 'Erro, não foi possível fazer o login pelo Google.' });
    } else {
      var unsubscribe = firebase.auth().onAuthStateChanged(user => {
        unsubscribe();
        if (user) {
          this.user = user;
          user.getIdToken().then((idToken) => {
            // this.saveUserState(user, idToken);
            this.token = idToken;
            // this.updateLoginApi();
            callback({ 'uid': user.uid });
          }).catch((error) => {
            // console.log('firebase identificou usuário mas sem token');
            console.error('Id Token error');
            console.error(JSON.stringify(error));
            // this.saveUserState(user, null);
            this.token = null;
            // this.updateLoginApi();
            callback({ 'uid': user.uid });
          })
        } else {
          // console.log('firebase não identificou usuário');
          // this.saveUserState(null, null);
          this.user = null;
          this.token = null;
          // this.updateLoginApi();
          callback({ 'erro': 'Erro, não foi possível fazer o login pelo Google.' });
        }
      });
    }
  }

  logout(callback) {
    this.user = null;
    this.token = null;
    if (this.platform.is('cordova')) {
      this.googlePlus.logout().then(() => {
        this.logoutFromFirebase(callback);
      }).catch(error => {
        console.error('logout error:', error);
        callback({ 'erro': error });
      });
    } else {
      this.logoutFromFirebase(callback);
    }
  }

  logoutFromFirebase(callback) {
    firebase.auth().signOut().then(() => {
      callback({ 'ok': true });
    }).catch(error => {
      console.error('logout error:', error);
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
