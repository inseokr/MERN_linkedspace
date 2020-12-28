/* eslint-disable */
import React, {
  createContext, useState, useEffect, useContext
} from 'react';
import axios from 'axios';
import ChattingMessageBox from '../container/GeneralChatPage/ChattingMessageBox';
import messageAlertSound from '../assets/musics/eventually.mp3';

import { GlobalContext } from './GlobalContext';
import { CurrentListingContext } from './CurrentListingContext';


export const MSG_CHANNEL_TYPE_GENERAL = 0;
export const MSG_CHANNEL_TYPE_LISTING_PARENT = 1;
export const MSG_CHANNEL_TYPE_LISTING_CHILD = 2;

export const MessageContext = createContext();

export function MessageContextProvider(props) {
  // How to organize chatting channels?
  // 1. information needed per channelsetChattingContextType
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
  // ISEO-TBD: React doesn't catch the change in the hashmap
  // I introduced a context length instead.
  const [dmChannelContexts, setChannelContexts] = useState([]);
  const [doNotDisturbMode, setDoNotDisturbMode] = useState(false);
  const [channelWithLatestMessagae, setChannelWithLatestMessage] = useState(null);
  const [channelContextLength, setChannelContextLength] = useState(0);

  // ISEO-TBD:
  // Very annoying issue with React. ChattingWindow doesn't re-render even if dmChannelContexts are changes.
  // Not sure why it behaves this way. I decided to introduce a simple state variable to keep track of total number of message.
  // ChattingWindow does render whenever the message counter increases even though the counter is not actually used in the page itself.
  const [msgCounter, setMsgCounter] = useState(0);
  const [newMsgArrived, setNewMsgArrived] = useState(false);
  const [newMsgArrivedListingChannel, setNewMsgArrivedListingChannel] = useState(false);

  // channelType
  // 0: general chatting, not associated with any listing
  // 1: level 1 listing associated chatting channel
  // 2: level 2 listing associated chatting channel, either 3rd party listing or linkedspace created
  // <note> Format of channelName
  // q1. why do we need to have user information inside channelName? Can't we just use mongoDB channelID instead?
  // ==> How to switch channel context through contact list?


  const initialCurrChannelInfo = { channelName: 'irene-dm-yoobin', members: ['justin'] };

  const [currChannelInfo, setCurrChannelInfo] = useState(initialCurrChannelInfo);

  const [waitMessage, setWaitMessage] = useState(false);
  const [socketCreated, setSocketCreated] = useState(false);
  const [chatSocket, setWebSocket] = useState(null);
  const [alertSound, setAlertSound] = useState(null);

  const [flagNewlyLoaded, setFlagNewlyLoaded] = useState(false);

  const { currentUser, setCurrentUser, friendsList , refreshUserData} = useContext(GlobalContext);

  // messaging contexts related to posting
  // <note> we may need the whole listing DB?
  // question> Does dashboard has the listing DB?
  const { currentListing, fetchCurrentListing, setCurrentChildIndex, setChildIndexByChannelId, focusParentListing } = useContext(CurrentListingContext);

  // chattingContextType
  // 0: general chatting
  // 1: general chatting related to posting,  either tenant or landlord
  // 2: chatting related to child listing, either _3rdparty or internal
  // <note> ISEO-TBD: need to clean state when chattingContextType is change!!

  const [chattingContextType, setChattingContextType] = useState(0);
  const [childType, setChildType] = useState(0);
  const [childIndex, setChildIndex] = useState(0);


  const [currentChatPartyPicture, setCurrentChatPartyPicture] = useState('../assets/images/Chinh - Vy.jpg');


  const [selectedChatList, setSelectedChatList] = useState([]);
  // console.log("chattingContextType="+chattingContextType);
  // console.log("childType="+childType);
  // console.log("childIndex="+childIndex);
  // console.log("MessageContext: currChannelInfo.channelName = "+currChannelInfo.channelName);

  function parseChattingChannelName(channel_name)
  {
    // list of chatting channel
    // 1. general chat
    // : friend1-dm-friend2
    // 2. listing related chat
    // 2.1 parent level
    // : listing_id-parent-[friend_list]
    // 2.2 child listing
    // : listing_id-child-listing_id
    let result = channel_name.match(/(.*)-child-([^-]*)-(.*)/);
    if(result===null)
    {
      // check if it's parent chatting channel
      result = channel_name.match(/(.*)-parent-(.*)/);
      if(result!==null)
      {
        return "parent";
      }
      else
      {
        return null;
      }
    }
    else
    {
      // it's child chatting channel
      // <note> [2] contains the child listing ID
      return result[2];
    }
  }


  function processChattingChannelName(channel_name)
  {
    // list of chatting channel
    // 1. general chat
    // : friend1-dm-friend2
    // 2. listing related chat
    // 2.1 parent level
    // : listing_id-parent-[friend_list]
    // 2.2 child listing
    // : listing_id-child-listing_id
    let result = channel_name.match(/(.*)-child-([^-]*)-(.*)/);
  
    if(result===null)
    {
      // check if it's parent chatting channel
      result = channel_name.match(/(.*)-parent-(.*)/);
      if(result!==null)
      {
        return {type: "parent", parent_id: result[1], child_id: null};
      }
      else
      {
        return {type: "general", parent_id: null, child_id: null};
      }
    }
    else
    {
      // it's child chatting channel
      // <note> [2] contains the child listing ID
      return {type: "child", parent_id: result[1], child_id: result[2]};
    }

  }


  function refreshUserDataFromMessageContext() {
    refreshUserData();
  }


  function reset(mode) {
    // console.log("MessageContext: being reset");
    // console.log("MessageContext: current channel name = " + currChannelInfo.channelName );
    setChannelContexts([]);
    setChannelContextLength(0);
    setNewMsgArrived(false);
    setNewMsgArrivedListingChannel(false);

    // setCurrChannelInfo(initialCurrChannelInfo);

    setWaitMessage(false);
    setFlagNewlyLoaded(false);

    setChildType(0);
    setChildIndex(0);

    setChattingContextType(mode);
  }

  function getContactList() {
    // console.log("ISEO-TBD: getContactList: chattingContextType %d, childType = %s, childIndex = %d ", chattingContextType, childType, childIndex );
    // console.log("currentListing = " + JSON.stringify(currentListing));

    if (chattingContextType == 0) {
      if (friendsList == undefined) return null;

      return friendsList;
    }

    if (chattingContextType == 1) {
      return currentListing.shared_user_group;
    }

    if (currentListing.child_listings[childIndex] == undefined) {
      setChattingContextType(0);
      return null;
    }

    return currentListing.child_listings[childIndex].shared_user_group;
  }

  async function reloadChattingDbWithCurrentListing() {
    // console.log("reloadChattingDbWithCurrentListing");
    //console.warn("reloadChattingDbWithCurrentListing");
    let result = fetchCurrentListing(currentListing._id, 'tenant');
    // <note> loadChattingDatabase will be called when currentListing is updated.
  }

  async function addContactList(_friend) {
    // 1. update database through API
    // + update shared_user_group
    const post_url = `/LS_API/listing/${currentListing.listingType}/${currentListing._id}/addUserGroup`;

    const data = {
      friend: { id: _friend.id, username: _friend.username },
      chattingType: chattingContextType,
      childInfo: { type: childType, index: childIndex }
    };

    const result = await axios.post(post_url, data)
      .then((result) => {
        // ID of chatting channel will be returned.
        // update dmChannelContexts
        // console.log("addContactList: result = " + result);
        reloadChattingDbWithCurrentListing();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function postSelectedContactList() {
    // DM case
    if (selectedChatList.length == 1) {
      const post_url = `/LS_API/listing/${currentListing.listingType}/${currentListing._id}/addUserGroup`;
      const data = {
        friend: { id: selectedChatList[0].id, username: selectedChatList[0].username },
        chattingType: chattingContextType,
        childInfo: { type: childType, index: childIndex }
      };

      const result = await axios.post(post_url, data)
        .then((result) => {
          // ID of chatting channel will be returned.
          // update dmChannelContexts
          // console.log("addContactList: result = " + result);
          reloadChattingDbWithCurrentListing();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      if (chattingContextType == 0) {
        console.warn('Group chatting is not support for general chatting');
        return;
      }

      let concatenatedFriendsString = '';
      const friends = [];
      const childInfo = { type: childType, index: childIndex };
      const chattingType = chattingContextType;

      // 1. go through friends list
      for (let index = 0; index < selectedChatList.length; index++) {
        const friend = { id: selectedChatList[index].id, username: selectedChatList[index].username };
        friends.push(friend);
        const hypen = (index >= 1) ? '-' : '';

        concatenatedFriendsString = concatenatedFriendsString + hypen + selectedChatList[index].username;
      }

      // need to myself as well
      friends.push({ id: currentUser._id, username: currentUser.username });
      concatenatedFriendsString = `${concatenatedFriendsString}-${currentUser.username}`;

      const post_url = `/LS_API/listing/${currentListing.listingType}/${currentListing._id}/addGroupChat`;
      const channel_id = (chattingContextType == 1)
        ? `${currentListing._id}-parent-${concatenatedFriendsString}`
        : `${currentListing._id}-child-${currentListing.child_listings[childIndex].listing_id._id}-${concatenatedFriendsString}`;

      // console.log("postSelectedContactList: currentListing.child_listings[childIndex].listing_id = " + JSON.stringify(currentListing.child_listings[childIndex].listing_id));

      const data = {
        friends,
        chattingType,
        childInfo,
        channel_id
      };

      const result = await axios.post(post_url, data)
        .then((result) => {
          reloadChattingDbWithCurrentListing();
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  }

  function webSocketConnect() {
    // create or connect messaging socket
    //    if(sessionStorage.getItem('socketCreated')===null)
    if (socketCreated == false) {

      console.warn("webSocketConnect");
      let ws = null;

      //console.log("process.env="+JSON.stringify(process.env));
      //console.log("process.env.REACT_APP_WS_ENV="+process.env.REACT_APP_WS_ENV);
      if (process.env.REACT_APP_WS_ENV === 'development') {
        ws = new WebSocket(`ws://${window.location.hostname}:3030`);
      } else {
        //const HOST = window.location.origin.replace(/^http/, 'ws');
        //console.log(`env = ${JSON.stringify(process.env)}`);
        ws = new WebSocket(process.env.REACT_APP_WS_SERVER);
      }

      setSocketCreated(true);
      setWebSocket(ws);

      const audio = new Audio(messageAlertSound);
      setAlertSound(audio);
    } else {
      // ISEO: not sure how it will be called upon every message reception?
      chatSocket.onopen = () => {
        console.warn('Chat Server Connected');
        // let's send the first message to register this socket.
        if (currentUser != null) {
          chatSocket.send(`CSC:Register:${currentUser.username}`);
        } else {
          // console.log("No current user is set yet!!!");
        }
      };

      chatSocket.onmessage = (evt) => {
        console.warn("Got message!!");
        const message = evt.data;
        updateChatHistory(message, false);
        //setCurrentChildIndex(0);
        setWaitMessage(false);
      };

      chatSocket.onclose = () => {
        console.warn("ChatSocket is being closed. Will reconnect it after 1 second.");
        setSocketCreated(false);
        setTimeout(function() {
          webSocketConnect();
        }, 1000);
      };
    }
  }

  function deregisterSocket() {
    try {
      chatSocket.send(`CSC:DeRegister:${currentUser.username}`);
    } catch(error)
    {
      console.warn("deregisterSocket: error = " + error);
    }
  }

  function updateLastReadIndex(data) {
    for (let i = 0; i < currentUser.chatting_channels.dm_channels.length; i++) {
      if (currentUser.chatting_channels.dm_channels[i].name == data.channel_id) {
        const tempUser = currentUser;
        tempUser.chatting_channels.dm_channels[i].lastReadIndex = data.lastReadIndex;
        console.log("updateLastReadIndex");
        setCurrentUser(tempUser);
      }
    }
  }

  function parseIncomingMessage(msg) {
    const regex = /CSD:(.*):(.*):(.*)/g;
    const parsedString = regex.exec(msg);

    // console.log("received mssg="+msg);
    return parsedString;
  }

  async function pushCurrentChannelToDB(channelInfo) {
    return new Promise(async (resolve) => {
      // we don't update initial value;
      // if(numOfMsgHistory==0) resolve("no history");

      // update last read index
      // note: What't the proper index value?
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

      if (dmChannelContexts[channelInfo.channelName] != undefined) {
        if (dmChannelContexts[channelInfo.channelName].chattingHistory.length == 0) {
          resolve('no history');
        }

        const data = {
          channel_id: channelInfo.channelName,
          lastReadIndex: dmChannelContexts[channelInfo.channelName].chattingHistory.length
        };

        const result = await axios.post('/LS_API/chatting/update', data)
          .then((result) => {
            updateLastReadIndex(data);
            resolve('successful update');
          })
          .catch((err) => { console.log(err); resolve('posting error'); });
      } else {
        //console.warn(`!!!! Channel Context is not created yet !!! channel name = ${channelInfo.channelName}`);
        resolve("channel doesn't exist");
      }
    });
  }

  async function switchChattingChannel(channelInfo, bNeedLoadChattingDatabase) {
    // save some of information back to database
    //console.warn(`switchChattingChannel:${JSON.stringify(channelInfo)}`);
    pushCurrentChannelToDB(channelInfo).then((result) => {
      setCurrChannelInfo(channelInfo);
    });
  }

  // direction:
  //  + 0: sent from current user
  //  + 1: receive from others
  function updateChatContext(msg, channelName, channeType, direction, username) {
    // console.log("updateChatContext, channelName = " + channelName);

    if (channelName == null) {
      console.warn('channelName is Null');
      return;
    }

    if (dmChannelContexts[channelName] == undefined) {
      console.warn("current channel doesn't have any context created yet");
      return;
    }

    const channelContexts = dmChannelContexts;

    let chatHistory = channelContexts[channelName].chattingHistory;

    const now = new Date();

    const currentChat = {
      message: msg, timestamp: `${now.toDateString()} ${now.toLocaleTimeString()}`, direction, username
    };

    chatHistory = [...chatHistory, currentChat];
    channelContexts[channelName].chattingHistory = chatHistory;

    // ISEO-TBD:
    // Need to data needed for contact summary as well.
    // <note> What about active channel?
    const lastReadIndex = getLastReadIndex(channelName);

    channelContexts[channelName].flag_new_msg = checkIfAnyNewMsg(lastReadIndex, channelContexts[channelName].chattingHistory);
    channelContexts[channelName].msg_summary = `${msg.slice(0, 25)}...`;
    channelContexts[channelName].datestamp = now.toDateString();


    // console.log("Send Chat Message: current channel name= " + channelName);
    // console.log("Send Chat Message: msg= " + msg);
    // console.log("history length = " + channelContexts[channelName].chattingHistory.length);

    // set the global indicator as well.
    if (channelContexts[channelName].flag_new_msg == true) {
      if(processChattingChannelName(channelName).type==="general")
      {
        setNewMsgArrived(true);
      }
      else
      {
        setNewMsgArrivedListingChannel(true);
      }
    }

    setChannelContexts(channelContexts);
    setMsgCounter(msgCounter + 1);
    // console.log("current chat history = " + JSON.stringify(channelContexts[channelName].chattingHistory[chatHistory.length-1]));
  }

  function checkNewlyLoaded() {
    const previousValue = flagNewlyLoaded;

    if (flagNewlyLoaded == true) {
      // console.log("Resetting newly loaded flag");
      setFlagNewlyLoaded(false); // We will reset always when it's read.
    }
    return flagNewlyLoaded;
  }

  function getChattingHistory() {
    // console.log("getChattingHistory of " + currChannelInfo.channelName);

    if (currChannelInfo.channelName == null || dmChannelContexts[currChannelInfo.channelName] === undefined) {
      // no history
      return [];
    }

    // console.log("Channel was found!!");
    return dmChannelContexts[currChannelInfo.channelName].chattingHistory;
  }

  function updateChatHistory(msg, local) {
    //console.warn("updateChatHistory");
    if (local == true) {
      // sending to chat server
      //
      // need to append header
      // @CSD:channel_id:sender_name:msg
      // chatSocket.send(''.concat("CSD:{currChannelInfo.channelName}:", msg));
      chatSocket.send(`CSD:${currChannelInfo.channelName}:${currentUser.username}:${msg}`);
      setWaitMessage(true);
      // it will echo locally added messages.
      // how to filter it out then? Server should not forward it back to me?
      // const newHistory = [...chattingHistory, msg];
      // addMsgToChatHistory(newHistory);

      // let's add to new DBs
      // <note> I find it very inefficient...
      // we have to copy things all the time??
      updateChatContext(msg, currChannelInfo.channelName, 0, 0, currentUser.username);
    } else {
      alertSound.play();
      const processedMsg = parseIncomingMessage(msg);

      if(processedMsg!==null)
      {
        // <note>
        // processedMsg[1]: channel information.
        // processedMsg[2]: sender name
        // processedMsg[3]: message
        // console.log("Message for channel ID = " + processedMsg[1]);

        // const newHistory = [...chattingHistory, processedMsg[2]];
        // addMsgToChatHistory(newHistory);
        //console.warn("message"+processedMsg[3]);
        let _channelId = parseChattingChannelName(processedMsg[1]);

        if(_channelId!==null)
        {
          //console.warn("childListingId: " + _channelId);
          if(doNotDisturbMode===false)
          {
            if(_channelId==="parent")
            {
              //console.warn("focusParentListing");
              focusParentListing();
            }
            else
            {
              //console.warn("setChildIndexByChannelId");
              setChildIndexByChannelId(_channelId);
            }
          }
          else
          {
            // What do we do in this case?
            // let's save the last channelId and move it to the channel when the mode is changed
            setChannelWithLatestMessage(_channelId);
          }
        }
        else
        {
          console.warn("No child index found");
        }
        updateChatContext(processedMsg[3], processedMsg[1], 0, 1, processedMsg[2]);
      }
      else
      {
        //console.warn('Got control message');
        // need to refresh the currentListing.
        reloadChattingDbWithCurrentListing();
      }
    }
  }

  function getDmChannelId(friend_name) {
    if (currentUser == null) return '';

    const dmChannelNameSuffix = (currentUser.username > friend_name)
      ? `${friend_name}-dm-${currentUser.username}`
      : `${currentUser.username}-dm-${friend_name}`;

    let dmChannelNamePrefix = '';

    if (chattingContextType != 0) {
      dmChannelNamePrefix = currentListing._id + ((chattingContextType == 1) ? '-parent-'
        : `-child-${currentListing.child_listings[childIndex].listing_id._id}-`);
    }

    // console.log("getDmChannelId: current child index = " + childIndex);
    // console.log("getDmChannelId: channel prefix = " + dmChannelNamePrefix);

    return (dmChannelNamePrefix + dmChannelNameSuffix);
  }

  function getDmChannel(friend_name) {
    // console.log(`getDmChannel: friend_name = ${friend_name}`);
    const dmChannel = {
      channel_id:
                     getDmChannelId(friend_name),
      members: []
    };

    dmChannel.members.push(friend_name);
    dmChannel.members.push(currentUser.username);

    return dmChannel;
  }

  function getListOfChatChannels() {
    // console.log("getListOfChatChannels");
    // ISEO-TBD: child_listings available only for tenant listing now.
    const _listArray = [friendsList,
      (currentListing != undefined)
        ? currentListing.shared_user_group : null,
      (currentListing != undefined && currentListing.listingType == 'tenant' && currentListing.child_listings[childIndex] != undefined)
        ? currentListing.child_listings[childIndex].shared_user_group : null
    ];

    const chatChannels = [];

    try {
      for (let i = 0; i < _listArray[chattingContextType].length; i++) {
        const _currUser = _listArray[chattingContextType][i];

        if (_currUser.username != currentUser.username) {
          chatChannels.push(getDmChannel(_currUser.username));
        }
      }

      // group channels
      // 1. parent level
      if (chattingContextType == 1) {
        for (let lindex = 0;
          lindex < currentListing.list_of_group_chats.length;
          lindex++) {
          const chatInfo = {
            channel_id: currentListing.list_of_group_chats[lindex].channel_id,
            members: []
          };

          for (let findex = 0;
            findex < currentListing.list_of_group_chats[lindex].friend_list.length;
            findex++) {
            chatInfo.members.push(currentListing.list_of_group_chats[lindex].friend_list[findex].username);
          }

          chatChannels.push(chatInfo);
        }
      } else if (chattingContextType == 2) { 
      // console.log("childIndex = " + childIndex);

        // console.log("currentListing=" + JSON.stringify(currentListing));

        // console.log("list_of_group_chats.length = " + currentListing.child_listings[childIndex].list_of_group_chats.length);

        for (let lindex = 0;
          lindex < currentListing.child_listings[childIndex].list_of_group_chats.length;
          lindex++) {
          const chatInfo = {
            channel_id: currentListing.child_listings[childIndex].list_of_group_chats[lindex].channel_id,
            members: []
          };

          // console.log("friend_list.length = " + currentListing.child_listings[childIndex].list_of_group_chats[lindex].friend_list.length);

          for (let findex = 0;
            findex < currentListing.child_listings[childIndex].list_of_group_chats[lindex].friend_list.length;
            findex++) {
            chatInfo.members.push(currentListing.child_listings[childIndex].list_of_group_chats[lindex].friend_list[findex].username);
          }

          chatChannels.push(chatInfo);
        }
      }
    } catch (err) {
      console.warn(err);
    }

    console.log(`chatChannels = ${JSON.stringify(chatChannels)}`);

    return chatChannels;
  }

  function getLastReadIndex(channel_id) {
    const channel_name = (channel_id != '' ? channel_id : currChannelInfo.channelName);

    // console.log("channel_name = " + channel_name);

    // ISEO: let's consider introducing map instead?
    for (let i = 0; i < currentUser.chatting_channels.dm_channels.length; i++) {
      // console.log("current channel = " + currentUser.chatting_channels.dm_channels[i].name);
      if (currentUser.chatting_channels.dm_channels[i].name == channel_name) {
        // note: This value may contain old data.
        // let's use context information instead
        return currentUser.chatting_channels.dm_channels[i].lastReadIndex;
      }
    }

    return 0;
  }

  function buildHistoryFromDb(history) {
    let reactChatHistory = [];

    for (let i = 0; i < history.length; i++) {
      const date = new Date(history[i].timestamp);

      const curChat = {
        message: history[i].message,
        username: history[i].writer,
        timestamp: `${date.toDateString()} ${date.toLocaleTimeString()}`,
        datestamp: date.toDateString(),
        direction: ((history[i].writer == currentUser.username) ? 0 : 1)
      };

      // console.log("buildHistoryFromDb: writer = " + history[i].writer);

      reactChatHistory = [...reactChatHistory, curChat];
    }

    return reactChatHistory;
  }

  function checkIfAnyNewMsg(lastReadIndex, chatHistory) {
    // <note> lastReadIndex has the value of the next message to saved in the chat history
    // So it has read all the messages if it equals to the length.
    // console.log("checkIfAnyNewMsg: direction of last message" + chatHistory[chatHistory.length-1].direction);
    // console.log("checkIfAnyNewMsg: lastReadIndex = " + lastReadIndex + " history length = " + chatHistory.length);

    if (lastReadIndex == chatHistory.length) {
      return false;
    }

    // return TRUE only if the direction of message is received.
    // <note> In some cases, the DB is not updated yet.
    // At least we should keep both message window and summary window in sync.
    // Let's check if there is any received message in between lastReadIndex and the last message
    for (let index = chatHistory.length - 1; index >= lastReadIndex; index--) {
      if (chatHistory[index].direction == 1) return true;
    }
    return false;
  }

  function checkIfAnyNewMsgArrived() {
    return newMsgArrived;
  }


  function checkIfAnyNewMsgArrivedListingChannel() {
    return newMsgArrivedListingChannel;
  }

  function loadChatHistory(channel_id, history) {
    // console.log("loadChatHistory: currChannelInfo.channelName = " + currChannelInfo.channelName);

    // It's a special flag to indicate that the channel history is loaded.
    if (currChannelInfo.channelName == channel_id) {
      // console.log("setFlagNewlyLoaded!!!!!");
      setFlagNewlyLoaded(true);
    }

    // update channel DB in react side
    const lastReadIndex = getLastReadIndex(channel_id);
    const dmChannel = {
      channel_id,
      channel_type: 0,
      last_read_index: lastReadIndex,
      chattingHistory: buildHistoryFromDb(history)
    };

    if (dmChannel.chattingHistory.length) {
      dmChannel.flag_new_msg = checkIfAnyNewMsg(lastReadIndex, dmChannel.chattingHistory);
      dmChannel.msg_summary = `${dmChannel.chattingHistory[dmChannel.chattingHistory.length - 1].message.slice(0, 25)}...`;
      dmChannel.datestamp = dmChannel.chattingHistory[dmChannel.chattingHistory.length - 1].datestamp;

      if (dmChannel.flag_new_msg == true) {
        if(processChattingChannelName(channel_id).type==="general")
        {
          setNewMsgArrived(true);
        }
        else
        {
          setNewMsgArrivedListingChannel(true);
        }
      }
    }

    // console.log("dmChannelContexts: length before = " + dmChannelContexts.length);

    const dmChannelContextArray = dmChannelContexts;

/*
    if (dmChannelContextArray[channel_id] != undefined) {
      console.warn(`channel_id${channel_id} is already in the array `);
    } else {
      // console.log("channel_id" + channel_id +" is being added ");
    }*/

    dmChannelContextArray[channel_id] = dmChannel;

    setChannelContexts(dmChannelContextArray);
    setChannelContextLength(Object.keys(dmChannelContextArray).length);
  }

  // loading chatting database from backend
  async function loadChattingDatabase() {
    console.log("loadChattingDatabase");

    if (currentUser == undefined) {
      // console.log("currentUser is not set yet");
      return;
    }

    // console.log("currChannelInfo.channelName = " + currChannelInfo.channelName);

    // clear new message arrival;
    setNewMsgArrived(false);
    setNewMsgArrivedListingChannel(false);

    // note: it will be good time to register the user again?
    
    // ISEO-TBD: need to load group chatting as well.
    const chatChannel = getListOfChatChannels();

    // console.log("number of channels = " + chatChannel.length);

    // go through each channel and load chatting history if any.
    // we need to create the channel if it doesn't exist yet.
    for (let i = 0; i < chatChannel.length; i++) {
      const data = {
        channel_id: chatChannel[i].channel_id,
        channel_type: 0,
        members: chatChannel[i].members
      };

      // console.log("creating channels = " + chatChannel[i].channel_id);

      // note: problem in handling the result!!
      const result = await axios.post('/LS_API/chatting/new', data)
        .then((result) => {
          // console.log(result.data);

          if (result.data.bNewlyCreated == false) {
            // update channel DB using the history data
            // console.log("result = " + result);

            // console.log("not a newly created channel");
            // <note> channel could be null if it's a duplicate case.
            if(result.data.channel!==null)
            {
              const channelData = {
                channel_id: result.data.channel.channel_id,
                channel_type: result.data.channel.channel_type,
                last_read_index: getLastReadIndex(result.data.channel.channel_id)
              };

              loadChatHistory(chatChannel[i].channel_id, result.data.channel.chat_history);

              // ISEO-TBD-1227
              // CSC:Register will be needed even if it's existing channel
              try {
                //console.warn("CSC: register for username + " + currentUser.username);

                chatSocket.send(`CSC:Register:${currentUser.username}`);
              } catch (error) {
                console.error(error);
              } 
            }
          } else {
            loadChatHistory(chatChannel[i].channel_id, []);

            // <note> registration should work after chattting channel is created first.
            try {
              //console.warn("CSC: register for username + " + currentUser.username);

              chatSocket.send(`CSC:Register:${currentUser.username}`);
            } catch (error) {
              console.error(error);
            } 
          }
        })
        .catch(err => console.warn(err));
    }
  }

  // <note> obsolete function.
  function switchDmByFriendName(name) {
    const channelInfo = {
      channelName: getDmChannelId(name),
      dm: {
        name,
        distance: 1
      }
    };
    switchChattingChannel(channelInfo, false);
  }


  // const [selectedChatList, setSelectedChatList] = useState([]);

  function addToChatList(_friend) {
    const tempList = [...selectedChatList];
    tempList.push(_friend);
    setSelectedChatList(tempList);
  }

  function removeFromChatList(_friend) {
    const tempList = selectedChatList.filter(chatParty => chatParty.username != _friend.username);
    setSelectedChatList(tempList);
  }

  function resetChatList() {
    setSelectedChatList([]);
  }

  useEffect(() => {
    //console.log("currChannelInfo updated");
    //console.warn('ISEO: Loading chatting database... ');
    //ISEO-TBD: I can't believe it. Why it doesn't have up to date currentListing yet?
    setTimeout(()=> loadChattingDatabase(), 1000);
  }, [currChannelInfo]);


  useEffect(() => {
    console.log("channelContextLength updated");
    //console.warn('ISEO: Loading chatting database... ');
    //ISEO-TBD: I can't believe it. Why it doesn't have up to date currentListing yet?
    //setTimeout(()=> loadChattingDatabase(), 4000);
  }, [channelContextLength]);


  useEffect(() => {

    if(doNotDisturbMode===false && channelWithLatestMessagae!==null )
    {
      if(channelWithLatestMessagae==="parent")
      {
        //console.warn("focusParentListing");
        focusParentListing();
      }
      else
      {
        //console.warn("setChildIndexByChannelId");
        setChildIndexByChannelId(channelWithLatestMessagae);
      }
    }

  }, [doNotDisturbMode]);

  /*useEffect(() => {
    //console.warn('ISEO: Loading chatting database... ');
    loadChattingDatabase();
  }, [currChannelInfo, channelContextLength]);*/

  // loadChattingDatabase should be called by currentListing first.
  // currChannelInfo could trigger loadChattingDatabase, but we should ensure the listing is updated.
  useEffect(() => {
    //console.log("CurrentListing is just updated");
    setTimeout(()=> loadChattingDatabase(), 500);
  }, [currentListing]);

  webSocketConnect();

  return (
    <MessageContext.Provider value={{
      currChannelInfo,
      setCurrChannelInfo,
      dmChannelContexts,
      getLastReadIndex,
      switchDmByFriendName,
      switchChattingChannel,
      getDmChannelId,
      getChattingHistory,
      updateChatHistory,
      loadChattingDatabase,
      checkNewlyLoaded,
      checkIfAnyNewMsgArrived,
      checkIfAnyNewMsgArrivedListingChannel,
      addContactList,
      getContactList,
      setChattingContextType,
      chattingContextType,
      setChildType,
      setChildIndex,
      childIndex,
      channelContextLength,
      currentChatPartyPicture,
      setCurrentChatPartyPicture,
      addToChatList,
      removeFromChatList,
      resetChatList,
      selectedChatList,
      postSelectedContactList,
      reset,
      msgCounter,
      refreshUserDataFromMessageContext,
      reloadChattingDbWithCurrentListing,
      deregisterSocket,
      setDoNotDisturbMode
    }}
    >
      {props.children}
    </MessageContext.Provider>
  );
}
