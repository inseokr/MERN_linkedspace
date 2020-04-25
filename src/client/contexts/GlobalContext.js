import React, { createContext, useState } from "react";

export const GlobalContext = createContext();

export function GlobalProvider(props) {

  const [friendsList, setFriends] = useState();	
  const [currentUser, setCurrentUser] = useState(null);

  function isUserLoggined()
  {
  	if(currentUser!=null) return true;
  	else false;
  }

  function loadFriendList()
  {
  	fetch('/mynetwork/friend_list')
      .then(res => res.json())
      .then(friends => {
      	  setFriends(friends);
      	  console.log("friends = " + friends);
      });
  }

  return (
    <GlobalContext.Provider value={{ currentUser, setCurrentUser, isUserLoggined, friendsList, loadFriendList }}>
      {props.children}
    </GlobalContext.Provider>
  );
}