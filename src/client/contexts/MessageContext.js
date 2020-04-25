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

  // ISEO-TBD: need to figure out the default channel

  const initialCurrChannelInfo = {channelName: "iseo-dm-justin", channelType: 0};
  const [currChanneInfo, setCurrChannelInfo] = useState(initialCurrChannelInfo);

  //const [chattingHistory, addMsgToChatHistory] = useState([]);

  const [waitMessage, setWaitMessage] = useState(false);
  const [socketCreated, setSocketCreated] = useState(false);
  const [chatSocket, setWebSocket] = useState(null);
  const [alertSound, setAlertSound] = useState(null);

  const {currentUser, friendsList} = useContext(GlobalContext);

  // create or connect messaging socket
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
      // ISEO: not sure how it will be called upon every message reception?
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


  function parseIncomingMessage(msg)
  {
      const regex = /CSD:(.*):(.*)/g;
      let parsedString = regex.exec(msg);

      return parsedString;
  }

  // direction: 
  //  + 0: sent from current user
  //  + 1: receive from others
  function updateChatContext(msg, channelName, channeType, direction)
  {
    console.log("updateChatContext, channelName = " + channelName);

    let channelContexts = dmChannelContexts;

    let chatHistory = channelContexts[channelName].chattingHistory;

    let currentChat = {message: msg, timestamp: Date.now(), direction: direction};
    
    chatHistory = [...chatHistory, currentChat];


    console.log("length of chatHistory = " + chatHistory.length );

    channelContexts[channelName].chattingHistory = chatHistory;

    setChannelContexts(channelContexts);

    console.log("current chat history = " + JSON.stringify(channelContexts[channelName].chattingHistory[chatHistory.length-1]));
  }


  function getChattingHistory() {
      console.log("getChattingHistory of " + currChanneInfo.channelName);

      if(dmChannelContexts[currChanneInfo.channelName]===undefined)
      {
        // no history
        return [];
      }
      else 
      {
        console.log("Channel was found!!");
        return dmChannelContexts[currChanneInfo.channelName].chattingHistory;
      }
  }

  function updateChatHistory(msg, local) {

      if(local==true)
      {
          // sending to chat server
          console.log("Sending message to server. msg = " + msg);

          // need to append header
          // @CSD:channel_id:
          //chatSocket.send(''.concat("CSD:{currChanneInfo.channelName}:", msg));
          chatSocket.send("CSD:"+currChanneInfo.channelName+":"+msg);
          setWaitMessage(true);
          // it will echo locally added messages.
          // how to filter it out then? Server should not forward it back to me?
          //const newHistory = [...chattingHistory, msg];
          //addMsgToChatHistory(newHistory);

          // let's add to new DBs
          // <note> I find it very inefficient...
          // we have to copy things all the time??
          updateChatContext(msg, currChanneInfo.channelName, 0 , 0);
      }
      else {
          alertSound.play();
          let processedMsg = parseIncomingMessage(msg);

          // <note> processedMsg[1] will contain the channel information.
          console.log("Message for channel ID = " + processedMsg[1]);

         //const newHistory = [...chattingHistory, processedMsg[2]];
         // addMsgToChatHistory(newHistory);

          updateChatContext(processedMsg[2], processedMsg[1], 0, 0);
      }
  }

  function getListOfDmChannels()
  {
    let dmChannels = [];

    for(let i=0; i < friendsList.length; i++)
    {
      let dmChannel = {channel_id: 
                       (currentUser.username>friendsList[i].username)?
                       friendsList[i].username + "-dm-" +  currentUser.username:
                       currentUser.username + "-dm-" + friendsList[i].username,
                       members: []};

      dmChannel.members.push(friendsList[i].username);
      dmChannel.members.push(currentUser.username);

      dmChannels.push(dmChannel);
    }

    return dmChannels;
  }

  function getLastReadIndex(chnanel_id)
  {
    // ISEO: let's consider introducing map instead?
    for(let i=0; i<currentUser.chatting_channels.dm_channels; i++)
    {
      if(currentUser.chatting_channels.dm_channels[i].name==channel_id)
      {
        return currentUser.chatting_channels.dm_channels[i].lastReadIndex; 
      }
    }
    return 0;
  }

  function buildHistoryFromDb(history)
  {
    let reactChatHistory = [];


    for(let i=0; i<history.length; i++)
    {
      let curChat = { message: history[i].message, 
                      timestamp: history[i].timestamp, 
                      direction: ((history[i].writer==currentUser.username) ? 0 : 1)};

      reactChatHistory = [...reactChatHistory, curChat];
    }

    return reactChatHistory;
  }

  function loadChatHistory(channel_id, history)
  {
    console.log("loadChatHistory");

    // update channel DB in react side
    let dmChannel = {channel_id: channel_id, channel_type: 0, last_read_index: 0, 
                           chattingHistory: buildHistoryFromDb(history)
                           };


    let dmChannelContextArray = dmChannelContexts;
    dmChannelContextArray[channel_id] = dmChannel;

    setChannelContexts(dmChannelContextArray);

    // ISEO-TBD: somehow it's not changing ??
    console.log("channel ID = " + dmChannelContexts[channel_id].channel_id);
    
    console.log("length of chattingHistory = " + dmChannelContexts[channel_id].chattingHistory.length);

  }

  // loading chatting database from backend
  function loadChattingDatabase()
  {
    var testArray = ["iseo" , "justin"];

    console.log("loadChattingDatabase");

    let dmChannels = getListOfDmChannels();

    console.log("number of channels = " + dmChannels.length);

    // go through each channel and load chatting history if any.
    // we need to create the channel if it doesn't exist yet.
    for(let i = 0; i<dmChannels.length; i++)
    {      
      var data = { channel_id: dmChannels[i].channel_id, 
                   channel_type: 0, 
                   members: dmChannels[i].members};

      console.log("creating channels = " + dmChannels[i].channel_id);

      // ISEO-TBD: problem in handling the result!!
      axios.post('/chatting/new', data)
        .then(result => 
        {
            console.log(result.data);

            if(result.data.bNewlyCreated==false)
            {
              // update channel DB using the history data
              console.log("result = " + result);
              let channelData = { channel_id: result.data.channel.channel_id,
                                  channel_type: result.data.channel.channel_type,
                                  last_read_index: getLastReadIndex(result.data.channel.channel_id)}
              loadChatHistory(dmChannels[i].channel_id, result.data.channel.chat_history);
            }
            else
            {
              console.log(dmChannels[i].channel_id+"was newly created");
              loadChatHistory(dmChannels[i].channel_id, []);
            }
        })
        .catch(err => console.log(err));
    }

  }

  return (
    <MessageContext.Provider value={{getChattingHistory, updateChatHistory, loadChattingDatabase }}>
      {props.children}
    </MessageContext.Provider>
  );
}
