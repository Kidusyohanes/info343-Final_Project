import React, { Component } from 'react';
import Select from 'react-select';
import { Redirect } from 'react-router-dom';
import 'react-select/dist/react-select.css';
import { Row, Col, Card, CardImg, CardBody, CardTitle, CardSubtitle, CardDeck, CardText } from 'reactstrap';

import firebase from 'firebase';

import states from './parts/States';
import distircts from './parts/distircts';

import { Navigation } from './parts/Navigation';



var FontAwesome = require('react-fontawesome');

// This is the system of searching and displaying relative
// information about representatives
export class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            state: "Alabama",
            chamber: "senate",
            distirct: "All",
            search: false
        }

        this.options = [];
        Object.keys(states).forEach((state) => {
            this.options.push({ value: state, label: state });
        });

        this.sortedDistircts = distircts;
        Object.keys(this.sortedDistircts).forEach((distirct) => {
            let currentList = this.sortedDistircts[distirct];
            currentList.sort((a, b) => { return a - b });
            this.sortedDistircts[distirct] = currentList;
        });

        // places in the US that does not have senate
        this.noSenate = ["American Samoa", "District Of Columbia", "Northern Mariana Islands",
            "Virgin Islands", "Puerto Rico", "Guam", "Northern Mariana Islands"];

        // state where district is large
        this.largeStates = ["Alaska", "Delaware", "Montana", "North Dakota", "South Dakota", "Vermont", "Wyoming"];

        this.setField = this.setField.bind(this);
    }

    // set up the field of the state with given value
    setField(field, value) {
        let currentState = this.state;
        currentState[field] = value;
        this.setState(currentState);
    }


    render() {
        // user can still search candidate even though he or she is not a registered user
        if (this.state.cancelRedirect) {
            if (this.props.user && !this.props.checkAnonymous()) {
                return <Redirect to="/dashboard" />;
            } else {
                return <Redirect to="/" />;
            }
        }
        let stateAbbr = states[this.state.state];

        // find all possible distircts number
        // if the place is with no senate or state with large district
        // then the distirct number will be only 1
        let distirctOptions = [{ label: "All Distircts", value: "All" }];
        if (!this.noSenate.includes(this.state.state) && !this.largeStates.includes(this.state.state)) {
            let allDistirctNumbers = this.sortedDistircts[stateAbbr];
            allDistirctNumbers.forEach((number) => {
                distirctOptions.push({ label: number, value: number });
            });
        } else {
            distirctOptions.push({ label: 1, value: 1 });
        }
        return (
            <div className="app-container">
                <div className="search-container">
                    <Navigation user={this.props.user} isAnonymous={this.props.checkAnonymous()} name="Search" current="search" />

                    {!this.state.search &&
                        // the interface for a user to search representatives information
                        // based on states and distirct numbers
                        <div className="search-rep-container hypnotize" >
                            <div>
                                <div className="search-item">
                                    <h2>State</h2>
                                    <Select name="state"
                                        options={this.options}
                                        value={this.state.state}
                                        onChange={(event) => {
                                            if (event) {
                                                this.setField("state", event.value);
                                            } else {
                                                this.setField("state", "Alabama");
                                            }
                                            if (this.noSenate.includes(this.state.state)) {
                                                this.setState({
                                                    chamber: "house",
                                                })
                                            } else {
                                                this.setState({
                                                    chamber: "senate",
                                                })
                                            }
                                            this.setState({
                                                distirct: "All"
                                            })
                                        }} />
                                </div>

                                <div>
                                    <h2>Chamber</h2>
                                    <Select name="chamber"
                                        value={this.state.chamber}
                                        options={[{ value: "senate", label: "Senate", disabled: this.noSenate.includes(this.state.state) },
                                        { value: "house", label: "House" }]}
                                        onChange={(event) => {
                                            if (event) {
                                                this.setField("chamber", event.value);
                                            } else {
                                                // if a place has no senate
                                                // option will be limited in house
                                                if (this.noSenate.includes(this.state.state)) {
                                                    this.setField("chamber", "house");
                                                } else {
                                                    this.setField("chamber", "senate");
                                                }
                                            }
                                        }} />
                                </div>

                                <div className="search-item">
                                    <h2>District Number(Optional)</h2>
                                    <Select name="distirct"
                                        disabled={this.state.chamber === "senate"}
                                        options={distirctOptions}
                                        value={this.state.distirct}
                                        onChange={(event) => {
                                            if (event) {
                                                this.setField("distirct", event.value);
                                            } else {
                                                this.setField("distirct", "All");
                                            }
                                        }} />
                                </div>

                                <div className="button-container" >
                                    <div>
                                        <button className="button-item btn btn-danger" onClick={() => {
                                            this.setState({
                                                cancelRedirect: true
                                            })
                                        }} >Cancel</button>
                                    </div>

                                    <div>
                                        <button className="button-item btn btn-primary" onClick={() => {
                                            this.setState({
                                                state: "Alabama",
                                                chamber: "senate",
                                                distirct: 1
                                            })
                                            this.setField("search", true);
                                        }} >Search</button>
                                    </div>
                                </div>
                            </div>

                            <div className="note">
                                For states with at-large districts (Alaska, Delaware, Montana, North Dakota, South Dakota, Vermont, Wyoming),
                                and territories with no senate (American Samoa, District of Columbia,
                                Northern Mariana Islands, Virgin Islands) the district number for House is 1.
                            </div>
                        </div>}
                    {this.state.search &&
                        // display the result of representative search
                        <AllCandidate setField={this.setField}
                            state={stateAbbr} distirct={this.state.distirct}
                            user={this.props.user}
                            checkAnonymous={this.props.checkAnonymous} />
                    }
                </div>
            </div >);

    }
}


