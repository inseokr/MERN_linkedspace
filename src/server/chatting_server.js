// It will not send the message to the source of this message.
// But how do we know where to send it if there are many other sockets?
// 1. need to identify the socket or group of sockets based on source/destination of chatting messages
// <note1> We need to maintain a mapping table between ws and user.
// This may need a registration message.
// <note2> Message may need destination and it could be either
// + direct channel
// + group channel
// + special channel like posting related
// <question> how to maintain the ID of chatting channel?
// 1. who will create it?
// : It should be whoever first initiates the conversation.
// 2. what kind of value will be assigned?
// : This ID will be used a key to keep the chatting history. So it should be unique.
// 1.1 direct channel
// : a pair of user IDs. example> iseo-justin-dm
// <note> First user user name will be determined by the string comparision
//  "iseo" < "justin"
// <q1> what if the user name got changed?? yeah.. we need to update database then.
// 1.2 group channel
// <note> the participants could be modified dynamically? and this information should be kept
// inside the database.
// : initiating_user-gm-[group_channel_index], example> iseo-gm-1
// <note> We may need to get the available index from database?
// This information should be obtained when the main messaging page is opened.
// <note> Any concurrency issue? what if multiple servers are trying to allocate a group channel?
// <note> I guess the ID should be created and maintained by client, not the server.
// Server may keep any necessary information in the database.
// <QUESTION> Probably it's better that we use API to manage chatting room instead of using socket
// channel? That's true... However message may need to include header still to route it properly?
// 1.3 special channel
// import { Expo } from 'expo-server-sdk';
const { Expo } = require('expo-server-sdk');

const uuidv4 = require('uuid/v4');
const WebSocket = require('ws');
const chatDbHandler = require('./db_utilities/chatting_db/access_chat_db');
const userDbHandler = require('./db_utilities/user_db/access_user_db');

const DASHBOARD_AUTO_REFRESH = 0;
const DASHBOARD_CTRL_SET_MODE_NORMAL = 1;
const DASHBOARD_CTRL_SET_MODE_LOCKED = 2;
const DASHBOARD_AUTO_REFRESH_EVENT = 3;
const DASHBOARD_GET_LOCATION = 4;
const DASHBOARD_REPORT_LOCATION = 5;


const controlCodeStrings = 
  [
    'CSC:autoRefresh', 
    'CSC:setModeNomal', 
    'CSC:setModeLocked', 
    'CSC:autoRefreshEvent', 
    'CSC:getLocation',
    'CSC:reportLocation',
  ];

// const wss = new WebSocket.Server({ port: 3030});
let wss = null;

// MAP: user/channelID/socket
// ISEO-TBD: is there any map to manage per user?
const socketToUserMap = [];
const userToSocketMap = [];
const channelIdToSocketList = [];
const socketToChannelIdMap = [];

// input: channel_name(name of chatting channel)
// output: list of user name
function parseChannelName(channel_name)
{
  function parseUserList(listOfUserString) {
    // check if DM or group channel
    let parsedListOfUser = listOfUserString.match(/(.*)-dm-(.*)/);

    if(parsedListOfUser===null) {
      // group channel
      userList = listOfUserString.split('-');
      return userList;
    }
    else {
      // DM case
      userList.push(parsedListOfUser[1]);
      userList.push(parsedListOfUser[2]);

      return userList;
    }
  }

  // 1. check if it's a parent or child
  let parsedChannelName = channel_name.match(/(.*)-child-([^-]*)-(.*)/);
  let userList = [];

  // parent channel
  if(parsedChannelName===null) {
    // check if it's parent chatting channel
    parsedChannelName = channel_name.match(/(.*)-parent-(.*)/);

    return (parseUserList(parsedChannelName[2]));
  }
  // handling child chatting channel
  else {
    // result[3] contains the list of user name separate by '-' if it's group or 
    // 2 user separated by dm, example> iseo-dm-yoobin
    return (parseUserList(parsedChannelName[3]));
  }
}

async function actualPush(expo, chunks) {
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      //console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }
}

