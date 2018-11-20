import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
import lodash from 'lodash';
import { CardDeck } from 'reactstrap';
import { Navigation } from './parts/Navigation';
import { CandidateCard, Representative } from './Search';

// this is the main page of the application
// where everyone can know the hottest representatives in rate my representative
// and the place where user will be redirected if they are not authenticated
export class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hottest: null,
            specificMember: null
        }
        this.userRepsRef = firebase.database().ref("UserRepresentative");
        this.userRef = firebase.database().ref("User");
        this.repRef = firebase.database().ref("Representative");
        this.propublia = "pO45fUhJpE6AuAW760jMj29gWqNgT2QGV2LcauWE";
        this.setSpecific = this.setSpecific.bind(this);
    }

    // refresh the hottest representatives once someone edits their dashboard
    // about representatives
    componentDidMount() {
        if (this.props.user) {
            this.searchHottestReps();
            this.userRepsRef.on('value', () => {
                this.searchHottestReps();
            });
        }
    }

    // reload the page when this page receives the anoymous account
    // or otherwise the page stops loading
    componentWillReceiveProps(newProps) {
        if (newProps.user) {
            if (!this.props.user && newProps.user) {
                this.searchHottestReps();
            }
        }
    }

    // set up the specific representative of the user interest
    setSpecific(specificMember) {
        this.setState({
            specificMember: specificMember
        })
    }


    // find the top 9 representatives that are stared by users
    // in rate my representative
    searchHottestReps() {
        this.userRepsRef.once('value').then((snapshot) => {
            this.repRef.once('value').then((repSnapshot) => {
                let allReps = repSnapshot.val();
                let tally = {};
                let result = [];
                let allUserReps = snapshot.val();

                // count the time being stared of each representative by our users
                if (allUserReps) {
                    Object.keys(allUserReps).forEach((key) => {
                        let current = allUserReps[key];
                        let repKey = current.repKey;
                        if (!tally[repKey]) {
                            tally[repKey] = 0;
                        }
                        tally[repKey] = tally[repKey] + 1;
                    });
                }

                // transform the statistics by the order of stars
                if (Object.keys(tally).length > 0) {
                    let newTally = lodash.invertBy(tally);
                    let max = 1;
                    Object.keys(newTally).forEach((number) => {
                        max = Math.max(max, number);
                    });
                    while (result.length < 9 && max > 0) {
                        let current = newTally[max];
                        if (current) {
                            current.forEach((key) => {
                                Object.keys(allReps).forEach((currentKey) => {
                                    if (key === currentKey) {
                                        result.push(allReps[currentKey]);
                                    }
                                });
                            });
                        }
                        max = max - 1;
                    }
                }

                // set up hottest representatives
                this.setState({
                    hottest: result
                })
            });
        });
    }

    render() {
        if (this.props.user) {
            if (this.state.hottest) {
                let titleStyle = "space-between";
                if (!this.props.checkAnonymous()) {
                    titleStyle = "center";
                }
                return (
                    <div>
                        <Navigation user={this.props.user}
                            name="Rate My Representative"
                            current="main"
                            isAnonymous={this.props.checkAnonymous()} />

                        <div className="app-content-container main-page hypnotize">
                            <div className="main-title-container" style={{
                                justifyContent: titleStyle
                            }} >
                                <h2>Hottest Representatives</h2>
                                {this.props.checkAnonymous() &&
                                    // display search button if the user is not authenticated
                                    <div className="link">
                                        <Link to="/search" style={{ textDecoration: 'none', color: "white" }}>Search</Link>
                                    </div>
                                }
                            </div>
                            {this.state.hottest.length === 0 &&
                                // display when no one stars any representatives
                                // (which is impossible :), everyone cares representative)
                                <div>Seems like no one cares representative :(</div>
                            }
                            {(this.state.hottest.length > 0 && !this.state.specificMember) &&
                                // card deck of hottest representatives
                                <CardDeck className="card-deck">
                                    {this.state.hottest.map((rep, index) => {
                                        return (
                                            <CandidateCard key={"rep-card-hottest-" + index}
                                                user={this.props.user}
                                                isInDashboard={false}
                                                isInMain={true}
                                                representative={rep}
                                                setSpecific={this.setSpecific}
                                                shareRepKey={this.shareRepKey}
                                                checkAnonymous={this.props.checkAnonymous} />);
                                    })}
                                </CardDeck>
                            }
                            {(this.state.hottest.length > 0 && this.state.specificMember) &&
                                // display the specific representatives that a user is interested in
                                <Representative propublia={this.propublia}
                                    user={this.props.user}
                                    member={this.state.specificMember}
                                    setSpecific={this.setSpecific}
                                    checkAnonymous={this.props.checkAnonymous} />
                            }
                        </div>
                    </div>
                );
            } else {
                return (<div>Loading Representatives</div>);
            }
        } else {
            return (<div>Loading Data</div>);
        }
    }
}