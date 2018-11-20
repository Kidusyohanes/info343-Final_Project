import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

// This is the authentication button
// when a user is authenticated, it will display the log-off button and
// when a user is not authentciated, it will display the log-in button
export class AuthButton extends Component {
    handleSignOut() {
        firebase.auth().signInWithEmailAndPassword("anonymous@a.com", "******");
    }

    render() {
        let button = <div> </div>;
        if (this.props.user && this.props.user.email !== "anonymous@a.com") {
            button = <div className='link log-off'>
                <Link to="/" onClick={() => this.handleSignOut()}
                    style={{ textDecoration: 'none', color: 'white' }}>Log Off</Link>
            </div>
        } else {
            button = <div className='link log-in'>
                <Link to="sign-in" style={{ textDecoration: 'none', color: 'white' }}>Log In</Link>
            </div>
        }
        return (button);
    }
}
