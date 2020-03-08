import React, { Component } from 'react';
import './app.css';
import ReactImage from './react.png';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from './NoLoginMenu';
import LoginMenu from './LoginMenu';

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

    console.log("User Loggin status  = " + this.state.isUserLoggined);

    return (
        <div className="CommonHeader">
          <LinkedSpaceHeader />
          { this.state.isUserLoggined=="true" 
            ? <LoginMenu />
            : <NoLoginMenu />
          }
        </div>
    );

  }
}
