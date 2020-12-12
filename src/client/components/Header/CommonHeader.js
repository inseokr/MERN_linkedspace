/* eslint-disable */
import React, { useEffect, useContext } from 'react';
import '../../app.css';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from '../Login/NoLoginMenu';
import LoginMenu from '../Login/LoginMenu';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function CommonHeader(props) {
  const {
    loadFriendList, friendsList, setCurrentUser, currentUser, isUserLoggedIn
  } = useContext(GlobalContext);
  const { switchChattingChannel, getDmChannelId } = useContext(MessageContext);

  function getLoginStatus() {
    // This should be called only once when no current user is set
    if (currentUser == null) {
      console.log("getLoginStatus");
      fetch('/LS_API/getLoginStatus')
        .then(res => res.json())
        .then((user) => {
          console.log(` received user = ${user}`);
          setCurrentUser(user);
          props.updateLoginStatus(user != null);
        });
    }
  }

  useEffect(() => {
    getLoginStatus();

    if (currentUser != null) {
      if (friendsList === undefined) loadFriendList();
    }

  }, [currentUser, friendsList]);

  const { loginClickHandler, signupClickHandler } = props;

  console.log("ISEO: rendering CommonHeader: isUserLoggedIn = " + isUserLoggedIn());

  return (
    <div className="navBarContainer">
      <LinkedSpaceHeader />
      { isUserLoggedIn()
        ? <LoginMenu />
        : <NoLoginMenu loginClickHandler={loginClickHandler} signupClickHandler={signupClickHandler} />
      }
    </div>
  );
}

export default CommonHeader;