function sendPushNotification(userName, channelName) {
  if (userName === null) {
    return;
  }

  userDbHandler.getUserByName(userName).then((foundUser) => {
    const pushToken = foundUser.expoPushToken;

    const expo = new Expo();
    // Create the messages that you want to send to clients
    const messages = [];

    //console.warn('sendPushNotification');

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: 'default',
      body: 'You\'ve got a new message from LinkedSpaces',
      data: { channelId: channelName },
    });

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    const chunks = expo.chunkPushNotifications(messages);
    actualPush(expo, chunks);
  });
}



function sendLocationRequestNotification(userName, requesterName, eventSummary, eventId) {
  if (userName === null || requesterName === null ) {
    return;
  }

  userDbHandler.getUserByName(userName).then((foundUser) => {
    const pushToken = foundUser.expoPushToken;

    const expo = new Expo();
    // Create the messages that you want to send to clients
    const messages = [];

    //console.warn('sendPushNotification');

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken,
      sound: 'default',
      body: `${requesterName} asks your current location - ${eventSummary}@LinkedSpaces`,
      data: { id: 'LocationRequestNotification', eventId: eventId },
    });

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    const chunks = expo.chunkPushNotifications(messages);
    actualPush(expo, chunks);
  });
}

async function registerSocketToChannels(currentSocket, user_name) {
  const channels = await chatDbHandler.getChannels(user_name);

  // ISEO-TBD: we should register listing related channels as well
  channels.dm_channels.forEach((channel) => {
    // console.warn(`adding user=${user_name} to channel=${channel.name}`);
    addSocketToChannel(channel.name, currentSocket);
  });
}

function updateUserSocketMap(currentSocket, user_name) {
  let bDuplicate = false;
  // <note> The socket list should be dynamically updated.
  // How to remove a specific socket from the list then?
  // We may have multiple sockets?
  // check if the user_name exists in the array
  if (userToSocketMap[user_name] == undefined) {
    userToSocketMap[user_name] = [currentSocket];
  } else {
    userToSocketMap[user_name].forEach((socket) => {
      if (currentSocket.id === socket.id) {
        bDuplicate = true;
      }
    });
  }

  if (bDuplicate === false) {
    console.warn(`Updating socketToUserMap for user = ${user_name}`);

    userToSocketMap[user_name] = [...userToSocketMap[user_name], currentSocket];
    socketToUserMap[currentSocket.id] = user_name;

    // <note> let's update the status of user to online
    userDbHandler.updateLoggedInStatus(user_name, 'online');
  }

  // <TBD> When is the right point to do this?
  // We may consult DB here and get the list of channels for this user and update it.
  registerSocketToChannels(currentSocket, user_name);
}

function handleCtrlMsg(rxMsg) {
  const regex = /CSC:(.*):(.*)/g;
  const parsedString = regex.exec(rxMsg);

  // <note> parsedString will have "null/undefined" if pattern is not found.
  // parsedString[0]: whole string
  // parsedString[1]: Ctrl message type, [Register]
  // parsedString[2]:
  // + Register
  //   user name
  return parsedString;
}

function parseChatMsgHeader(data) {
  // how to deal with a situations the message will contain n number of ":"?
  const regex = /CSD:([^:]*):([^:]*):(.*)/g;
  const parsedString = regex.exec(data);

  return { channel_id: parsedString[1], sender: parsedString[2], msg: parsedString[3] };
}

function addUserToChannel(channelId, user) {
  addSocketToChannel(channelId, userToSocketMap[user]);
}


function addSocketToChannel(channelId, socket_) {
  let bDuplicate = false;

  if (channelIdToSocketList[channelId] == undefined) {
    channelIdToSocketList[channelId] = [socket_];
  } else {
    // check if there is any duplicate
    // ISEO-TBD: why it's not handling duplicate.
    channelIdToSocketList[channelId].forEach((socket) => {
      if (socket.id == socket_.id) {
        // console.log('duplciate sockets');
        bDuplicate = true;
      }
    });

    if (bDuplicate === false) {
      channelIdToSocketList[channelId] = [...channelIdToSocketList[channelId], socket_];
      // console.warn(`addSocketToChannel, channel = ${channelId}, socket= ${socket_}`);
    }

    // console.log(`length = ${channelIdToSocketList[channelId].length}`);
  }


  // Update socketToChannelIdMap
  if (socketToChannelIdMap[socket_.id] == undefined) {
    socketToChannelIdMap[socket_.id] = [channelId];
  } else if (bDuplicate === false) {
    socketToChannelIdMap[socket_.id] = [...socketToChannelIdMap[socket_.id], channelId];
  }
}