// this is the place to display all representatives in
// user's choice of state and district numbers
class AllCandidate extends Component {
    constructor(props) {
        super(props);
        this.propublia = "pO45fUhJpE6AuAW760jMj29gWqNgT2QGV2LcauWE";
        this.state = {
            representatives: null,
            error: null,
            specificMember: null
        }
        this.setSpecific = this.setSpecific.bind(this);
    }

    // get all senators data
    componentDidMount() {
        this.getSenateData();
    }


    // set up the specific representative that the user is interested in
    setSpecific(specificMember) {
        this.setState({
            specificMember: specificMember
        })
    }

    // search the senator's data about
    // his or her basic information in propublica API
    getSenateData() {
        let chamber = "senate";
        let distirct = "";
        let state = this.state;
        if (state === "DC") {
            state = "District of Columbia"
        }
        if (this.props.distirct !== "None") {
            chamber = "house";
            if (this.props.distirct !== "All") {
                distirct = "/" + this.props.distirct;
            }
        }
        let url = "https://api.propublica.org/congress/v1/members/" + chamber + "/" + this.props.state + distirct + "/current.json";

        // collect all senators in a specific place(state, and distirct number)
        fetch(url, {
            type: "GET",
            dataType: 'json',
            headers: { 'X-API-Key': this.propublia }
        }).then((response) => {
            return response.json();
        }).then((response) => {
            let results = [];
            response.results.forEach((representative) => {
                results.push({
                    name: representative.name,
                    id: representative.id,
                    party: representative.party
                });
            })
            this.setState({
                representatives: results
            })
        }).catch((error) => {
            this.setState({
                error: error.message
            })
        });
    }


    render() {
        if (this.state.representatives) {
            return (
                <div className="search-result-container hypnotize">
                    {this.state.error &&
                        <div>Oops!</div>
                    }
                    <div className="button-container search-buttons">
                        <button className="button-item btn btn-danger" onClick={() => {
                            this.props.setField("cancelRedirect", true);
                        }} >Back</button>
                        <button className="button-item btn btn-primary" onClick={() => {
                            this.props.setField("search", null);
                        }}>Need More?</button>
                    </div>
                    {(!this.state.error && !this.state.specificMember) &&
                        // card deck of representatives which are in user's interests of states and district numbers
                        <CardDeck>
                            {this.state.representatives.map((representative, index) => {
                                return <CandidateCard key={"rep-card-" + index} user={this.props.user} isInDashboard={false}
                                    representative={representative}
                                    setSpecific={this.setSpecific}
                                    checkAnonymous={this.props.checkAnonymous} />
                            })}
                        </CardDeck>
                    }
                    {(!this.state.error && this.state.specificMember) &&
                        // the specific representative that the user is interested in
                        <Representative propublia={this.propublia}
                            user={this.props.user}
                            member={this.state.specificMember}
                            setSpecific={this.setSpecific}
                            checkAnonymous={this.props.checkAnonymous} />
                    }
                </div>
            );
        } else {
            return (<div>Searching...</div>);
        }
    }
}

