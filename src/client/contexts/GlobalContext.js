/* eslint-disable */
import React, { createContext, useState } from 'react';
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

  function getProfilePicture(user_name) {
    if (user_name === undefined) return sampleProfile;

    if (user_name === currentUser.username) {
      return currentUser.profile_picture;
    }

    if (friendsMap[user_name] == undefined) {
      console.warn(`Current user: ${user_name} is no direct friend`);
      return sampleProfile;
    }

    return friendsMap[user_name].profile_picture;
  }

  function buildFriendsMap(friends) {
    const tempFriendsMap = [];

    for (let i = 0; i < friends.length; i++) {
      tempFriendsMap[friends[i].username] = friends[i];
    }

    setFriendsMap(tempFriendsMap);
  }

  async function loadFriendList() {
  	await fetch('/LS_API/mynetwork/friend_list')
      .then(res => res.json())
      .then((friends) => {
      	  setFriends(friends, buildFriendsMap(friends));
        // buildFriendsMap(friends);
      	  console.log(`friends = ${friends}`);
      });
  }

  async function loadSocialNetworkDb() {
    await fetch('/LS_API/mynetwork/networkinfo')
      .then(res => res.json())
      .then((network) => {
        setNetwork_Info(network);
      });
  }

  return (
    <GlobalContext.Provider value={{
      currentUser, setCurrentUser, isUserLoggedIn, friendsList, loadFriendList, loadSocialNetworkDb, network_info, getProfilePicture
    }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}
