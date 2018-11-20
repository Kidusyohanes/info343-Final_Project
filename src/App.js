import React, { Component } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import firebase from 'firebase';
import '../node_modules/font-awesome/css/font-awesome.min.css';

import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { MainPage } from './pages/Mainpage';
import { Dashboard } from './pages/Dashboard';
import { Friends } from './pages/Friends';
import { AboutUS } from './pages/AboutUS';
import { Search } from './pages/Search';
import { MyProfile } from './pages/MyProfile';
import { Disclaimer } from './pages/parts/Disclaimer';


// This application is a platform where each users can focus on their representatives
// and rate them based on performance
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null
        }

        // handleSignUp will pass into SignUp page to keep track
        // of updating user status.
        this.handleSignUp = this.handleSignUp.bind(this);
        this.checkAnonymous = this.checkAnonymous.bind(this);
    }

    componentDidMount() {
        // listen the change of user in firebase and upload the corresponding user status
        this.stopWatchingAuth = firebase.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser) {
                this.setState({
                    user: firebaseUser
                })
            } else {
                // a fake account that specifically for anonymous sign in
                // since anoymous sign in will create numerous zombie accounts
                // this is the clean way to sign in anonymously
                firebase.auth().signInWithEmailAndPassword("anonymous@a.com", "******");
            }
        });
    }

    checkAnonymous() {
        if (this.state.user) {
            return this.state.user.email === "anonymous@a.com";
        }
        return true;
    }


    // This method will create an account into authentication page
    // plus add the user information into database
    // user data: 
    // name: username
    // email: email that the user used for signing up
    // ceateDate: a date value indicates when the account is created
    handleSignUp(email, password, username, callback) {
        firebase.auth().createUserWithEmailAndPassword(email, password).then(
            firebaseUser => {
                return firebaseUser.updateProfile({
                    displayName: username
                })
            }
        ).then(
            firebaseUser => {
                this.setState({
                    user: firebase.auth().currentUser
                });
                let name = this.state.user.displayName;
                let email = this.state.user.email;
                let createDate = this.state.user.metadata.creationTime;
                let user = {
                    userName: name,
                    email: email,
                    createDate: createDate
                };
                firebase.database().ref('User').push(user).then((snapshot) => {
                    console.log("Uploaded");
                });
            }).catch(error => callback(error.message));
    }

    render() {
        return (
            <Router>
                <div className="app-wrapper">
                    <Switch>
                        <Route exact path='/' render={(routerProps) => {
                            return <MainPage {...routerProps}
                                user={this.state.user}
                                checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/sign-up' render={(routerProps) => {
                            return <SignUp {...routerProps} user={this.state.user}
                                handleSignUp={this.handleSignUp}
                                checkAnonymous={this.checkAnonymous} />
                        }} />
                        <Route path='/sign-in' render={(routerProps) => {
                            return <SignIn {...routerProps} user={this.state.user}
                                checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/dashboard' render={(routerProps) => {
                            return <Dashboard {...routerProps} user={this.state.user}
                                checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/search' render={(routerProps) => {
                            return <Search {...routerProps} user={this.state.user} checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/myprofile' render={(routerProps) => {
                            return <MyProfile {...routerProps} user={this.state.user} checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/friends' render={(routerProps) => {
                            return <Friends {...routerProps} user={this.state.user} checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/profile' render={(routerProps) => {
                            return <MyProfile {...routerProps} user={this.state.user} checkAnonymous={this.checkAnonymous} />
                        }} />

                        <Route path='/about' render={(routerProps) => {
                            return <AboutUS {...routerProps} user={this.state.user} checkAnonymous={this.checkAnonymous} />
                        }} />
                    </Switch>
                    <Disclaimer />
                </div>
            </Router>
        );
    }
}

export default App;