// this is a card that represents some basic information about a representative
// information displays
// 1: name
// 2: party
// 3: average rating by users in Rate My Representative
// plus provides some basic functionaility to share/ remove/ see specific details of the pepresentative
export class CandidateCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stared: null,
            userRepKey: null,
            userRepInitialized: false,
            avgInitialized: false
        }
        this.userRepRef = firebase.database().ref("UserRepresentative");
        this.repRef = firebase.database().ref("Representative");
        this.commentRef = firebase.database().ref("Comment");
    }


    // search representatives and its rating
    // while changing the data to display
    // once those data are changed
    // (userrep is handled by its own star algorithm so it does not need to listen)
    componentDidMount() {
        this.searchUserRep();
        this.searchAvgRating();

        this.commentRef.on('value', () => {
            this.searchAvgRating();
        });
    }

    // search whether current user is starring this representative
    // and then initialize the card
    searchUserRep() {
        if (this.props.user && !this.props.checkAnonymous()) {
            this.userRepRef.once('value').then((snapshot) => {
                this.repRef.once('value').then((repSnapshot) => {
                    let email = this.props.user.email;
                    let allUserReps = snapshot.val();
                    let allReps = repSnapshot.val();
                    let repKey = null;
                    if (allReps) {
                        Object.keys(allReps).forEach((key) => {
                            let currentRep = allReps[key];
                            if (currentRep.id === this.props.representative.id) {
                                repKey = key;
                            }
                        });
                    }
                    if (allUserReps && repKey) {
                        Object.keys(allUserReps).forEach((key) => {
                            let currentUserRep = allUserReps[key];
                            if (currentUserRep.user === email && currentUserRep.repKey === repKey) {
                                this.setState({
                                    userRepKey: key
                                })
                            }
                        });
                    }
                });
            });
        }
        if (!this.state.userRepInitialized) {
            this.setState({
                userRepInitialized: true
            })
        }
    }

    // star or unstar the representative 
    setFavoriteRep() {
        if (!this.state.userRepKey) {
            let email = this.props.user.email;
            let memberid = this.props.representative.id;
            let name = this.props.representative.name;
            // make connection between this representative and the user
            this.searchRep(memberid, name, (repKey) => {
                this.userRepRef.push({
                    repKey: repKey,
                    user: email,
                    timeStamp: firebase.database.ServerValue.TIMESTAMP
                }).then((snapshot) => {
                    let path = snapshot.path.pieces_;
                    let userRepKey = path[path.length - 1];
                    this.setState({
                        userRepKey: userRepKey
                    })
                });
            });
        } else {

            // remove the connection between this user and the representative
            let dir = "UserRepresentative/" + this.state.userRepKey;
            firebase.database().ref(dir).remove();
            this.setState({
                userRepKey: null
            })
        }
    }


    // collect all ratings of this representative
    // if there is no rating, it will show `No Ratings`
    searchAvgRating() {
        this.commentRef.once("value").then((snapshot) => {
            let allComments = snapshot.val();
            let avg = "No Ratings";
            let total = 0;
            let count = 0;
            if (allComments) {
                Object.keys(allComments).forEach((key) => {
                    let comment = allComments[key];
                    if (comment.member === this.props.representative.id) {
                        total += comment.rate;
                        count = count + 1;
                    }
                });
            }
            if (count !== 0) {
                avg = Math.round(total / count * 10) / 10;
            }
            this.setState({
                average: avg
            });
            if (!this.state.avgInitialized) {
                this.setState({
                    avgInitialized: true
                })
            }
        });
    }


    // find the key of a representative
    // if the representative does not exist in database
    // it will first create the representative
    // and then pass the key of the representative in
    // callback function
    searchRep(memberid, name, callback) {
        this.repRef.once('value').then((snapshot) => {
            let allReps = snapshot.val();
            let repKey = null;
            if (allReps) {
                Object.keys(allReps).forEach((key) => {
                    if (allReps[key].id === memberid) {
                        repKey = key;
                    }
                });
            }
            if (!repKey) {
                let repInfo = {
                    name: name,
                    id: memberid,
                    party: this.props.representative.party,
                    timeStamp: firebase.database.ServerValue.TIMESTAMP
                }
                this.repRef.push(repInfo).then((snapshot) => {
                    let path = snapshot.path.pieces_;
                    repKey = path[path.length - 1];
                    callback(repKey);
                });
            } else {
                callback(repKey);
            }
        });
    }



    render() {
        if (this.state.userRepInitialized && this.state.avgInitialized) {
            let img = "imgs/star.png";
            if (this.state.userRepKey) {
                img = "imgs/starSolid.png";
            }
            let party = "Other";
            if (this.props.representative.party === "R") {
                party = "Republican"
            } else if (this.props.representative.party === "D") {
                party = "Democratic"
            }
            return (
                <Row>
                    <Col sm='12'>
                        <Card className="candidate-card" body>
                            {(this.props.user && !this.props.checkAnonymous()) &&
                                <CardBody>
                                    {this.props.isInDashboard &&
                                        // in dashboard, authenticated user can remove
                                        // representatives and share it
                                        <div className="card-icons-container">
                                            <div className="bg-danger icon" onClick={() => {
                                                this.setFavoriteRep();
                                            }} >
                                                <FontAwesome inverse name="fas fa-trash" />
                                            </div>
                                            <div className="bg-primary icon" onClick={() => {
                                                this.searchRep(this.props.representative.id,
                                                    this.props.representative.name, (key) => {
                                                        this.props.shareRepKey(key);
                                                    });
                                            }} >
                                                <FontAwesome inverse name="far fa-share-square" />
                                            </div>
                                        </div>
                                    }
                                    {(!this.props.isInDashboard && !this.props.isInMain) &&
                                        // not in dashboard, the authenticated user can
                                        // star or unstar the suer
                                        <img src={img} className="star-icon" alt="star" onClick={() => {
                                            this.setFavoriteRep();
                                        }} />
                                    }
                                </CardBody>
                            }
                            <CardBody>
                                <CardTitle>{this.props.representative.name}</CardTitle>
                                <CardSubtitle>{party}</CardSubtitle>
                                <CardText>{"Rating : " + this.state.average}</CardText>
                                {(this.props.isInDashboard && this.props.representative.owner) &&
                                    // if the representative is shared by the user's friend
                                    // it will show the name of the firend
                                    <CardText>{"From: " + this.props.representative.owner}</CardText>
                                }
                                <button className="button-item btn btn-primary" onClick={() => {
                                    this.props.setSpecific(this.props.representative.id);
                                }}>Learn More</button>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>);
        } else {
            return (
                <Card>
                    <CardTitle>Loading Representative</CardTitle>
                </Card>);
        }
    }
}

