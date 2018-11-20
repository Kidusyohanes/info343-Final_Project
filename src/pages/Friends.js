import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import firebase from 'firebase';
import 'react-select/dist/react-select.css';
import { Navigation } from './parts/Navigation';

// npm recommendation way to import FontAwesome
var FontAwesome = require('react-fontawesome');

// This is a friend page and firend system where
// a user can find, send friend request, receive friends info,
// and add friends in this page.
export class Friends extends Component {

    constructor(props) {
        super(props);
        this.state = {
            friends: null,
            friendsRequest: null,
            request: "",
            requestsInfo: null
        }
        this.setAttribute = this.setAttribute.bind(this);
    }


    // reser the field in state by given value
    setAttribute(field, value) {
        let currentState = this.state;
        currentState[field] = value;
        this.setState(currentState);
    }

    componentDidMount() {
        if (this.props.user) {
            this.searchFriends();
            this.findFirendsInfo();
            this.searchRequests();

            // listen change when someone sent a friend request
            firebase.database().ref("FriendRequest").on('value', () => {
                this.searchRequests();
            });

            // listen change when someone becomes one's friend
            firebase.database().ref('Friend').on('value', () => {
                this.searchFriends();
            });

            // listen change when someone gets a friend info notification
            firebase.database().ref("FriendInfo").on('value', () => {
                this.findFirendsInfo();
            });
        }
    }

    // this method will search all friends requests which target to current user
    searchRequests() {
        firebase.database().ref("FriendRequest").once('value').then((snapshot) => {
            let allRequests = snapshot.val();
            let result = [];
            if (allRequests) {
                Object.keys(allRequests).forEach((requestKey) => {
                    let currentRequest = allRequests[requestKey];
                    if (currentRequest.target === this.props.user.email) {
                        result.push({ email: currentRequest.email, requestKey: requestKey });
                    }
                });
            }
            this.setState({
                friendsRequest: result
            })
        });
    }

    // before the user sends the firend request, this method will check 
    // 1/ whether the email is in valid format
    // 2/ whether the user tries to send friend request to his or her friends and
    // 3/ whether the user tries to send friend request to himself or herself
    // if one of the situation happens, it will return true
    // and disable the confirm button
    findRedundantRequest() {
        let disable = true;
        if (this.getEmailStatus()) {
            let foundRedundant = false;
            this.state.friends.forEach((friend) => {
                if (friend.email === this.state.request) {
                    foundRedundant = true;
                }
            });
            disable = foundRedundant || this.state.request === this.props.user.email;
        }
        return (disable);
    }

    // this method will check whether current friend request is a well-formated email or not
    // and return true if it is a valid email format
    // plus, anoymous@a.com is also not valud
    getEmailStatus() {
        if (this.state.request.length > 0 && this.state.request !== "anonymous@a.com") {
            let split = this.state.request.split("@");
            if (split.length === 2) {
                let last = split[1].split(".");
                if (last.length >= 2) {
                    let suffix = last[last.length - 1];
                    return suffix === "com" || suffix === "edu" || suffix === "gov" || suffix === "org";
                }
            }
        } else {
            return false;
        }
    }

    // this method can search all friends corresponds with this user
    searchFriends() {
        firebase.database().ref('Friend').once('value').then((snapshot) => {
            let allFriends = snapshot.val();
            let result = [];
            if (allFriends) {
                Object.keys(allFriends).forEach((friend) => {
                    if (allFriends[friend].person1 === this.props.user.email) {
                        result.push({ email: allFriends[friend].person2, friendKey: friend });
                    } else if (allFriends[friend].person2 === this.props.user.email) {
                        result.push({ email: allFriends[friend].person1, friendKey: friend });
                    }
                });
            }
            this.setAttribute("friends", result);
        });
    }

