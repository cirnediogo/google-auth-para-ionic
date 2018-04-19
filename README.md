# Descrição

Este manual descreve os passos a serem executados para adicionar a autenticação via Google em um aplicativo Android desenvolvido em Ionic 3.

# Sumário

* 1\. [Configuração no Firebase](#1-configuração-no-firebase)
  * 1.1\. [Gerar o arquivo `.keystore`](#11-gerar-o-arquivo-keystore)
  * 1.2\. [Obter a chave SHA-1](#12-obter-a-chave-sha-1)
  * 1.3\. [Criar o projeto no Firebase](#13-criar-o-projeto-no-firebase)
  * 1.4\. [Habilitar a autenticação via Google](#14-habilitar-a-autenticação-via-google)
  * 1.5\. [Obter dados de configuração do projeto](#15-obter-dados-de-configuração-do-projeto)
* 2\. [Configuração no código](#2-configuração-no-código)
  * 2.1\. [Instalar o módulo do Firebase](#21-instalar-o-módulo-do-firebase)
  * 2.2\. [Importar configurações](#22-importar-configurações)
  * 2.3\. [Configurar o `keystore` no *cordova*](#23-configurar-o-keystore-no-cordova)
  * 2.4\. [Instalar o plugin do Google Plus](#24-instalar-o-plugin-do-google-plus)
* 3\. [Programação](#3-programação)
  * 3.1\. [Criando a rotina de login](#31-criando-a-rotina-de-login)
  * 3.2\. [Criando o logout](#32-criando-o-logout)
  * 3.3\. [Criando a autenticação automática](#33-criando-a-autenticação-automática)

# 1. Configuração no Firebase

### 1.1. Gerar o arquivo `.keystore`

Para habilitar a autenticação via Google no Android, é necessário gerar o "certificado" para o app. Para isso, utilize o comando `keytool` (comando instalado juntamente com o Android Studio):

```
keytool -genkey -v -keystore meu-app.keystore -alias meu-app-cert -keyalg RSA -keysize 2048 -validity 10000
```

> obs.: substitua `meu-app.keystore` e `meu-app-cert` pelo que você achar melhor.

Ao executar o comando, você deverá responder uma séria de perguntas e definir uma senha. Este arquivo `.keystore`, juntamente com a senha, serão utilizados futuramente para colocar o aplicativo na *Play Store*.

### 1.2. Obter a chave SHA-1

Em seguida, execute o seguinte comando (utilize os mesmos nomes que você utilizou no comando da sessão 1.1):

```
keytool -exportcert -list -v -alias meu-app-cert -keystore meu-app.keystore
```

> obs.: A depender da versão do `keytool` instalada, a opção `-exportcert` poderá se chamar apenas `-export`.

Ao executar o comando acima, procure no console, uma linha como a seguinte:

```
SHA1: xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx
```

Copie o número, ele será utilizado para identificar o app no Firebase.

### 1.3. Criar o projeto no Firebase

Agora, vá até o [Firebase Console](console.firebase.google.com), crie o projeto para o aplicativo, acesse a página principal do projeto (*Project Overview*) adicione ao projeto um app Android e, no campo *SHA certificate fingerprints* insira o valor do que SHA1 que você obteve anteriormente.

### 1.4. Habilitar a autenticação via Google

Para habilitar o método de autenticação no app, clique na opção *Authetication* do menu lateral e, em seguida, na aba *Sign-in Method* do painel superior. Você verá várias opções de autenticação, clique na opção do *Google*, selecione *Enable* para habilitá-la e procure, dentro de *Web SDK configuration*, o *Web client ID*, que terá o seguinte formato:

```
*************************.apps.googleusercontent.com
```

Copie-o para utulizá-lo futuramente, no código.

### 1.5. Obter dados de configuração do projeto

Para concluir a configuração do projeto no Firebase, ainda na página *Authentication* do *Firebase Console*, clique em *Web Setup* no canto superior direito e copie os dados de configuração que serão mostrados no seguinte formato:

```json
var config = {
    "apiKey": "<API_KEY>",
    "authDomain": "<PROJECT_ID>.firebaseapp.com",
    "databaseURL": "https://<DATABASE_NAME>.firebaseio.com",
    "projectId": "<PROJECT_ID>",
    "storageBucket": "<BUCKET>.appspot.com"
};
```

Estas informações permitirão com que o aplicativo se conecte ao projeto criado no Firebase. Com isso, está concluída toda a configuração no Firebase.

# 2. Configuração no código

### 2.1. Instalar o módulo do Firebase

Adicione o Firebase ao app por meio do `npm`:

```
npm install firebase --save
```

### 2.2. Importar configurações

Crie um arquivo `project-config.json` em `/src/` (ou em outro diretório de sua preferência) com as informações obtidas nas sessões 1.5 e 1.4:

```json
{
    "firebase": {
        "apiKey": "<API_KEY>",
        "authDomain": "<PROJECT_ID>.firebaseapp.com",
        "databaseURL": "https://<DATABASE_NAME>.firebaseio.com",
        "projectId": "<PROJECT_ID>",
        "storageBucket": "<BUCKET>.appspot.com"
    },
    "auth": {
        "webClientId": "*************************.apps.googleusercontent.com"
    }
}
```

> obs.: se preferir, essas informações podem ser definidas no próprio código onde serão utilizadas, sem que precise ser criado um arquivo separado para isso, no entanto, é aconselhável fazer dessa forma por motivos de organização e baixo acoplamento.

Agora, no `app.component.ts`, importe as configurações:

```typescript
...
import * as firebase from 'firebase';
import config from '../project-config.json';
...
  this.platform.ready().then(() => {
    ...
    firebase.initializeApp(config.firebase);
    ...
  });
```

Isso fará com que o app se conecte ao projeto criado anteriormente no Firebase.

> obs.: caso o arquivo `project-config.json` não seja reconhecido, adicione um outro arquivo, chamado `typings.d.ts` na pasta `/src/` com o seguinte conteúdo:

```typescript
declare module "*.json" {
  const value: any;
  export default value;
}
```

Isso fará com que qualquer arquivo `.json` seja reconhecido e seus parâmetros exportados para serem utilizados no código.

### 2.3. Configurar o `keystore` no *cordova*

Caso ainda não o tenha feito, adicione a plataforma Android por meio do *cordova*:

```
ionic cordova platform add android
```

Crie o arquivo `debug-signing.properties`:

```
keyAlias=meu-app-cert
keyPassword=*************
storeFile=meu-app.keystore
storePassword=*************
```

> obs.: o `keyAlias` e o `storefile` devem possuir os mesmos nomes utilizados nas sessões 1.1 e 1.2, enquanto que `keyPassword` e `storePassword` devem possuir a senha criada na sessão 1.1 (se você criou senhas diferentes, insira as duas, senão, repita a mesma senha nos dois campos).

Este arquivo e o arquivo `.keystore` criado na sessão 1.1 devem estar presentes na pasta `/platforms/android/`, no entanto, sempre que for necessário adicionar a platforma novamente, eles serão exlcluídos, portanto uma sugestão é colocá-los em algum diretório do projeto e copiá-los para `/platforms/android/` sempre que a plataforma android for adicionada. Se necessário, pode-se fazer um script para copiá-los automaticamente.

Por fim, é necessário atualizar o *cordova*:

```
cordova prepare
```

### 2.4. Instalar o plugin do Google Plus

O Ionic possui um plugin nativo do [Google Plus](https://ionicframework.com/docs/native/google-plus/) que nos permite fazer a conexão com a conta Google com usuário. Instale-o com os comandos abaixo:

```
ionic cordova plugin add cordova-plugin-googleplus
npm install --save @ionic-native/google-plus
```

# 3. Programação

### 3.1. Criando a rotina de login

Para começar a parte mais importante do app, crie uma página chamada `Login`:

```
ionic generate page login
```

A página de login propriamente dita (`login.html`) é bastante simples, modifique até ficar de acordo com a sua preferência.

```html
<ion-content padding>
  <button ion-button full color='danger' (click)="login()">Login via Google</button>
</ion-content>
```

O `login.ts` contém apenas o método responsável por chamar a rotina de login e redirecionar a página.

```typescript
export class LoginPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private auth: AuthProvider
  ) { }
  login() {
    let loader = this.loadingCtrl.create({
      content: "Efetuando login. Aguarde..."
    });
    loader.present();
    this.auth.loginWithGoogle(res => {
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
```

Como pode-se ver, o método apenas utiliza um *provider* (que será criado em seguida), para fazer o login e, se não houver erro, redireciona o aplicativo para outra página (que será criada mais a frente) para exibir o perfil do usuário.

Agora, vamos criar dois *providers*, um (`AuthProvider`) para lidar com os aspectos de autenticação do app em geral, e outro (`GoogleAuthProvider`) apenas para lidar com as ações relativas à conexão com o Google.

```
ionic generate provider auth
ionic generate provider google-auth
```

O `AuthProvider` deverá possuir a seguinte estrutura:

```typescript
...
const PATH_UID:string = '<app_name>_user_uid';
@Injectable()
export class AuthProvider {
  private user: User;
  constructor(
    private googleAuth: GoogleAuthProvider,
    private storage: Storage
  ) { }
  loginWithGoogle(callback) {
    this.googleAuth.login(res => this.handleGoogleLogin(res, callback));
  }
  handleGoogleLogin(res, callback) {
    if (!res.erro) {
      this.saveUserState(this.googleAuth.getUser(), this.googleAuth.getToken());
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
```

O *provider* acima redireciona a rotina de login para o `GoogleAuthProvider` e, dada a resposta, obtém os dados do usuário criando um objeto da classe `User` (que será criada em seguida) e armazena o `uid` para uso futuro (autenticar usuário automaticamente ao abrir o app novamente).

Para gerar a classe `User` e centralizar os dados do usuário, basta criar uma pasta chamada `/models/` e, dentro dela, o arquivo `user.ts`, com o seguinte código:

```typescript
export class User {
    uid: string;
    email: string;
    photoURL: string;
    displayName: string;
    idToken: string;
    constructor() {...}
}
```

O `GoogleAuthProvider`, como dito anteriormente, será responsável unicamente por tratar da conexão com o Google:

```typescript
...
import { Platform } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';
import * as firebase from 'firebase';
import config from '../../project-config.json'

@Injectable()
export class GoogleAuthProvider {
  private user: firebase.User;
  private token: any;
  constructor(
    public platform: Platform,
    private googlePlus: GooglePlus
  ) {}
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
  getUser() {
    return this.user;
  }
  getToken() {
    return this.token;
  }
}
```

O login via Google está preparado para fazer a autenticação no dispositivo ou no navegador. Quando executado no navegador, o Firebase se encarrega da seleção do usuário. Quando executado no dispositivo, utiliza-se o plugin do Google Plus e o *Web client ID* obtido na sessão 1.4 para a seleção do usuário, enviando aquele selecionado para o Firebase. Por fim, obtém-se o token do usuário (que pode ser usado futuramente para verificação da conta).

Como você deve se lembrar, a página de login redireciona o aplicativo para a página de perfil para exibição das informações do usuário. Para isso, devemos criar a nova página:

```
ionic generate page perfil
```

No componente `perfil.ts`, simplesmente precisamos obter o `AuthProvider` para acesso ao usuário da aplicação.

```typescript
...
export class PerfilPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private auth: AuthProvider
  ) { }
}
```

Em `perfil.html`, os dados do usuário estarão disponíveis para exibição.

```html
<ion-content>
  <ion-card>
    <img [src]='auth.user?.photoURL' />
    <ion-card-content>
      <ion-card-title> {{ auth.user?.displayName }} </ion-card-title>
      <p> {{ auth.user?.email }} </p>
      <p> {{ auth.user?.uid }} </p>
    </ion-card-content>
  </ion-card>
</ion-content>
```

Na inicialização do aplicativo, é necessário estabelecer `LoginPage` como a página inicial, para isso, vá até `app.component.ts` e altere a variável `rootPage`:

```typescript
...
import { LoginPage } from '../pages/login/login';
...
export class MyApp {
  ...
  rootPage: any = LoginPage;
  ...
}
```

Para concluir a rotina de login, devemos adicionar os módulos necessários em `app.module.ts`:

```typescript
...
declarations: [
  ...
  PerfilPage,
  LoginPage
],
imports: [
  ...
  IonicStorageModule.forRoot()
],
bootstrap: [IonicApp],
entryComponents: [
  ...
  PerfilPage,
  LoginPage
],
providers: [
  ...
  AuthProvider,
  GoogleAuthProvider,
  GooglePlus
]
```

Por fim, o aplicativo já pode ser excutado, tanto no navegador quanto em um dispositivo Android, e o login deverá funcionar sem problemas. 

### 3.2. Criando o logout

Para criar a opção de logout, vamos voltar ao `perfil.html` e adicionar um botão:

```html
<ion-content>
  <ion-card>
    <img ... />
    <ion-card-content>
      ...
    </ion-card-content>
    <ion-row no-padding>
      <ion-col text-center>
        <button ion-button clear color="danger" (click)="logout()">
          Sair
        </button>
      </ion-col>
    </ion-row>
  </ion-card>
</ion-content>
```

Em `perfil.ts`, precisamos criar o método `logout()`, que fará a requisição de logout ao `AuthProvider` e redirecionará o app para a página de login novamente.

```typescript
logout() {
  this.auth.logout(res => {
    this.navCtrl.setRoot(LoginPage);
  })
}
```

O `AuthProvider`, por sua vez, irá emcaminhar a requisição ao `GoogleAuthProvider` e resetar as informações do usuário em cache. Para isso, adicione o seguinte método em `auth.ts`:

```typescript
logout(callback) {
  this.googleAuth.logout(res => {
    this.saveUserState(null, null);
    callback(res);
  });
}
```

O `GoogleAuthProvider` fará o logout do usuário no firebase e, se estiver sendo executado em um dispositivo móvel, no plugin do Google Plus. Adicione o seguinte código em `google-auth.ts`:

```typescript
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
```

Com isso, o app estará pronto para fazer login e logout.

### 3.3. Criando a autenticação automática

A autenticação do Google, como a maioria dos métodos de autenticação atuais, funciona por meio de token, o que significa que, uma vez feito o login, o token pode ser frequentemente atualizado para manter a "sessão" do usuário ativa quando necessário. Com isso, enquanto o usuário não fizer o logout, o firebase nos permite autenticar o usuário assim que o app for acessado.

Para fazer isso, vamos criar uma rotina de inicialização no `AuthProvider`. Este método irá obter o `uid` do usuário do `storage` e fazer o procedimento de autenticação semelhante a quando é feito o login. Perceba que este método deve ser inicializado juntamente com o app e, se o usuário tiver feito o logout anteriormente, o `uid` não existirá no `storage` e, consequentemente, a autenticação não será feita. Para criar esta rotina, adicione o método `init()` em `auth.ts`:

```typescript
init(callback) {
  this.getStoredUid().then(storedUid => {
    if (storedUid) {
      this.googleAuth.init(storedUid, 
        res => this.handleGoogleLogin(res, callback)
      );
    } else {
      callback({});
    }
  }).catch(() => {
    callback({});
  })
}
```

Também será necessário criar o método `init()` em `google-auth.ts`:

```typescript
init(uid, callback) {
  this.handleLoginResponse({ 'uid': uid }, callback);
}
```

E, por fim, a inicialização da autenticação deverá ser acionada no `app.component.ts`:

```typescript
...
import { PerfilPage } from '../pages/perfil/perfil';
import { AuthProvider } from '../providers/auth/auth';
...
  this.platform.ready().then(() => {
    ...
    firebase.initializeApp(config.firebase);
    this.auth.init(res => {
      if (this.auth.isSignedIn()) {
        this.rootPage = PerfilPage;
      } else {
        this.rootPage = LoginPage;
      }
      this.splashScreen.hide();
    });
  });
```

Quando o app é iniciado, a rotina de autenticação automática do `AuthProvider` será executada. Então verifica-se se há algum usuário conectado, em caso positivo, será aberta a página de perfil, caso contrário, o usuário será direcionado à página de login.

Para testar esta funcionalidade execute o app, faça o login, feche-o (sem fazer o logout) e abra-o novamente, você verá que a sua conta ainda estará autenticada.
