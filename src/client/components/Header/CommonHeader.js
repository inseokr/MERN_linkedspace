import React, { Component } from 'react';
import '../../app.css';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from '../Login/NoLoginMenu';
import LoginMenu from '../Login/LoginMenu';

export default class CommonHeader extends Component {

  constructor(props){
    super(props);
    this.state = {
      isUserLoggined: "false"
    }
  }

  componentDidMount() {
    this.getLoginStatus();
  }

  getLoginStatus = () => {
    fetch('/getLoginStatus')
    .then(res => res.json())
    .then(status => {console.log(" received status= " + status); this.setState({isUserLoggined: status})})
  }

  render() {

    console.log("User Login Status: ", this.state.isUserLogged);

    return (
        <div className="navBarContainer">
          <LinkedSpaceHeader />
          { this.state.isUserLoggined=="true" 
            ? <LoginMenu />
            : <NoLoginMenu />
          }
        </div>
    );

  }
}
