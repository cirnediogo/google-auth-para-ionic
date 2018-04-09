import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginPage } from '../login/login';
import { User } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  user: User;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthProvider
  ) { }

  ionViewDidLoad() {
    this.user = this.auth.getUser();
  }

  ionViewWillUnload() {
    this.user = new User();
  }
  
  logout() {
    this.auth.logout(res => {
      if (!res.error) {
        this.navCtrl.setRoot(LoginPage);
      }
    })
  }

}
