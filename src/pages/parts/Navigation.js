import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'react-select/dist/react-select.css';
import 'bootstrap/dist/css/bootstrap.css';
import { AuthButton } from './Authbutton';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem } from 'reactstrap';

var FontAwesome = require('react-fontawesome');

// This is the navigation bar which can hightlight the section
// where the user is currently in
export class Navigation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.toggle = this.toggle.bind(this);
    }

    // This method will speficiy the style of a section
    // if the user are currently in one section,
    // it will be highlighted by blue background color
    // and white texts and icon.
    getBackground(page) {
        if (page !== this.props.current) {
            return ({
                color: "white",
                disabled: "",
                inverse: true,
                backgroundColor: "none"
            });
        } else {
            return ({
                color: "black",
                disabled: " disable-link",
                inverse: false,
                backgroundColor: "white"
            });
        }
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }


    render() {
        let mainStyle = this.getBackground("main");
        let searchStyle = this.getBackground("search");
        let dashboardStyle = this.getBackground("dashboard");
        let friendsStyle = this.getBackground("friends");
        let profileStyle = this.getBackground("profile");
        let aboutStyle = this.getBackground("about");
        return (
            <Navbar style={{
                backgroundColor: "#4b2e83",
                padding: "0px",
                height: "4rem",
                boxShadow: "0 10px 10px rgba(0, 0, 0, 0.16), 0 10px 10px rgba(0, 0, 0, 0.23)",
                marginBottom: "2rem"
            }} light expand="md">
                <NavbarBrand style={{
                    color: "white"
                }}><img src='imgs/capitol-building.png' alt="app brand" className='nav-icon' />{this.props.name}</NavbarBrand>
                <NavbarToggler onClick={this.toggle} style={{
                    backgroundColor: 'white'
                }} />
                <Collapse isOpen={this.state.isOpen} navbar>
                    <Nav className="ml-auto" navbar style={{
                        flex: 1
                    }} >
                        <NavItem style={{
                            backgroundColor: mainStyle.backgroundColor
                        }} >
                            <div className={"icon-text-container " + mainStyle.disabled}>
                                <div className="icon-text-item">
                                    <FontAwesome inverse={mainStyle.inverse} name='fas fa-home' />
                                </div>
                                <Link to="/" style={{ textDecoration: 'none', color: mainStyle.color }} >
                                    Main
                                </Link>
                            </div>
                        </NavItem>


                        <NavItem style={{
                            backgroundColor: searchStyle.backgroundColor
                        }}>
                            <div className={"icon-text-container " + searchStyle.disabled}>
                                <div className={"icon-text-item"}>
                                    <FontAwesome inverse={searchStyle.inverse} name="fas fa-search" />
                                </div>
                                <Link to="/search" style={{ textDecoration: 'none', color: searchStyle.color }}>Search</Link>
                            </div>
                        </NavItem>


                        {!this.props.isAnonymous &&
                            <NavItem style={{
                                backgroundColor: dashboardStyle.backgroundColor
                            }} >
                                <div className={"icon-text-container " + dashboardStyle.disabled}>
                                    <div className="icon-text-item">
                                        <FontAwesome inverse={dashboardStyle.inverse} name='fas fa-columns' />
                                    </div>
                                    <Link to="/dashboard" style={{ textDecoration: 'none', color: dashboardStyle.color }} >Dashboard</Link>
                                </div>
                            </NavItem>
                        }

                        {!this.props.isAnonymous &&
                            <NavItem style={{
                                backgroundColor: friendsStyle.backgroundColor
                            }}>
                                <div className={"icon-text-container " + friendsStyle.disabled}>
                                    <div className="icon-text-item">
                                        <FontAwesome inverse={friendsStyle.inverse} name="fas fa-users" />
                                    </div>

                                    <Link to="/friends" style={{ textDecoration: 'none', color: friendsStyle.color }}>Friends</Link>
                                </div>
                            </NavItem>
                        }

                        {!this.props.isAnonymous &&
                            <NavItem style={{
                                backgroundColor: profileStyle.backgroundColor
                            }}>
                                <div className={"icon-text-container " + profileStyle.disabled}>
                                    <div className="icon-text-item" >
                                        <FontAwesome inverse={profileStyle.inverse} name="far fa-user-circle" />
                                    </div>

                                    <Link to="/profile" style={{ textDecoration: 'none', color: profileStyle.color }}>Profile</Link>
                                </div>
                            </NavItem>
                        }

                        <NavItem style={{
                            backgroundColor: aboutStyle.backgroundColor
                        }} >
                            <div className={"icon-text-container " + aboutStyle.disabled}>
                                <div className="icon-text-item" >
                                    <FontAwesome inverse={aboutStyle.inverse} name="fas fa-child" />
                                </div>
                                <Link to="/about" style={{ textDecoration: 'none', color: aboutStyle.color }}>About US</Link>
                            </div>
                        </NavItem>

                        {this.props.isAnonymous &&
                            <NavItem>
                                {this.props.isAnonymous &&
                                    <div className="link main-sign-up">
                                        <Link to="/sign-up" style={{ textDecoration: 'none', color: 'white' }} >Sign Up</Link>
                                    </div>
                                }
                            </NavItem>
                        }

                        <NavItem className="lastbutton">
                            <AuthButton user={this.props.user} />
                        </NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }
}