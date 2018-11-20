import React, { Component } from 'react';
import { Navigation } from './parts/Navigation';

// This page shows some basic introductory about our team
// and some help informations
export class AboutUS extends Component {
    render() {
        return (
            <div className="app-container">
                <Navigation user={this.props.user} isAnonymous={this.props.checkAnonymous()} name="About US" current="about" />
                <div>
                    <div className="about-us-main">
                        <div className="hypnotize">
                            <h2 className="about-title">Contributors</h2>
                            <p>
                                The project the at the efforts of the following four brilliant students at the University of Washington.
                            </p>
                            <ul>
                                <li>Alessandro M Lou</li>
                                <li>Howard Pu</li>
                                <li>Kidus Sendeke</li>
                                <li>Noelle Robbins</li>
                            </ul>
                        </div>
                        <div className="hypnotize">
                            <h2 className="about-title">Help</h2>
                            <div className="question">
                                <h3>Do I need an account for this service?</h3>
                                <p>
                                    Not necessary. However, if you want to explore the full potential of this application,
                                    a new account is right for you. (And it is also free!)
                                </p>
                            </div>
                            <div className="question">
                                <h3>Representaives I am concerned are not here?</h3>
                                <p>
                                    This service uses Propublia Congress API as data sorce. Since this API sometimes has errors,
                                    we will contact with Propublia about those issues in the future to improve your experience.
                                </p>
                            </div>
                            <div className="question">
                                <h3>I am concerned about my privacy and political standpoint.</h3>
                                <p>
                                    Your data stored in our database will not be shared by thid parties.
                                    If that all what you are concerned about, the problem is solved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}