import React, { Component } from 'react';
import {Link} from 'react-router-dom';

// The diisclaimer of this project.
export class Disclaimer extends Component {
    render() {
        return(
            <footer> 
                <p>Data is at the courtesy of <a 
                    href="https://www.propublica.org/datastore/api/propublica-congress-api" 
                    target="_blank" rel="noopener noreferrer"
                >Propubica Congress API</a>, and the web appation is made by Team 5 in INFO 343 Winter quarter, 2018. <Link
                    to="about"
                >Learn more about us?
                </Link></p>
            </footer>
        );
    }
}