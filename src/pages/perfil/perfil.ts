import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  user: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthProvider
  ) { }

  ionViewDidLoad() {
    this.user = this.auth.getUser();
  }

  ionViewWillUnload() {
    this.user = null;
  }
  
  logout() {
    this.auth.logout(res => {
      this.user = this.auth.getUser();
      if (!res.error) {
        this.navCtrl.setRoot(LoginPage);
      }
    })
  }

}
