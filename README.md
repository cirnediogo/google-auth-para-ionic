Tut: https://www.joshmorony.com/implementing-google-plus-sign-in-with-oauth-2-0-in-ionic-2/

    keytool -genkey -v -keystore release.keystore -alias releasekey -keyalg RSA -keysize 2048 -validity 10000
    
    keytool -exportcert -list -v -alias releasekey -keystore release.keystore

Adicionar o Firebase ao seu app

    npm install firebase --save

Obter configurações do firebase:

    var config = {
    apiKey: "<API_KEY>",
    authDomain: "<PROJECT_ID>.firebaseapp.com",
    databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
    storageBucket: "<BUCKET>.appspot.com",
    };

Criar arquivos project-specific-config.json e typings.d.ts.
<!-- 
Instalar Angular Fire:

    npm install angularfire2 --save 
-->

Adicionar ao app.component.ts:

    import * as firebase from 'firebase';
    import config from '../project-specific-config.json';

    firebase.initializeApp(config.firebase);

Criar arquivo debug-signing.properties em platforms/android:

    keyAlias=releasekey
    keyPassword=<KEYSTORE_PASSWORD>
    storeFile=release.keystore
    storePassword=<KEYSTORE_PASSWORD>

Atualizar o cordova:

    ionic cordova prepare