// This is the page for displaying specific information about a representative
// plus a system where users can rate and comment the representative
export class Representative extends Component {
    constructor(props) {
        super(props);
        this.state = {
            member: null
        }
    }

    componentDidMount() {
        this.getRepresentativeData();
    }

    // search the representative data
    // 1: some baic information about the representative
    // 2: bills that he or she cosponsored in recent days
    getRepresentativeData() {
        let url = "https://api.propublica.org/congress/v1/members/" + this.props.member + ".json";
        let sponsorURL = "https://api.propublica.org/congress/v1/members/" + this.props.member + "/bills/cosponsored.json";
        // get member information
        fetch(url, {
            type: "GET",
            dataType: 'json',
            headers: { 'X-API-Key': this.props.propublia }
        }).then((response) => {
            return response.json();
        }).then((response) => {

            // get bill information 
            fetch(sponsorURL, {
                type: "GET",
                dataType: 'json',
                headers: { 'X-API-Key': this.props.propublia }
            }).then((response) => {
                return response.json();
            }).then((sponsorData) => {
                let allSponsor = sponsorData.results[0].bills;
                let memberInfo = response.results[0];
                this.setState({
                    member: {
                        memberInfo: memberInfo,
                        allSponsor: allSponsor
                    }
                })
            }).catch((error) => {
                this.setState({
                    voteError: error.message
                })
            });
        }).catch((error) => {
            this.setState({
                memberError: error.message
            })
        });
    }

    // find the full name of the representative
    getFullName() {
        let firstName = this.state.member.memberInfo["first_name"];
        let middleName = this.state.member.memberInfo["middle_name"];
        let lastName = this.state.member.memberInfo["last_name"];
        let result = firstName;
        if (middleName) {
            result = result + " " + middleName
        }
        result = result + " " + lastName
        return (result);
    }

