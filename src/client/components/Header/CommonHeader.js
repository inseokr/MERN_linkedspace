import React, { Component } from 'react';
import '../../app.css';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from '../Login/NoLoginMenu';
import LoginMenu from '../Login/LoginMenu';
import { GlobalContext } from '../../contexts/GlobalContext';

export default class CommonHeader extends Component {

  static contextType = GlobalContext;

  constructor(props){
    super(props);
  }

  componentDidMount() {
    this.getLoginStatus();
  }

  getLoginStatus = () => {
    fetch('/getLoginStatus')
    .then(res => res.json())
    .then(user => {
      console.log(" received user = " + user);

      this.context.setCurrentUser(user);
      
      if(this.context.isUserLoggined()==true)
      {
        //loading user information and others
        console.log("User Loggined and loading friend list");
        
        this.context.loadFriendList();
      }
    })
  }

  render() {

    console.log("User Login Status: ", this.context.isUserLoggined());

    return (
        <div className="navBarContainer">
          <LinkedSpaceHeader />
          { this.context.isUserLoggined()==true 
            ? <LoginMenu />
            : <NoLoginMenu />
          }
        </div>
    );

  }
}
