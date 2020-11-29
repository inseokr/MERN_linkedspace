/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../../app.css';

export default class NoLoginMenu extends Component {
  state = { };

  constructor(props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleSignupClick = this.handleSignupClick.bind(this);
  }

  componentDidMount() {
  }

  handleLoginClick() {
    console.log('handleLoginClick');
    const { loginClickHandler } = this.props;
    loginClickHandler();
  }

  handleSignupClick() {
    console.log('handleSignupClick');
    const { signupClickHandler } = this.props;
    signupClickHandler();
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
          <div className="container">
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#linkedSpacesNavbarToggler" aria-controls="linkedSpacesNavbarToggler" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="linkedSpacesNavbarToggler">
              <a className="navbar-brand" href="/">LinkedSpaces</a>
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <a className="nav-link" href="#">About</a>
                </li>

                <li className="nav-item">
                  <a className="nav-link" onClick={this.handleLoginClick} href="#">Login</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" onClick={this.handleSignupClick} href="#">Sign Up</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}
