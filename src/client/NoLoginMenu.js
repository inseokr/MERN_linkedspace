import React, { Component } from 'react';
import './app.css';

export default class NoLoginMenu extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
    return (
    	<>
        <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div class="container">
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#linkedSpacesNavbarToggler" aria-controls="linkedSpacesNavbarToggler" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="linkedSpacesNavbarToggler">
            <a class="navbar-brand" href="/">LinkedSpaces</a>
            <ul class="navbar-nav ml-auto">
              <li class="nav-item">
                <a class="nav-link" href="#">About</a>
              </li>
              
              <li class="nav-item">
                <a href="/react_login" data-toggle = "modal" data-target= "#modalLoginForm" class="nav-link">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="/signup" >Sign up</a>
              </li>
            </ul>
          </div>
        </div>
        </nav>
        </>
    );
  }
 }