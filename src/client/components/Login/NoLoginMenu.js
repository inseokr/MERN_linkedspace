import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import '../../app.css';
import Search from "../../container/SearchPage/SearchPage"

function handleOnClick() {
  console.log("Login Clicked");
}


export default class NoLoginMenu extends Component {
  state = { };

  constructor(props) {
    super(props);

    this.handleLoginClick = this.handleLoginClick.bind(this);
  }

  componentDidMount() {
  }


  handleLoginClick() {
    console.log("handleLoginClick");
    this.props.loginClickHandler();
  } 


  render() {
    return (
    	<div>
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

              <li className="nav-item" >
                 <a className="nav-link" onClick={this.handleLoginClick} href="#">Login</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Signup">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>
        </nav>
        </div>
    );
  }
 }
