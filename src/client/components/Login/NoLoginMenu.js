import React, { Component } from 'react';
import '../../app.css';
import Search from "../../container/SearchPage/SearchPage"

export default class NoLoginMenu extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
    	<>
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#linkedSpacesNavbarToggler" aria-controls="linkedSpacesNavbarToggler" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="linkedSpacesNavbarToggler">
            <a className="navbar-brand" href="/">LinkedSpaces</a>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">About</a>
              </li>

              <li className="nav-item">
                <a href="/react_login" data-toggle = "modal" data-target= "#modalLoginForm" className="nav-link">Login</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/signup" >Sign up</a>
              </li>
            </ul>
          </div>
        </div>
        </nav>
        </>
    );
  }
 }
