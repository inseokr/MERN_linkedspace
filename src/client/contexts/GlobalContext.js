/* eslint-disable */
import React, { createContext, useState, useEffect } from 'react';
import sampleProfile from '../assets/images/Chinh - Vy.jpg';

export const GlobalContext = createContext();

export function GlobalProvider(props) {
  const [friendsList, setFriends] = useState();
  const [currentUser, setCurrentUser] = useState(null);
  const [friendsMap, setFriendsMap] = useState();
  const [network_info, setNetwork_Info] = useState(null);

  console.log(`GlobalProvider: currentUser = ${currentUser}`);

  function isUserLoggedIn() {
    return currentUser != null;
  }

  function checkUnreadListing() {

    if(currentUser != null)
    {

      for(let index=0; index<currentUser.incoming_tenant_listing.length; index++)
      {
        if(currentUser.incoming_tenant_listing[index].status==="New")
        {
          return true;
        }
      }

      for(let index=0; index<currentUser.incoming_landlord_listing.length; index++)
      {
        if(currentUser.incoming_landlord_listing[index].status==="New")
        {
          return true;
        }
      }

    }
    else
    {
      return false;
    }

  }

  function getProfilePicture(user_name) {
    if (user_name === undefined || currentUser === null) return sampleProfile;

    if (user_name === currentUser.username) {
      return currentUser.profile_picture;
    }

    if (friendsMap[user_name] == undefined) {
      console.warn(`Current user: ${user_name} is no direct friend`);
      return sampleProfile;
    }

    return friendsMap[user_name].profile_picture;
  }


  function getUserLoginStatus(user_name) {
    if (user_name === undefined) return false;

    if (user_name === currentUser.username) {
      return (currentUser.loggedInTime!=null);
    }

    if (friendsMap[user_name] == undefined) {
      console.warn(`Current user: ${user_name} is no direct friend`);
      return false;
    }

    return (friendsMap[user_name].loggedInTime!=null);
  }

  function buildFriendsMap(friends) {
    const tempFriendsMap = [];

    for (let i = 0; i < friends.length; i++) {
      tempFriendsMap[friends[i].username] = friends[i];
    }

    setFriendsMap(tempFriendsMap);
  }

  async function loadFriendList() {

    if(currentUser!=undefined && currentUser.direct_friends!=undefined)
    {
      setFriends(currentUser.direct_friends, buildFriendsMap(currentUser.direct_friends));
    }
  }

  async function loadSocialNetworkDb() {
    await fetch('/LS_API/mynetwork/networkinfo')
      .then(res => res.json())
      .then((network) => {
        setNetwork_Info(network);
      });
  }

  function refreshUserData() {
    console.log("ISEO: refreshUserData");
    
    fetch('/LS_API/refresh', { method: 'GET'})
    .then(res => res.json())
    .then((user) => {
      if(user!==null)
      {
        setCurrentUser(user);
        loadFriendList();
      }
    });
  }

  useEffect(() => {
    const interval = setInterval(refreshUserData, 1000*60*3);
    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <GlobalContext.Provider value={{
      currentUser, setCurrentUser, isUserLoggedIn, friendsList, loadFriendList, 
      loadSocialNetworkDb, network_info, getProfilePicture, getUserLoginStatus, 
      refreshUserData, checkUnreadListing
    }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
