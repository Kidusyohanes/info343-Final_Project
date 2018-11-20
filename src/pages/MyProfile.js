import React, { Component } from 'react';

import { Redirect } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import firebase from 'firebase';

import { Navigation } from './parts/Navigation';

// This is the system where users can freely 
// change their names and profile images in this application

// Note: this profile system works directly with firebase database
//       and it does not affect those information in firebase authentication
//       due to some complicated reasons, this is the best choice
export class MyProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            loadingProfile: false,
            profile: null,

            editMode: false,
            image: null,
            text: "Please drop your profile image (.png)",
            newUserName: "",
            success: " default"
        }

        this.userRef = firebase.database().ref("User");
    }

    // Search the user profile information in database
    componentDidMount() {
        if (this.props.user && !this.props.checkAnonymous()) {
            this.searchUser();
        }
    }

    // this method will search the name and the profile image information
    // in the database.
    searchUser() {
        this.userRef.once('value').then((snapshot) => {
            let allUsers = snapshot.val();
            let user = null;
            Object.keys(allUsers).forEach((key) => {
                let currentUser = allUsers[key];
                if (currentUser.email === this.props.user.email) {
                    user = currentUser;
                }
            });
            this.setState({
                user: user
            })
            if (user.profile) {
                firebase.storage().ref().child(user.profile).getDownloadURL().then((snapshot) => {
                    this.setState({
                        profile: snapshot,
                        loadingProfile: true
                    })
                });
            } else {
                this.setState({
                    loadingProfile: true
                })
            }
        });
    }

    // this method will initialize the process of uploading new information
    // about user profile
    initialize() {
        this.setState({
            editMode: false,
            image: null,
            text: "Please drop your profile image (.png)",
            newUserName: "",
            success: " default"
        })
    }

    // This method will upload the new user profile information
    // it will only upload the name if the user gives some text
    // and when uploading image, it will first search the firebase stroage
    // and then delete the previous profile image, and then upload the new image
    uploadProfile() {
        this.userRef.once('value').then((snapshot) => {
            console.log(this.state.image);
            let previousDir = null;
            let allUsers = snapshot.val();
            let userKey = null;
            let userContent = null;
            Object.keys(allUsers).forEach((key) => {
                let current = allUsers[key];
                if (current.email === this.props.user.email) {
                    userKey = key;
                    userContent = current;
                    if (current.profile) {
                        previousDir = current.profile;
                    }
                }
            });

            let userDir = "User/" + userKey;
            if (this.state.newUserName.length > 0) {
                userContent["userName"] = this.state.newUserName;
            }
            if (this.state.image) {
                if (userContent["profile"]) {
                    previousDir = userContent["profile"];
                }
                userContent["profile"] = this.props.user.email + "/profile/" + this.state.image.name;
            }

            // set up the new profile information in database
            firebase.database().ref(userDir).set(userContent).then(() => {
                if (this.state.image) {
                    let newImageDir = this.props.user.email + "/profile/" + this.state.image.name;
                    if (previousDir) {
                        // remove the previous profile image in database
                        firebase.storage().ref().child(previousDir).delete().then(() => {

                            // upload the new profile image
                            firebase.storage().ref().child(newImageDir).put(this.state.image).then((snapshot) => {
                                this.setState({
                                    editMode: false,
                                    image: null,
                                    profile: snapshot.downloadURL
                                });
                                this.searchUser(false);
                            });
                        });
                    } else {
                        // upload the nre profile image
                        firebase.storage().ref().child(newImageDir).put(this.state.image).then((snapshot) => {
                            this.setState({
                                editMode: false,
                                image: null,
                                profile: snapshot.downloadURL
                            });
                            this.searchUser(false);
                        });
                    }
                } else {
                    // reset the edit mode
                    this.setState({
                        editMode: false,
                        image: null,
                        text: "Please drop your profile image (.png)",
                        newUserName: "",
                        success: " default"
                    })
                    this.searchUser(false);
                }
            });
        });
    }


    // a file upload method which has some basic error handlers
    // 1: reject multiple profile images upload
    // 2: reject upload profile image in different extension
    // and then give the user about the error message
    onDrop(files) {
        let file = null;
        let text = "Uploading: ";
        let success = " default";
        if (files.length !== 1) {
            if (files.length === 0) {
                text = "Upload file is not .png file"
            } else {
                text = "Upload to much files"
            }
            success = " fail";
        } else {
            file = files[0];
            text += file.name;
            success = " success";
        }
        this.setState({
            image: file,
            text: text,
            success: success
        })
    }

    render() {
        if (!this.props.user || this.props.checkAnonymous()) {
            return <Redirect to="/" />
        }
        if (this.state.user && this.state.loadingProfile) {
            let photo = "imgs/user.png";
            if (this.state.profile) {
                photo = this.state.profile;
            }
            return (
                <div className="app-container">
                    <Navigation user={this.props.user} isAnonymous={this.props.checkAnonymous()}
                        name="Profile" current="profile" />
                    <div>
                        <div className="profile">
                            {!this.state.editMode &&
                                // user profile preview mode
                                <div className="user-profile hypnotize">
                                    <div className="avatar" >
                                        <img src={photo} alt="User's Profile" />
                                    </div>
                                    <h2>Name: <strong>{this.state.user.userName}</strong></h2>
                                    <h2>Email: <strong>{this.state.user.email}</strong></h2>
                                    <button className="btn btn-primary mr-2" onClick={() => {
                                        this.setState({
                                            editMode: true
                                        })
                                    }}>Edit</button>
                                </div>
                            }
                            {this.state.editMode &&
                                // user profile edit mode
                                <div className="user-profile hypnotize">
                                    <h2>Edit Profile</h2>
                                    <Dropzone className={"dropzone-container" + this.state.success}
                                        onDrop={(files) => this.onDrop(files)} accept="image/png">
                                        <div className={"dropzone-item"}>
                                            <p>{this.state.text}</p>
                                        </div>
                                    </Dropzone>

                                    <div className="new-user-name">
                                        <h3>New username?</h3>
                                        <input className="form-control"
                                            name="username"
                                            value={this.state.newUserName}
                                            onChange={(event) => {
                                                this.setState({
                                                    newUserName: event.target.value
                                                })
                                            }}
                                            placeholder="Empty means no change" />
                                    </div>

                                    <div className="button-container">
                                        <button className="btn btn-danger mr-2" onClick={() => {
                                            this.initialize();
                                        }}>Cancel</button>

                                        <button disabled={!this.state.image && this.state.newUserName.length === 0}
                                            className="btn btn-success mr-2" onClick={() => {
                                                this.uploadProfile();
                                            }}>Confirm</button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            );
        } else {
            return (<div>Loading Profile</div>);
        }
    }
}