function removeSocketToChannel(channelId, socket_) {
  // remove the socket from the list.
  let newList = [];

  if (channelIdToSocketList[channelId] == 'undefined') {
    console.warn(`channelId=${channelId} is not defined yet`);
    return;
  }

  try {
    channelIdToSocketList[channelId].forEach((socket) => {
      if (socket.id != socket_.id) newList = [...newList, socket];
    });

    channelIdToSocketList[channelId] = newList;
  } catch (err) {
    console.log('removeSocketToChannel: error = {err}');
  }
}

function updateSocketMap(oldId, newId) {
  // 1. update channelIdToSocketList
  // <note> how to remove old one?
  //console.warn(`updateSocketMap: oldId=${oldId}`);
  channelIdToSocketList[newId] = channelIdToSocketList[oldId];
  //delete channelIdToSocketList[oldId];
  //console.warn(`updateSocketMap: channelIdToSocketList=${JSON.stringify(channelIdToSocketList[newId])}`);

  // 2. update socketToChannelIdMap
  if(channelIdToSocketList[newId]) {
    channelIdToSocketList[newId].forEach((socket) => {
      // let's remove old channel from the list
      if(socketToChannelIdMap[socket.id]) {
        socketToChannelIdMap[socket.id] = socketToChannelIdMap[socket.id].filter(item => item != oldId);
        socketToChannelIdMap[socket.id] = [...socketToChannelIdMap[socket.id], newId];
      }
    });

  }

}

function getListOfSocketsByChannelId(channelId) {
  return channelIdToSocketList[channelId];
}

function processChatMsgHeader(data) {
  let targetSockets = [];

  const { channel_id, sender, msg } = parseChatMsgHeader(data);

  if (channel_id == undefined) {
    console.warn('No channelID has been identified');
    return { targets: null, id: channel_id, message: msg };
  }

  targetSockets = getListOfSocketsByChannelId(channel_id);
  return {
    targets: targetSockets, id: channel_id, sender, message: msg
  };
}

function routeMessage(data, incomingSocket) {
  const {
    targets, id, sender, message
  } = processChatMsgHeader(data);

  // find the channel DB entry with given channelId
  if (id != null) {
    chatDbHandler.findChatChannel(id).then((channel) => {
      if (channel == null) {
        console.log("Channel couldn't be found");
        return;
      }
      // add to history
      console.log(`Writer = ${socketToUserMap[incomingSocket.id]}`);

      const chat = { writer: socketToUserMap[incomingSocket.id], message, timestamp: Date.now() };
      channel.chat_history.push(chat);
      channel.save();

      if (targets == undefined) {
        console.warn(`No socket available for channel ID = ${id}`);
        return;
      }

      targets.forEach((target) => {
        if (target != incomingSocket && target.readyState === WebSocket.OPEN) {
          //console.warn('sending PUSH notification');
          target.send(data);
        } else {
          // console.warn('Same Socket??');
        }
      });

      // send notification
      let userList = parseChannelName(channel.channel_id);
      userList.forEach((user) => {
        if(socketToUserMap[incomingSocket.id]!==user) {
          //console.warn(`sendPushNotification to user =${user}`);
          sendPushNotification(user, channel.channel_id);
        }        
      });
    });


  } else {
    console.warn('No chatting channel found with given channel ID');
  }
}


function sendDashboardControlMessage2SharedGroup(command, shared_user_group, senderName=null) {
  // console.warn(`sendDashboardControlMessage: command=${command}, userNameList=${JSON.stringify(userNameList)}`);
  try {
    switch (command) {
      case DASHBOARD_AUTO_REFRESH:
      case DASHBOARD_CTRL_SET_MODE_LOCKED:
      case DASHBOARD_CTRL_SET_MODE_NORMAL:
        shared_user_group.forEach((user) => {
          // console.log(`sending control message to user = ${name}`);
          if (userToSocketMap[user.username] !== undefined && user.username!==senderName) {
            userToSocketMap[user.username].forEach((_socket) => {
              // console.log('sending control message');
              _socket.send(controlCodeStrings[command]);
            });
          }
        });
        break;
      default: console.warn('Unknown command'); break;
    }
  } catch (error) {
    console.warn(`sendDashboardControlMessage: error${error}`);
  }
}


