import React, { useEffect, useContext } from 'react';
import '../../app.css';
import LinkedSpaceHeader from './LinkedSpaceHeader';
import NoLoginMenu from '../Login/NoLoginMenu';
import LoginMenu from '../Login/LoginMenu';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function CommonHeader (props){

  const {loadFriendList, loadSocialNetworkDb, friendsList, setCurrentUser, currentUser, isUserLoggined} = useContext(GlobalContext);
  const {loadChattingDatabase, switchChattingChannel, getDmChannelId} = useContext(MessageContext);

  console.log("loading commonHeader");

  async function loadDataBases() {
    if(isUserLoggined()==true)
    {
      console.log("loading databases");

      // note: followinng 2 API should be called in sequence.
      // It's not being called at all.
      console.log("loading friend list");
      const result1 = await loadFriendList();
      console.log("loading chatting Database");
      const result2 = await loadChattingDatabase();
      console.log("loading social network DB");
      const result3 = await loadSocialNetworkDb();
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
          let channelInfo = {channelName: getDmChannelId(friendsList[0].username),
                                      dm: {
                                            name: friendsList[0].username,
                                            distance: 1
                                          }};
          switchChattingChannel(channelInfo, true);
      }

  }, [currentUser, friendsList]);

  return (
      <div className="navBarContainer">
        <LinkedSpaceHeader />
        { isUserLoggined()===true
          ? <LoginMenu />
          : <NoLoginMenu loginClickHandler={props.loginClickHandler}/>
        }
      </div>
  );
}

export default CommonHeader;
