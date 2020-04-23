import React, { createContext, useState, useEffect, useContext } from 'react';
import ChattingMessageBox from "../container/GeneralChatPage/ChattingMessageBox";
import sampleProfile from "../../assets/images/Chinh - Vy.jpg";
import messageAlertSound from "../../assets/musics/eventually.mp3";
import axios from 'axios';

import { GlobalContext } from './GlobalContext';

export const MessageContext = createContext();

// <note> need to  use IP address variable
const chatUrl = 'ws://localhost:3030';

export function MessageContextProvider(props) {
  // How to organize chatting channels?
  // 1. information needed per channel
  //    + channel name
  //    + channel type
  //    + chatting history: message & timestamp
  //    + last read index
  //
  // 2. list of channels and control information
  //    : let's organize channels separately. DM and other channels
  //    + DM channels
  //    + Group channels
  //    + other channels associated with listing
  //    + current channel index and type

  // DM channels
  // <note> {channel_id:, channel_type:, last_read_index:, chattingHistory: [{message:, timestamp:}]}
  // <question> can we use map?
  const [dmChannelContexts, setChannelContexts] = useState([]);

  const initialCurrChannelInfo = {channelName: "iseo-dm-justin", channelType: 0};
  const [currChanneInfo, setCurrChannelInfo] = useState(initialCurrChannelInfo);

  const [chattingHistory, addMsgToChatHistory] = useState([]);

  const [waitMessage, setWaitMessage] = useState(false);
  const [socketCreated, setSocketCreated] = useState(false);
  const [chatSocket, setWebSocket] = useState(null);
  const [alertSound, setAlertSound] = useState(null);


  const {friendsList} = useContext(GlobalContext);


  function parseIncomingMessage(msg)
  {
      const regex = /CSD:(.*):(.*)/g;
      let parsedString = regex.exec(msg);

      return parsedString;
  }

  function updateChatContext(msg, channelName, channeType)
  {
    let channelContexts = dmChannelContexts;

    let chatHistory = channelContexts[channelName].chattingHistory;
    let currentChat = {message: msg, timestamp: Date.now()};
    
    chatHistory = [...chatHistory, currentChat];
    channelContexts["iseo-dm-justin"].chattingHistory = chatHistory;

    console.log("updateChatContext... updating chatHistory now....");

    setChannelContexts(channelContexts); 
  }

  function getChattingHistory() {
      console.log("getChattingHistory...");
      if(dmChannelContexts["iseo-dm-justin"]===undefined)
      {
        // no history
        return [];
      }
      else 
      {
        return dmChannelContexts["iseo-dm-justin"].chattingHistory;
      }
  }

  function updateChatHistory(msg, local) {

      if(local==true)
      {
          // sending to chat server
          console.log("Sending message to server. msg = " + msg);

          // need to append header
          // @CSD:channel_id:
          //chatSocket.send(''.concat("CSD:iseo-dm-justin:", JSON.stringify(msg)));
          chatSocket.send(''.concat("CSD:iseo-dm-justin:", msg));
          setWaitMessage(true);
          // it will echo locally added messages.
          // how to filter it out then? Server should not forward it back to me?
          const newHistory = [...chattingHistory, msg];
          addMsgToChatHistory(newHistory);

          // let's add to new DBs
          // <note> I find it very inefficient...
          // we have to copy things all the time??
          updateChatContext(msg, "iseo-dm-justin", 0);
      }
      else {
          alertSound.play();
          let processedMsg = parseIncomingMessage(msg);

          // <note> processedMsg[1] will contain the channel information.
          console.log("Message for channel ID = " + processedMsg[1]);

          const newHistory = [...chattingHistory, processedMsg[2]];
          addMsgToChatHistory(newHistory);

          updateChatContext(processedMsg[2], "iseo-dm-justin", 0);
      }
  }
    if(socketCreated==false)
    {
        console.log("creating WebSocket");
        let ws = new WebSocket(chatUrl);
        setSocketCreated(true);
        setWebSocket(ws);

        let audio = new Audio(messageAlertSound);
        setAlertSound(audio);
    }
    else {
        chatSocket.onopen = () => {
            console.log("Chat Server Connected");
            // let's send the first message to register this socket.
            chatSocket.send("CSC:Register:inseo");
        }

        chatSocket.onmessage = evt => {
            const message = evt.data;
            updateChatHistory(message, false);
            setWaitMessage(false);
        }

        chatSocket.onclose = () => {
            console.log("Disconnected");
            // Do we need to reconnected?
            setWebSocket(null);
            setSocketCreated(false);
        }
    }


    // loading chatting database from backend
    function loadChattingDatabase()
    {
      var testArray = ["iseo" , "justin"];
      var data = {channel_id: "iseo-dm-justin", channel_type: 0, members: testArray};

      console.log("loadChattingDatabase");
      console.log("friendsList = ", friendsList);
/*
      fetch('/chatting/get')
      .then(res => res.json())
      .then(channel => {
        console.log("channel ID = " + channel.channel_id);
        //console.log("creator = " + channel.channel_creator.name);
        console.log("history length = " + channel.chat_history.length);
      });
*/
      axios.post('/chatting/new', data)
        .then(res => res.json())
        .then(result => 
        {
            console.log("result = " + result);
        });


      // update channel DB in react side
      const initDmChannel = {channel_id: "iseo-dm-justin", channel_type: 0, last_read_index: 0, 
                             chattingHistory: []
                             };

      if(dmChannelContexts["iseo-dm-justin"]===undefined)
      {
        console.log("New channel just added");
        
        const dmChannelContextArray = dmChannelContexts;
        dmChannelContextArray["iseo-dm-justin"] = initDmChannel;
        setChannelContexts(dmChannelContextArray);
      }
      else
      {
        console.log("The channel already exists");
      }
    }

    return (
    <MessageContext.Provider value={{getChattingHistory, updateChatHistory, loadChattingDatabase }}>
      {props.children}
    </MessageContext.Provider>
  );
}