    // get date information in the format of
    // Month/Day/Year
    getDate(date) {
        let parts = date.split("-");
        return (parts[1] + "/" + parts[2] + "/" + parts[0]);
    }

    // get the facebook link of the representative
    // or none if he or she does not have
    getFacebookLink() {
        let faceBook = this.state.member.memberInfo["facebook_account"];
        let result = <p>Facebook : None</p>;
        if (faceBook) {
            result = <p>Facebook : <a target="_blank" href={"https://www.facebook.com/" + faceBook} >{faceBook}</a></p>
        }
        return (result);
    }

    // get twitter account of the representative
    // or none if he or she does not have
    getTwitterAccount() {
        let twitter = this.state.member.memberInfo["twitter_account"];
        let result = <p>Twitter : None</p>;
        if (twitter) {
            result = <p>Twitter : <a target="_blank" href={"https://www.twitter.com/" + twitter} >{twitter}</a></p>
        }
        return (result);
    }

    render() {
        if (this.state.member) {
            let result = [];
            let sponsors = this.state.member.allSponsor;
            sponsors.forEach((sponsor, index) => {
                if (index < 5) {
                    result.push(sponsor);
                }
            })

            return (
                <div className="specific-rep">
                    <div className="rep-info-container cloth">
                        <div className="specific-rep-title">
                            <div>
                                <h2>{this.getFullName()}</h2>
                            </div>
                        </div>

                        <div className="specific-rep-info" >
                            <p>{"Date of Birth : " + this.getDate(this.state.member.memberInfo["date_of_birth"])}</p>
                            <p>{"Latest Vote : " + this.getDate(this.state.member.memberInfo["most_recent_vote"])}</p>
                            {this.getFacebookLink()}
                            {this.getTwitterAccount()}
                        </div>

                        {result.length > 0 &&
                            // recent bills cosponsored
                            <div>
                                <h3>Recent Bills Cosponsored</h3>
                                <ul className="bills">
                                    {result.map((bill, index) => {
                                        if (bill["govtrack_url"]) {
                                            return (<li key={"sponsor-bill-" + index} >
                                                <a target="_blank"
                                                    href={bill["govtrack_url"]}
                                                    style={{
                                                        textDecoration: "none"
                                                    }} >{bill["short_title"]}</a>
                                            </li>)
                                        } else {
                                            return (<li key={"sponsor-bill-" + index} >{bill["short_title"]}</li>);
                                        }
                                    })}
                                </ul>
                            </div>
                        }
                        <div>
                            <button className="button-item btn btn-danger" onClick={() => {
                                this.props.setSpecific(null);
                            }}>Back</button>
                        </div>
                    </div>
                    <Comment user={this.props.user} member={this.props.member} checkAnonymous={this.props.checkAnonymous} />
                </div>
            );
        } else {
            return (
                <div>Loading Member, it takes time :(</div>
            );
        }
    }
}

// this is the page where users see and write comments or rates to a representative
class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: null,
            writeComment: false,
            userRate: 0,
            userComment: ""
        }
        this.commentRef = firebase.database().ref("Comment");
        this.rateOptions = [];
        for (let index = 0; index <= 10; index++) {
            let value = index / 2;
            this.rateOptions.push({ label: value, value: value });
        }
    }

    componentDidMount() {
        this.searchComments();
        // listen the change of comment
        this.commentRef.on('value', () => {
            this.searchComments();
        });
    }

    // search all comments of a representative
    searchComments() {
        this.commentRef.once('value').then((snapshot) => {
            let result = [];
            let allComments = snapshot.val();
            if (allComments) {
                Object.keys(allComments).forEach((key) => {
                    let currentComment = allComments[key];
                    if (currentComment.member === this.props.member) {
                        result.push(allComments[key]);
                    }
                });
            }
            this.setState({
                comments: result
            })
        })
    }

    // write comments and rating to a representative
    // it allows anonymous comments and rating
    writeComment() {
        let user = "Anonymous";
        let email = "None"
        if (!this.props.checkAnonymous()) {
            user = this.props.user.displayName;
            email = this.props.user.email;
        }
        let comment = {
            member: this.props.member,
            rate: this.state.userRate,
            comment: this.state.userComment,
            timeStamp: firebase.database.ServerValue.TIMESTAMP,
            user: user,
            email: email
        };
        this.commentRef.push(comment).then(() => {
            this.setState({
                writeComment: false,
                userRate: 0,
                userComment: ""
            })
        });
    }

    render() {
        if (this.state.comments) {
            return (
                <div className="comment-container cloth">
                    {!this.state.writeComment &&
                        // page to see other users' comments and ratings
                        <div>
                            <div className="comment-title-container">
                                <h3>Comments</h3>
                                <button className="button-item btn btn-primary" onClick={() => {
                                    this.setState({
                                        writeComment: true
                                    })
                                }} >Add Comment</button>
                            </div>
                            <div>
                                {this.state.comments.length === 0 &&
                                    <div className="surprise">
                                        Seems like you can be the first one :)
                                    </div>
                                }
                                {this.state.comments.length !== 0 &&
                                    <CardDeck>
                                        {this.state.comments.map((comment, index) => {
                                            return (
                                                <CommentCard key={"comment-card-" + index} comment={comment} />
                                            );
                                        })}
                                    </CardDeck>
                                }
                            </div>
                        </div>
                    }
                    {this.state.writeComment &&
                        // page to write comments and rating
                        <div className="write-comment-container">
                            <div>
                                <h3>What do you think of this representative?</h3>
                            </div>
                            <div>
                                <h4>From 0(inhuman) to 5(excellent), what's your rate?</h4>
                                <Select name="rate"
                                    value={this.state.userRate}
                                    options={this.rateOptions}
                                    onChange={(event) => {
                                        let rate = 0;
                                        if (event) {
                                            rate = event.value;
                                        }
                                        this.setState({
                                            userRate: rate
                                        })
                                    }} />
                            </div>
                            <div>
                                <h4>What do you think of this representative?</h4>
                                <textarea onChange={(event) => {
                                    this.setState({
                                        userComment: event.target.value
                                    })
                                }} placeholder="Please write something"></textarea>
                            </div>

                            <div className="button-container">
                                <button className="button-item btn btn-danger" onClick={() => {
                                    this.setState({
                                        writeComment: false
                                    })
                                }}>Cancel</button>
                                <button className="button-item btn btn-success"
                                    disabled={this.state.userComment.length === 0}
                                    onClick={() => {
                                        this.writeComment();
                                    }} >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    }
                </div>
            );
        } else {
            return (<div>Loading Comments</div>);
        }
    }
}

