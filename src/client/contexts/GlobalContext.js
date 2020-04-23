import React, { createContext, useState } from "react";

export const GlobalContext = createContext();

export function GlobalProvider(props) {

  const [friendsList, setFriends] = useState();	

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
    <GlobalContext.Provider value={{ friendsList, loadFriendList }}>
      {props.children}
    </GlobalContext.Provider>
  );
}