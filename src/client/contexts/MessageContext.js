import React, { createContext, useState } from "react";

export const MessageContext = createContext();

export function MessageContextProvider(props) {
  
  const [chattingHistory, addMsgToChatHistory] = useState("hello");
  
  function updateChatHistory (msg) {  
  		let newHistory = [...chattingHistory, msg];
  		setSearch(newHistory);
  } 

  return (
    <MessageContext.Provider value={{ chattingHistory, updateChatHistory }}>
      {props.children}
    </MessageContext.Provider>
  );
}