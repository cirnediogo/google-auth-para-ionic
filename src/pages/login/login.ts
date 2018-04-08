import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AuthProvider } from '../../providers/auth/auth';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { PerfilPage } from '../perfil/perfil';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authProvider: AuthProvider
  ) { }

  login() {
    let loader = this.loadingCtrl.create({
      content: "Efetuando login. Aguarde..."
    });
    loader.present();
    this.authProvider.loginWithGoogle(res => {
      loader.dismiss();
      if (res.erro) {
        this.presentToast(res.erro);
      } else {
        this.navCtrl.setRoot(PerfilPage);
      }
    });
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

}