// This is a card display the comment information 
// from a user
// it will show
// 1: the comment
// 2: the rating
// 3: user's profile image
class CommentCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: null
        }
        this.userRef = firebase.database().ref("User");
    }

    componentDidMount() {
        this.searchProfile();
    }

    // search the profile image and name of a user
    // then display those in the card
    searchProfile() {
        if (this.props.comment.email !== "None") {
            this.userRef.once('value').then((snapshot) => {
                let allUsers = snapshot.val();
                let targetUser = null;
                Object.keys(allUsers).forEach((key) => {
                    let current = allUsers[key];
                    if (current.email === this.props.comment.email) {
                        targetUser = current;
                    }
                });
                if (targetUser && targetUser.profile) {
                    let profileDir = targetUser.profile;
                    firebase.storage().ref().child(profileDir).getDownloadURL().then((snapshot) => {
                        this.setState({
                            profile: snapshot
                        })
                    });
                } else {
                    this.setState({
                        profile: "imgs/user.png"
                    })
                }
            });
        } else {
            this.setState({
                profile: "imgs/user.png"
            })
        }
    }

    render() {
        if (this.state.profile) {
            return (
                <Row>
                    <Col xs="12">
                        <Card className="card comment-card" body>
                            <CardBody>
                                <CardTitle>{"\"" + this.props.comment.comment + "\""}</CardTitle>
                                <CardSubtitle>{"Rate : " + this.props.comment.rate}</CardSubtitle>
                                <CardBody className="comment-user-container">
                                    <CardImg className="comment-profile" src={this.state.profile} alt="User's Profile" />
                                    <CardText>{this.props.comment.user}</CardText>
                                </CardBody>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            );
        } else {
            return (
                <Row>
                    <Col sm='12'>
                        <Card className="comment-card" body>
                            <CardBody>
                                <CardText>Searching Comment</CardText>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            );
        }
    }
}