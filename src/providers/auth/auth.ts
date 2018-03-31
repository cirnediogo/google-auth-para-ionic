import { Injectable } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus';

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {

  constructor(public googlePlus: GooglePlus) {
  }


  login(callback?) {

    this.googlePlus.login({
      'webClientId': '1050079550225-n39dhjglgs7mcicuvl0k1953t59pvljt.apps.googleusercontent.com'
    }).then((res) => {
      console.log(res);
      if (callback) {
        callback();
      }
    }, (err) => {
      console.error(err);
    });

  }

  logout(callback?) {

    this.googlePlus.logout().then(() => {
      console.log("logged out");
      if (callback) {
        callback();
      }
    });

  }

}
