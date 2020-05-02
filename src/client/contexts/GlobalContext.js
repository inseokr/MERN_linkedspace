import React, { createContext, useState } from "react";
import sampleProfile from "../../assets/images/Chinh - Vy.jpg";

export const GlobalContext = createContext();

export function GlobalProvider(props) {

  const [friendsList, setFriends] = useState();	
  const [currentUser, setCurrentUser] = useState(null);
  const [friendsMap, setFriendsMap] = useState();
  
  function isUserLoggined()
  {
  	if(currentUser!=null) return true;
  	else false;
  }

  function getProfilePicture(user_name)
  {
    if(user_name==undefined) return sampleProfile;

    if(user_name==currentUser.username)
    {
      return currentUser.profile_picture;
    }
    else
    {
      return friendsMap[user_name].profile_picture;
    }
  }

  function getDmChannelId(friend_name)
  {
    let dmChannelId = (currentUser.username>friend_name)?
                       friend_name + "-dm-" +  currentUser.username:
                       currentUser.username + "-dm-" + friend_name;
    return dmChannelId
  }

  function buildFriendsMap(friends)
  {
    let tempFriendsMap = [];

    for(let i=0; i<friends.length; i++)
    {
      tempFriendsMap[friends[i].username] = friends[i];
    }

    setFriendsMap(tempFriendsMap);
  }

  async function loadFriendList()
  {
  	await fetch('/mynetwork/friend_list')
      .then(res => res.json())
      .then(friends => {
      	  setFriends(friends, buildFriendsMap(friends));
          //buildFriendsMap(friends);
      	  console.log("friends = " + friends);
      });
  }

  return (
    <GlobalContext.Provider value={{ currentUser, setCurrentUser, isUserLoggined, friendsList, loadFriendList, getProfilePicture, getDmChannelId }}>
      {props.children}
    </GlobalContext.Provider>
  );
}