function sendDashboardControlMessage(command, userNameList, senderName=null) {
  //console.warn(`sendDashboardControlMessage: command=${command}, userNameList=${JSON.stringify(userNameList)}`);
  try {
    switch (command) {
      case DASHBOARD_AUTO_REFRESH:
      case DASHBOARD_AUTO_REFRESH_EVENT:
      case DASHBOARD_CTRL_SET_MODE_LOCKED:
      case DASHBOARD_CTRL_SET_MODE_NORMAL:
        userNameList.forEach((name) => {
          //console.log(`sending control message to user = ${name}`);
          if (userToSocketMap[name] !== undefined && name!==senderName) {
            userToSocketMap[name].forEach((_socket) => {
              //console.log('sending control message');
              _socket.send(controlCodeStrings[command]);
            });
          }
        });
        break;
      default: console.warn('Unknown command'); break;
    }
  } catch (error) {
    console.warn(`sendDashboardControlMessage: error${error}`);
  }
}

function sendDashboardControlMessageToSingleUser(command, userName, param=null) {
  switch (command) {
    case DASHBOARD_AUTO_REFRESH:
    case DASHBOARD_AUTO_REFRESH_EVENT:
    case DASHBOARD_CTRL_SET_MODE_LOCKED:
    case DASHBOARD_CTRL_SET_MODE_NORMAL:
      if (userToSocketMap[userName] !== undefined) {
        userToSocketMap[userName].forEach((_socket) => {
          // console.log('sending control message');
          // add parameters if any
          if(param!==null) {
            let commandString = controlCodeStrings[command] + '@' + JSON.stringify(param);
            _socket.send(commandString);
          }
          else {
            _socket.send(controlCodeStrings[command]);
          }
        });
      }
      break;
    default: console.warn('Unknown command'); break;
  }
}

function sendToSingleUser(command, userName, param=null) {
  switch (command) {
    case DASHBOARD_AUTO_REFRESH:
    case DASHBOARD_AUTO_REFRESH_EVENT:
    case DASHBOARD_CTRL_SET_MODE_LOCKED:
    case DASHBOARD_CTRL_SET_MODE_NORMAL:
      if (userToSocketMap[userName] !== undefined) {
        userToSocketMap[userName].forEach((_socket) => {
          // console.log('sending control message');
          // add parameters if any
          if(param!==null) {
            let commandString = controlCodeStrings[command] + '@' + JSON.stringify(param);
            _socket.send(commandString);
          }
          else {
            _socket.send(controlCodeStrings[command]);
          }
        });
      }
      break;
    default: console.warn('Unknown command'); break;
  }
}


function getLocation(eventId, userList, initiator, eventSummary) {

  userList.forEach((user)=> {
    let username = user.username;
    if(username!==initiator && userToSocketMap[username] !== undefined) {
      sendLocationRequestNotification(username, initiator, eventSummary, eventId);
      userToSocketMap[username].forEach((_socket) => {
         let commandString = controlCodeStrings[DASHBOARD_GET_LOCATION] + '@' + JSON.stringify({id: eventId, requester: initiator});
         _socket.send(commandString);
      });

    }
  });
}


function sendUserLocation(eventId, targetUserName, reportingUserName, location) {

  if(userToSocketMap[targetUserName]) {
    userToSocketMap[targetUserName].forEach((_socket) => {
      let commandString = controlCodeStrings[DASHBOARD_REPORT_LOCATION] + '@' + JSON.stringify({id: eventId, user: reportingUserName, location: location});
      _socket.send(commandString);
      console.log(`sendUserLocation: ${JSON.stringify({id: eventId, user: reportingUserName, location: location})}`);
   });
  }

}

