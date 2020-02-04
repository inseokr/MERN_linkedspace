import React, { Component } from 'react';
import '../../app.css';
import ReactImage from '../../images/react.png';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from '../Login/NoLoginMenu';
import LoginMenu from '../Login/LoginMenu';

export default class CommonHeader extends Component {

  constructor(props){
    super(props);
    this.state = {
      isUserLoggedIn: "false"
    }
  }

  componentDidMount() {
    this.getLoginStatus();
  }

  getLoginStatus = () => {
    fetch('/getLoginStatus')
    .then(res => res.json())
    .then(status => {console.log(" received status= " + status); this.setState({isUserLoggedIn: status})})
  };

  render() {

    console.log("User Login status  = " + this.state.isUserLoggedIn);

    return (
      <div>
        <LinkedSpaceHeader />
        { this.state.isUserLoggedIn==="true"
          ? <LoginMenu />
          : <NoLoginMenu />
        }
      </div>
    );
  }
}