    // when an user tries to send a friend request which is internally passed
    // it will first search whether the user has sent the request to the same user
    // if the request has been sent, it will stop sending request and notify the user
    // that he or she has sent the request
    // if not, then it will search for whether this user exists in the database
    // if the user does not exist, then it will stop sending request and notify the user
    // that the user/email does not exist
    // if the user exists, then it will send the friend request into the database
    sendFriendsRequest(targetEmail) {
        firebase.database().ref('User').once('value').then((snapshot) => {
            let allUsers = snapshot.val();
            let requestInfo = "";
            let type = "error";
            firebase.database().ref("FriendRequest").once('value').then((snapshot) => {
                let allRequests = snapshot.val();
                let existingRequest = null;
                if (allRequests) {
                    Object.keys(allRequests).forEach((request) => {
                        let currentRequest = allRequests[request];
                        if (currentRequest.email === this.props.user.email && currentRequest.target === targetEmail) {
                            existingRequest = currentRequest;
                        }
                    });
                }
                if (existingRequest) {
                    requestInfo = "You have sent the request";
                } else {
                    // although when a user sends a request, there must exist at least one user in database
                    // it will always be safe to check whether this directory exists
                    // (for example, unnaturally delete data by the admin)
                    if (allUsers) {
                        let targetUserEmail = null;

                        Object.keys(allUsers).forEach((user) => {
                            if (allUsers[user].email === targetEmail) {
                                targetUserEmail = allUsers[user].email
                            }
                        });
                        if (targetUserEmail) {
                            requestInfo = "Send request to " + targetUserEmail;
                            type = "success";
                            firebase.database().ref("FriendRequest").push({
                                email: this.props.user.email,
                                target: targetEmail,
                                timeStamp: firebase.database.ServerValue.TIMESTAMP
                            })
                        } else {
                            requestInfo = targetEmail + " does not exist";
                        }
                    } else {
                        requestInfo = targetEmail + " does not exist";
                    }
                }
                this.setState({
                    request: ''
                })
                firebase.database().ref("FriendInfo").push({
                    email: this.props.user.email,
                    requestInfo: requestInfo,
                    type: type,
                    timeStamp: firebase.database.ServerValue.TIMESTAMP
                });
            });
        });
    }

    // it will search all friends info(request notification, friend request error, etc)
    // corresponds to this user
    findFirendsInfo() {
        firebase.database().ref("FriendInfo").once('value').then((snapshot) => {
            let result = [];
            let allInfos = snapshot.val();
            if (allInfos) {
                Object.keys(allInfos).forEach((info) => {
                    let current = allInfos[info];
                    if (current.email === this.props.user.email) {
                        result.push({
                            info: current.requestInfo,
                            time: current.timeStamp,
                            type: current.type,
                            infoKey: info
                        });
                    }
                });
            }
            this.setAttribute("requestsInfo", result);
        });
    }

    // this method will check whether the directory exists in firebase
    // and if it exists, then remove its data
    removeItem(ref, key) {
        firebase.database().ref(ref).once('value').then((snapshot) => {
            let allInfos = snapshot.val();
            if (allInfos) {
                firebase.database().ref(ref + "/" + key).remove();
            }
        });
    }

    // this method will register current user and target email as friends
    // and then send a notification to the friend(not the current user) that
    // he or she becomes a friend to current user.
    acceptFriendRequest(friendEmail, requestID) {
        let friendData = {
            person1: this.props.user.email,
            person2: friendEmail,
            timeStamp: firebase.database.ServerValue.TIMESTAMP
        };

        firebase.database().ref('Friend').push(friendData).then((snapshot) => {
            let friendInfo = {
                email: friendEmail,
                requestInfo: this.props.user.email + " is now your friend",
                type: "success",
                timeStamp: firebase.database.ServerValue.TIMESTAMP
            }
            firebase.database().ref("FriendInfo").push(friendInfo).then(() => {
                this.removeItem("FriendRequest", requestID);
            });
        });
    }

    // this method will reject a friend request, then then sent a notification
    // to the requester that he or she's request is rejected
    rejectFriendRequest(friendEmail, requestID) {
        let friendInfo = {
            email: friendEmail,
            requestInfo: this.props.user.email + " rejects your request",
            type: "error",
            timeStamp: firebase.database.ServerValue.TIMESTAMP
        }
        firebase.database().ref("FriendInfo").push(friendInfo).then(() => {
            this.removeItem("FriendRequest", requestID, () => {
                console.log("removed");
            });
        });
    }

    // this method will delete the friend relationship between two users
    // and then sends a notifictaion to the friend(not current user) that
    // he or she is no loger a friend with current user
    removeFriend(friendEmail, friendID) {
        let friendInfo = {
            email: friendEmail,
            requestInfo: this.props.user.email + " is no longer your friend",
            type: "error",
            timeStamp: firebase.database.ServerValue.TIMESTAMP
        }
        firebase.database().ref("FriendInfo").push(friendInfo).then(() => {
            this.removeItem("Friend", friendID);
        });
    }

