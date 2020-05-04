import React, { createContext, useState, useEffect, useContext } from 'react';
import ChattingMessageBox from "../container/GeneralChatPage/ChattingMessageBox";
import sampleProfile from "../../assets/images/Chinh - Vy.jpg";
import messageAlertSound from "../../assets/musics/eventually.mp3";
import axios from 'axios';

import { GlobalContext } from './GlobalContext';

export const MessageContext = createContext();

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

  const [numOfMsgHistory, setNumOfMsgHistory] = useState(0);

  const [newMsgArrived, setNewMsgArrived] = useState(false);

  const initialCurrChannelInfo = {channelName: "iseo-dm-justin", channelType: 0};

  const [currChanneInfo, setCurrChannelInfo] = useState(initialCurrChannelInfo);

  //const [chattingHistory, addMsgToChatHistory] = useState([]);

  const [waitMessage, setWaitMessage] = useState(false);
  const [socketCreated, setSocketCreated] = useState(false);
  const [chatSocket, setWebSocket] = useState(null);
  const [alertSound, setAlertSound] = useState(null);

  const [flagNewlyLoaded, setFlagNewlyLoaded] = useState(false);

  const [chatMainPageLoaded, setChatMainPageLoaded] = useState(false);

  const {currentUser, setCurrentUser, friendsList} = useContext(GlobalContext);

  // create or connect messaging socket
  if(socketCreated==false)
  {
      console.log("creating WebSocket");
      let ws = new WebSocket("ws://"+window.location.hostname+":3030");
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
          if(currentUser!=null)
          {
            chatSocket.send("CSC:Register:"+currentUser.username);
          }
          else
          {
            console.log("No current user is set yet!!!");
          }
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


  function updateLastReadIndex(data)
  {
    for(let i=0; i<currentUser.chatting_channels.dm_channels.length; i++)
    {
      if(currentUser.chatting_channels.dm_channels[i].name==data.channel_id)
      {
        let tempUser = currentUser;
        tempUser.chatting_channels.dm_channels[i].lastReadIndex = data.lastReadIndex;
        setCurrentUser(tempUser);
      }
    }    
  }

  function parseIncomingMessage(msg)
  {
      const regex = /CSD:(.*):(.*):(.*)/g;
      let parsedString = regex.exec(msg);

      console.log("received mssg="+msg);
      return parsedString;
  }

  async function pushCurrentChannelToDB()
  {
    // we don't update initial value;
    if(numOfMsgHistory==0) return;

    // update last read index
    // ISEO-TBD: What't the proper index value?
    // It may point to sending message as well if the last message is sending.
    // How are we going to handle this then? 
    // case 1> 
    // last index --> 10(<--Hello)
    //                11(--> I'm doing good)
    //                12(<-- Glad to hear that)
    //  size of length: 13(It will be the next message to be read)
    // case 2>
    // last index --> 10(<--Hello)
    //                11(--> I'm doing good)
    // size of length: 12(It will be the next message to be read)
    // So it doesn't matter!!
    var data = { channel_id: currChanneInfo.channelName, 
                 lastReadIndex: dmChannelContexts[currChanneInfo.channelName].chattingHistory.length};

    console.log("pushCurrentChannelToDB: lastReadIndex = " + data.lastReadIndex);
    const result = await axios.post('/chatting/update', data)
      .then(result => 
      {
          updateLastReadIndex(data);
      })
      .catch(err => console.log(err));

  }

  function switchChattingChannel(channelInfo)
  {
    // save some of information back to database
    pushCurrentChannelToDB();
    setCurrChannelInfo(channelInfo);
  }

  // direction: 
  //  + 0: sent from current user
  //  + 1: receive from others
  function updateChatContext(msg, channelName, channeType, direction, username)
  {
    console.log("updateChatContext, channelName = " + channelName);

    let channelContexts = dmChannelContexts;

    let chatHistory = channelContexts[channelName].chattingHistory;

    let now = new Date();

    let currentChat = {message: msg, timestamp: now.toDateString() + " " + now.toLocaleTimeString(), direction: direction, username: username};
    
    chatHistory = [...chatHistory, currentChat];


    console.log("length of chatHistory = " + chatHistory.length );

    channelContexts[channelName].chattingHistory = chatHistory;

    setChannelContexts(channelContexts);

    setNumOfMsgHistory(chatHistory.length);

    console.log("current chat history = " + JSON.stringify(channelContexts[channelName].chattingHistory[chatHistory.length-1]));
  }

  function checkNewlyLoaded() {

    let previousValue = flagNewlyLoaded;

    if(flagNewlyLoaded==true)
    {
      console.log("Resetting newly loaded flag");
      setFlagNewlyLoaded(false); // We will reset always when it's read.
    }
    return flagNewlyLoaded;
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
          // @CSD:channel_id:sender_name:msg
          //chatSocket.send(''.concat("CSD:{currChanneInfo.channelName}:", msg));
          chatSocket.send("CSD:"+currChanneInfo.channelName+":"+currentUser.username+":"+msg);
          setWaitMessage(true);
          // it will echo locally added messages.
          // how to filter it out then? Server should not forward it back to me?
          //const newHistory = [...chattingHistory, msg];
          //addMsgToChatHistory(newHistory);

          // let's add to new DBs
          // <note> I find it very inefficient...
          // we have to copy things all the time??
          updateChatContext(msg, currChanneInfo.channelName, 0 , 0, currentUser.username);
      }
      else {
          alertSound.play();
          let processedMsg = parseIncomingMessage(msg);

          // <note> 
          // processedMsg[1]: channel information.
          // processedMsg[2]: sender name
          // processedMsg[3]: message
          //console.log("Message for channel ID = " + processedMsg[1]);

          //const newHistory = [...chattingHistory, processedMsg[2]];
          // addMsgToChatHistory(newHistory);
          updateChatContext(processedMsg[3], processedMsg[1], 0, 1, processedMsg[2]);
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

  function getLastReadIndex(channel_id)
  {
    let channel_name = (channel_id!=""? channel_id:currChanneInfo.channelName);

    console.log("channel_name = " + channel_name);

    // ISEO: let's consider introducing map instead?
    for(let i=0; i<currentUser.chatting_channels.dm_channels.length; i++)
    {
      console.log("current channel = " + currentUser.chatting_channels.dm_channels[i].name);
      if(currentUser.chatting_channels.dm_channels[i].name==channel_name)
      {
        // ISEO-TBD: This value may contain old data.
        // let's use context information instead
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
      let date = new Date(history[i].timestamp);

      let curChat = { message: history[i].message,
                      username: history[i].writer, 
                      timestamp: date.toDateString() + " " + date.toLocaleTimeString(),
                      datestamp: date.toDateString(),
                      direction: ((history[i].writer==currentUser.username) ? 0 : 1)};

      reactChatHistory = [...reactChatHistory, curChat];
    }

    return reactChatHistory;
  }

  function checkIfAnyNewMsg(lastReadIndex, chatHistory)
  {
      // <note> lastReadIndex has the value of the next message to saved in the chat history
      // So it has read all the messages if it equals to the length.
      console.log("checkIfAnyNewMsg: direction of last message" + chatHistory[chatHistory.length-1].direction);
      console.log("checkIfAnyNewMsg: lastReadIndex = " + lastReadIndex + " history length = " + chatHistory.length);

      if(lastReadIndex == chatHistory.length)
      {
          return false;
      }
      else {
          // return TRUE only if the direction of message is received.
          return (chatHistory[chatHistory.length-1].direction==0)? false: true;
      }
  }

  function checkIfAnyNewMsgArrived()
  {
    return newMsgArrived;
  }

  function loadChatHistory(channel_id, history)
  {
    console.log("loadChatHistory");

     // It's a special flag to indicate that the channel history is loaded.
    if(currChanneInfo.channelName==channel_id)
    {
      console.log("setFlagNewlyLoaded!!!!!");
      setFlagNewlyLoaded(true);
    }

    // update channel DB in react side
    let lastReadIndex = getLastReadIndex(channel_id);
    let dmChannel = {channel_id: channel_id, channel_type: 0, last_read_index: lastReadIndex,
                     chattingHistory: buildHistoryFromDb(history)};

    // ISEO-TBD: make it sure that dmChannelContexts[chnnale_id] is defined.
    dmChannel.flag_new_msg = checkIfAnyNewMsg(lastReadIndex, dmChannel.chattingHistory);
    dmChannel.msg_summary  = dmChannel.chattingHistory[dmChannel.chattingHistory.length-1].message.slice(0,25) + "...";
    dmChannel.datestamp    = dmChannel.chattingHistory[dmChannel.chattingHistory.length-1].datestamp;

    if(dmChannel.flag_new_msg==true)
    {
        setNewMsgArrived(true);
    }

    let dmChannelContextArray = dmChannelContexts;
    dmChannelContextArray[channel_id] = dmChannel;

    setChannelContexts(dmChannelContextArray);

    // ISEO-TBD: somehow it's not changing ??
    console.log("channel ID = " + dmChannelContexts[channel_id].channel_id);
    console.log("length of chattingHistory = " + dmChannelContexts[channel_id].chattingHistory.length);

    setNumOfMsgHistory(dmChannelContexts[channel_id].chattingHistory.length);
  }

  // loading chatting database from backend
  async function loadChattingDatabase()
  {
    console.log("loadChattingDatabase");

    // clear new message arrival;
    setNewMsgArrived(false);

    // ISEO-TBD: it will be good time to register the user again?
    chatSocket.send("CSC:Register:"+currentUser.username);

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
      const result = await axios.post('/chatting/new', data)
        .then(result => 
        {
            console.log(result.data);

            if(result.data.bNewlyCreated==false)
            {
              // update channel DB using the history data
              console.log("result = " + result);

              // ISEO-TBD: channelData is not being used at all.
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

  useEffect(()=>{

    console.log("chatSocket = " + chatSocket);

  },[chatSocket]);

  return (
    <MessageContext.Provider value={{ dmChannelContexts, getLastReadIndex, chatMainPageLoaded, setChatMainPageLoaded, switchChattingChannel, numOfMsgHistory, getChattingHistory, updateChatHistory, loadChattingDatabase, checkNewlyLoaded , checkIfAnyNewMsgArrived}}>
      {props.children}
    </MessageContext.Provider>
  );
}
