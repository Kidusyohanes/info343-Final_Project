import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import firebase from 'firebase';

import 'bootstrap/dist/css/bootstrap.css';
import './index.css';


let config = {
    apiKey: "AIzaSyDxYQEr3uJw11iPlmRDeM0BxTHC__XQoeE",
    authDomain: "rate-my-candidate.firebaseapp.com",
    databaseURL: "https://rate-my-candidate.firebaseio.com",
    projectId: "rate-my-candidate",
    storageBucket: "rate-my-candidate.appspot.com",
    messagingSenderId: "52499765236"
};

firebase.initializeApp(config);

ReactDOM.render(<App />, document.getElementById('root'));