    render() {
        if (!this.props.user || this.props.checkAnonymous()) {
            return <Redirect to="/" />;
        }
        return (
            <div className="app-container">
                <Navigation user={this.props.user} isAnonymous={this.props.checkAnonymous()}
                    name="Friend" current="friends" />
                <div>
                    {(!this.state.friends || !this.state.requestsInfo || !this.state.friendsRequest) &&
                        // display it when the page is loading friends information
                        <div>Loading Friends</div>
                    }
                    {(this.state.friends && this.state.requestsInfo && this.state.friendsRequest) &&
                        <div className="friends-container">
                            <div className="friends-item request-container hypnotize">
                                <div><h2>Requests by Email</h2></div>
                                <div className="request-item top-request-container">
                                    <div className="top-request-item">
                                        <input className="form-control"
                                            value={this.state.request}
                                            placeholder="enter email"
                                            onChange={(event) => {
                                                this.setAttribute("request", event.target.value);
                                            }} />
                                    </div>

                                    <div className="top-request-item">
                                        <button className="btn btn-primary mr-2"
                                            disabled={this.findRedundantRequest()}
                                            onClick={() => this.sendFriendsRequest(this.state.request)}>
                                            Request
                                        </button>
                                    </div>
                                </div>
                                {this.state.friendsRequest.length === 0 &&
                                    <div>No Request</div>
                                }
                                {this.state.friendsRequest.length > 0 &&
                                    this.state.friendsRequest.map((request, index) => {
                                        return (
                                            <div key={"request-" + index} className="alert alert-info request-piece-container" >
                                                <div className="request-piece" onClick={() => {
                                                    // after clicking the button, a user becomes a friend of the requester
                                                    this.acceptFriendRequest(request.email, request.requestKey);
                                                }}>
                                                    <FontAwesome name="fas fa-check" />
                                                </div>

                                                <div className="request-piece">{request.email}</div>

                                                <div className="request-piece" onClick={() => {
                                                    // after clicking it, a user can reject a friend request
                                                    this.rejectFriendRequest(request.email, request.requestKey);
                                                }}>
                                                    <FontAwesome name="fas fa-times" />
                                                </div>
                                            </div>)
                                    })
                                }
                            </div>

                            <div className="friends-item all-friends-container hypnotize">
                                <div><h2>Friends</h2></div>
                                {this.state.friends.length === 0 &&
                                    // in future, it will have friends suggestion
                                    <div>No Friends</div>
                                }
                                {this.state.friends.length > 0 &&
                                    this.state.friends.map((friend, index) => {
                                        return (
                                            <div className="bg-success friend-piece-container" key={"friend-" + index}>
                                                <div className="friend-piece" style={{
                                                    color: "white"
                                                }}>{friend.email}</div>
                                                <div className="friend-piece" onClick={() => {
                                                    // by clicking this button, a user can delete a friend
                                                    this.removeFriend(friend.email, friend.friendKey);
                                                }}>
                                                    <FontAwesome inverse name="fas fa-times" />
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>

                            <div className="friends-item info-container hypnotize">
                                <div className="info-item info-title"><h2>Infos</h2></div>
                                {this.state.requestsInfo.length > 0 &&
                                    this.state.requestsInfo.map((request, index) => {
                                        let information = request.info;
                                        let style = " alert alert-success";
                                        if (request.type === "error") {
                                            style = " alert alert-warning";
                                        }
                                        return (
                                            <div className={"info-item info-piece-container" + style} key={"request-info-" + index}>
                                                <div className="info-piece">{information}</div>
                                                <div className="info-piece" onClick={() =>
                                                    // by clicking this button, the user can remove this friend notification
                                                    this.removeItem("FriendInfo", request.infoKey)
                                                } >
                                                    <FontAwesome name="fas fa-times" />
                                                </div>
                                            </div>)
                                    })
                                }
                                {this.state.requestsInfo.length === 0 &&
                                    <div className="info-item">No Info</div>
                                }
                            </div>
                        </div>}
                </div>
            </div>
        );
    }
}