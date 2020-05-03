import React, { useEffect, useContext } from 'react';
import '../../app.css';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from '../Login/NoLoginMenu';
import LoginMenu from '../Login/LoginMenu';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function CommonHeader (){

  const {loadFriendList, friendsList, setCurrentUser, currentUser, isUserLoggined, getDmChannelId } = useContext(GlobalContext);
  const {loadChattingDatabase, switchChattingChannel} = useContext(MessageContext);

  async function loadDataBases() {
    if(isUserLoggined()==true)
    {
      console.log("loading databases");

      // ISEO-TBD: followinng 2 API should be called in sequence.
      console.log("loading friend list");
      const result1 = await loadFriendList();
      console.log("loading chatting Database");

      const result2 = await loadChattingDatabase();
    }
    else
    {
      console.log("loadDataBases failed as the user is  not loggined properly?");
    }
  }

  function getLoginStatus()
  {
    // This should be called only once when no current user is set
    if(currentUser==null)
    {
      fetch('/getLoginStatus')
      .then(res => res.json())
      .then(user => {
        console.log(" received user = " + user);
        setCurrentUser(user);
      })
    }
  }

  useEffect(() => {

      getLoginStatus();

      if(currentUser!=null)
      {
        if(friendsList==undefined) loadFriendList();
      } 

      if(friendsList!=undefined && friendsList.length!=0) 
      {
          console.log("useEffect of commonHeader");
          // how to prevent multiple loading?
          let channelInfo = {channelName: getDmChannelId(friendsList[0].username)};
          switchChattingChannel(channelInfo);
          loadChattingDatabase();
      }

  }, [currentUser, friendsList]);

  return (
      <div className="navBarContainer">
        <LinkedSpaceHeader />
        { isUserLoggined()==true 
          ? <LoginMenu />
          : <NoLoginMenu />
        }
      </div>
  );
}

export default CommonHeader;