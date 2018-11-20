import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import firebase from 'firebase';

export class SignIn extends Component {
    constructor(props) {
        super(props)
        this.state = {
            disabled: true,
            email: '',
            password: ''
        };
    }

    // when the email is not well formatted, it will give email input box warning color
    // when the email is well formatted, it will give emaol input box success color
    // when there is no input, it will give email input box no notification color 
    getEmailStatus() {
        if (this.state.email.length > 0) {
            let split = this.state.email.split("@");
            if (split.length === 2 && this.state.email !== "anonymous@a.com") {
                let last = split[1].split(".");
                if (last.length >= 2) {
                    let suffix = last[last.length - 1];
                    if (suffix === "com" || suffix === "edu" || suffix === "gov" || suffix === "org") {
                        return (" alert alert-success");
                    }
                }
            }
            return (" alert alert-warning");
        } else {
            return ("");
        }
    }

    // give the password input box danger color if the length is less than 6
    // give the password input box success color if the length is greater than 6
    // and give the password input box no extra color if there is no imput
    getPasswordStatus() {
        if (this.state.password.length > 0) {
            if (this.state.password.length < 6) {
                return (" alert alert-warning");
            } else {
                return (" alert alert-success");
            }
        } else {
            return ("");
        }
    }

    // tried to sign in with current email and password
    // and save the error message if error occurs
    handleSignIn() {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch((error) => {
            this.setState({
                errorMessage: error.message
            })
        });
    }

    // when the user types password or email
    // it will record the input into state
    // and clear the error message
    handleChange(event) {
        let value = event.target.value;
        let fieid = event.target.name;
        let change = this.state;
        change[fieid] = value;
        change.errorMessage = null;
        change.disabled = this.getPasswordStatus() !== " alert alert-success" ||
            this.getEmailStatus() !== " alert alert-success";
        this.setState(change);
    }

    render() {
        if (this.props.user && !this.props.checkAnonymous()) {
            return <Redirect to='/dashboard' />;
        }
        if (this.state.redirect) {
            return <Redirect to='/' />
        }
        return (
            <div className="log-in-container">
                <div className="hypnotize log-in-content" >
                    <div className="log-in-item"><h1>Log In</h1></div>
                    {this.state.errorMessage &&
                        <div><p className="alert alert-warning">{this.state.errorMessage}</p></div>
                    }
                    <div className="log-in-item">
                        <h2> Email</h2>
                        <div className={"form-group" + this.getEmailStatus()}>
                            <input className="form-control"
                                name="email"
                                value={this.state.email}
                                onChange={(event) => { this.handleChange(event) }}
                                placeholder="Example: JohnSmith@gmail.com" />
                        </div>
                    </div>

                    <div className="log-in-item">
                        <h2>Password</h2>
                        <div className={"form-group" + this.getPasswordStatus()}>
                            <input type="password" className="form-control"
                                name="password"
                                value={this.state.password}
                                onChange={(event) => { this.handleChange(event) }} />
                        </div>
                    </div>

                    <div className="log-in-item button-container">
                        <div>
                            <button className="btn btn-danger mr-2" onClick={() => this.setState({ redirect: true })}>
                                Cancel
                            </button>
                        </div>

                        <div>
                            <button className="btn btn-primary mr-2"
                                onClick={() => this.handleSignIn()} disabled={this.state.disabled}>
                                Log In
                            </button>
                        </div>
                    </div>

                    <div className="log-in-item">
                        <Link to="/sign-up">No account? Start your journey today!</Link>
                    </div>
                </div>
            </div>
        );
    }
}