// remove the socket from all the maps
function removeSocket(socket_) {
  // 0. need to know the asscciated user information from socket
  const userName = socketToUserMap[socket_.id];

  console.warn(`removeSocket: userName = ${userName}`);

  // 1. socketToUserMap
  delete socketToUserMap[socket_.id];

  // 2. userToSocketMap
  // <note> There could be multiple sockets for the same user.
  userToSocketMap[userName] = userToSocketMap.filter(item => item != socket_);

  if ((userName !== undefined) && (userToSocketMap[userName].length === 0)) {
    // console.warn(`No socket available for ${userName}`);
    // let's update login status here.
    // <note> User could be still in logged in status, but no communication channel available.
    // In this case, we will treat it as offline.
    userDbHandler.updateLoggedInStatus(userName, 'offline');
  }

  // 3. channelIdToSocketList
  // <Note> It may need to go through whole channel??
  // <Note> We need to build reverse map as well
  const registeredChannels = socketToChannelIdMap[socket_.id];

  if (registeredChannels != undefined) {
    registeredChannels.forEach(channel => removeSocketToChannel(channel, socket_));
  } else {
    console.warn('removeSocket: socket is not registered yet');
  }
}

function removeChannel(channel_id) {
  const socketList = channelIdToSocketList[channel_id];

  if (socketList == undefined) return;

  socketList.forEach(socket => delete socketToChannelIdMap[socket.id][channel_id]);

  delete channelIdToSocketList[channel_id];

  console.warn(`removeChannel with channel_id = ${channel_id}`);
}

function removeChannelFromUserDb(name, channel_id) {
  userDbHandler.getUserByName(name).then((foundUser) => {
    // console.log("user name: "+name);
    console.log(`channel name to be deleted${channel_id}`);

    console.log(`Previous dm_channels length = ${foundUser.chatting_channels.dm_channels.length}`);

    const new_dm_channels = [];

    for (let index = 0; index < foundUser.chatting_channels.dm_channels.length; index++) {
      const channel = foundUser.chatting_channels.dm_channels[index];
      if (channel.name.search(channel_id) != -1) {
        // remove the chatting channel from chatting server.
        removeChannel(channel.name);
      } else {
        new_dm_channels.push(channel);
      }
    }

    foundUser.chatting_channels.dm_channels = new_dm_channels;
    console.log(`After dm_channels length = ${foundUser.chatting_channels.dm_channels.length}`);
    foundUser.save();
  });
}

function chatServerMain(server) {
  // console.log(`chatServerMain: httpServer = ${JSON.stringify(server)}`);

  // ISEO-TBD: What the heck!!!! Java Script's so fucking strange...
  // I have so wrong assumption around it... dang... it's too flexible, and I've got to be extremely careful about it.
  if (process.env.WS_ENV === 'development') {
    wss = new WebSocket.Server({ port: 3030 });
  } else {
    wss = new WebSocket.Server({ server });
  }

  wss.on('connection', (ws) => {
    ws.id = uuidv4();

    // console.log(`New connection: UUID = ${ws.id}`);

    ws.on('message', (data) => {
      // console.log(`Chat Server: received data = ${data}id = ${ws.id}`);
      // It goes through all sockets registered to this server
      const result = handleCtrlMsg(data);

      if (result != undefined) {
        switch (result[1]) {
          case 'Register':
            // Register the user with current ws
            // <note> we may need to keep 2 separate mapping then?
            // <note> how to handle the case when there are multiple sockets for the same users?
            updateUserSocketMap(ws, result[2]);
            // console.log('Yay, now I could register the socket');
            break;
          case 'DeRegister':
            removeSocket(ws);
            break;
          default: break;
        }
      } else {
        routeMessage(data, ws);
      }
    });

    ws.on('close', () => {
      // ISEO-TBD: Need to remove this socket from all the map.
      // List all the maps to be updated.
      removeSocket(ws);
      console.log('SOCKET IS BEING DISCONNECTED!!!!!!!!!!!!!!!!!!!!');
    });
  });
}


module.exports = {
  chatServerMain,
  removeChannel,
  removeChannelFromUserDb,
  updateSocketMap,
  sendDashboardControlMessage,
  sendDashboardControlMessageToSingleUser,
  sendDashboardControlMessage2SharedGroup,
  getLocation,
  sendUserLocation,
  DASHBOARD_AUTO_REFRESH,
  DASHBOARD_CTRL_SET_MODE_NORMAL,
  DASHBOARD_CTRL_SET_MODE_LOCKED,
  DASHBOARD_AUTO_REFRESH_EVENT
};
