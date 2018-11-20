import React, { Component } from 'react';
import { Navigation } from './parts/Navigation';
import { Redirect, Link } from 'react-router-dom';
import firebase from 'firebase';
import Select from 'react-select';

import { CardDeck } from 'reactstrap';
import { CandidateCard, Representative } from './Search';

// This is the dashboard of our application
// the authenticated user can navigate through his or her stared representatives
// see details of them and edit the dashboard
export class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            friends: null,
            myReps: null,
            specificMember: null,
            shareFriend: "None",
            shareRepKey: null
        }

        this.propublia = "pO45fUhJpE6AuAW760jMj29gWqNgT2QGV2LcauWE";

        this.setSpecific = this.setSpecific.bind(this);
        this.shareRepKey = this.shareRepKey.bind(this);

        this.userRepRef = firebase.database().ref("UserRepresentative");
        this.repRef = firebase.database().ref("Representative");
        this.userRef = firebase.database().ref("User");
    }


    // search all representatives that he or she shared
    // plus watching whether his or her friends share some representatives
    componentDidMount() {
        if (this.props.user) {
            this.searchReps();
            this.searchFriends();
            this.userRepRef.on('value', () => {
                this.searchReps();
            });
            firebase.database().ref('Friend').on('value', () => {
                this.searchFriends();
            });
        }
    }

    // set the representative key that this user is going to share
    // to the friend
    shareRepKey(repKey) {
        this.setState({
            shareRepKey: repKey
        })
    }

    // search all representatives that he stars
    // plus the representaives that his or her friends 
    // shared 
    searchReps() {
        this.userRepRef.once('value').then((snapshot) => {
            this.repRef.once('value').then((repSnapshot) => {
                this.userRef.once('value').then((userSnapshot) => {
                    let allUserReps = snapshot.val();
                    let allUsers = userSnapshot.val();
                    let result = [];
                    if (allUserReps) {
                        let allReps = repSnapshot.val();
                        Object.keys(allUserReps).forEach((key) => {
                            let currentUserRep = allUserReps[key];
                            if (currentUserRep.user === this.props.user.email) {
                                let targetRep = allReps[currentUserRep.repKey];
                                if (currentUserRep.owner && currentUserRep.owner !== this.props.user.email) {
                                    Object.keys(allUsers).forEach((key) => {
                                        let currentUser = allUsers[key];
                                        if (currentUser.email === currentUserRep.owner) {
                                            targetRep.owner = currentUser.userName;
                                        }
                                    });
                                }
                                result.push(targetRep);
                            }
                        });
                    }
                    this.setState({
                        myReps: result
                    })
                })
            })
        });
    }

    // set up the key of specific member thst user wants to look
    setSpecific(specificMember) {
        this.setState({
            specificMember: specificMember
        })
    }

    // Find all firends of a user
    searchFriends() {
        firebase.database().ref('Friend').once('value').then((snapshot) => {
            let allFriends = snapshot.val();
            let result = [];
            if (allFriends) {
                Object.keys(allFriends).forEach((friend) => {
                    // if first person is the user, add the second person into friend list
                    if (allFriends[friend].person1 === this.props.user.email) {
                        result.push({ email: allFriends[friend].person2, friendKey: friend });

                        // if second person is the user, add the first person into friend list
                    } else if (allFriends[friend].person2 === this.props.user.email) {
                        result.push({ email: allFriends[friend].person1, friendKey: friend });
                    }
                });
            }
            this.setState({
                friends: result
            })
        });
    }

    // find all friends that the user can share about representatives
    setShareFriend(event) {
        if (event) {
            this.setState({
                shareFriend: event.value
            })
        } else {
            this.setState({
                shareFriend: "None"
            })
        }
        this.setState({
            errorMessage: null
        })
    }

    // when the user cancel sharing friends
    // reset all sharing information
    clearShareRecord() {
        this.shareRepKey(null);
        this.setState({
            shareFriend: "None"
        });
    }

    // share given representative to his or her friend
    // or display error message if the friend has stared the representative
    shareRepresentative() {
        this.userRepRef.once('value').then((snapshot) => {
            let allUserReps = snapshot.val();
            let redundant = false;
            Object.keys(allUserReps).forEach((key) => {
                let current = allUserReps[key];
                if (current.user === this.state.shareFriend && current.repKey === this.state.shareRepKey) {
                    redundant = true;
                }
            });
            if (redundant) {
                this.setState({
                    errorMessage: "This user has stared this representative"
                })
            } else {
                let userRep = {
                    user: this.state.shareFriend,
                    repKey: this.state.shareRepKey,
                    timeStamp: firebase.database.ServerValue.TIMESTAMP,
                    owner: this.props.user.email
                }
                this.userRepRef.push(userRep).then(() => {
                    this.clearShareRecord();
                });
            }
        });
    }

    render() {
        // redirect to main page if the user is not authenticated
        if (!this.props.user || this.props.checkAnonymous()) {
            return <Redirect to="/" />
        }
        if (this.state.myReps) {
            if (this.state.friends) {
                let options = [{ value: "None", label: "None" }];
                this.state.friends.forEach((friend) => {
                    options.push({ value: friend.email, label: friend.email });
                });

                // when there is no firend, the confirm button is hided,
                // which means the cancel button shaould at center
                let style = "center";
                if (this.state.friends.length > 0) {
                    style = "space-between";
                }
                return (
                    <div className="app-container">
                        <div className="dashboard-item">
                            <Navigation current="dashboard" user={this.props.user}
                                isAnonymous={this.props.checkAnonymous()}
                                name="Dashboard" />
                        </div>
                        <div className="dashboard-item">
                            <div className="hypnotize dashboard-content-container" >
                                {this.state.myReps.length === 0 &&
                                    // display when the user stars no representative
                                    <div>
                                        <p>Seems like you haven't srared any representatives.</p>
                                        <Link to="/search">Want to star the representative you are concerned about?</Link>
                                    </div>
                                }
                                {(this.state.myReps.length > 0 && !this.state.specificMember && !this.state.shareRepKey) &&
                                    // card deck of all representatives that the user stared
                                    <CardDeck>
                                        {this.state.myReps.map((rep, index) => {
                                            return (
                                                <CandidateCard key={"rep-card-dash-" + index}
                                                    user={this.props.user} isInDashboard={true}
                                                    representative={rep}
                                                    setSpecific={this.setSpecific}
                                                    shareRepKey={this.shareRepKey}
                                                    checkAnonymous={this.props.checkAnonymous} />);
                                        })}
                                    </CardDeck>
                                }
                                {(this.state.myReps.length > 0 && this.state.specificMember && !this.state.shareRepKey) &&
                                    // display when the user want to see the specific information of a representative
                                    <Representative propublia={this.propublia}
                                        user={this.props.user}
                                        member={this.state.specificMember} setSpecific={this.setSpecific}
                                        checkAnonymous={this.props.checkAnonymous} />
                                }
                                {this.state.shareRepKey &&
                                    <div className="share-container" >
                                        {this.state.errorMessage &&
                                            // when there is a error when the user shares a model, display the error
                                            <div className="alert alert-warning">{this.state.errorMessage}</div>
                                        }
                                        <div>
                                            <div>
                                                <h2>{"Share the representative to:"}</h2>
                                            </div>
                                            {this.state.friends.length > 0 &&
                                                <div>
                                                    <Select name="friends"
                                                        value={this.state.shareFriend}
                                                        options={options}
                                                        onChange={(event) => {
                                                            this.setShareFriend(event);
                                                        }} />
                                                </div>
                                            }
                                            {this.state.friends.length === 0 &&
                                                // display when the user wants to share a representative but has no friend
                                                <div>
                                                    <div>Oops, seems like you do not have friend to share.</div>
                                                    <div className="link" >
                                                        <Link style={{ textDecoration: 'none', color: 'black' }} to="/friends">
                                                            Want to share your representative?</Link>
                                                    </div>
                                                </div>
                                            }
                                            <div className="button-container" style={{ justifyContent: style }}>
                                                <div className="share-button">
                                                    <button type="button" className="btn btn-danger" onClick={() => {
                                                        this.clearShareRecord();
                                                    }}>Cancel</button>
                                                </div>

                                                {this.state.friends.length > 0 &&
                                                    // display the confirm button if the user has friend
                                                    // and the button will be diabeld when the user does not select a friend to share the model
                                                    <div className="share-button" >
                                                        <button type="button" className="btn btn-success"
                                                            disabled={this.state.shareFriend === "None"}
                                                            onClick={() => {
                                                                this.shareRepresentative();
                                                            }}
                                                        >Confirm
                                                        </button>
                                                    </div>
                                                }
                                            </div>

                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>);
            } else {
                return (<div>Loading Friends</div>);
            }
        } else {
            return (<div>Loading my representatives</div>);
        }
    }
}