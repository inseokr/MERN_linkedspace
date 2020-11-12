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

    if (friendsList !== undefined && friendsList.length !== 0) {
      console.log('useEffect of commonHeader');
      // how to prevent multiple loading?
      const channelInfo = {
        channelName: getDmChannelId(friendsList[0].username),
        dm: {
          name: friendsList[0].username,
          distance: 1
        }
      };
      switchChattingChannel(channelInfo, true);
    }
  }, [currentUser, friendsList]);

  const { loginClickHandler } = props;

  return (
    <div className="navBarContainer">
      <LinkedSpaceHeader />
      { isUserLoggedIn()
        ? <LoginMenu />
        : <NoLoginMenu loginClickHandler={loginClickHandler} />
      }
    </div>
  );
}

export default CommonHeader;
