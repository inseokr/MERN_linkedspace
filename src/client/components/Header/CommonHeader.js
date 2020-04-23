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
    .then(status => {
      console.log(" received status= " + status); 
      this.setState({isUserLoggined: status});
      if(status=="true")
      {
        //loading user information and others
        console.log("User Loggined and loading friend list");
        this.context.loadFriendList();
      }
    })
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
