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
const uuidv4 = require('uuid/v4');
const WebSocket = require('ws');
const chatDbHandler = require('./db_utilities/chatting_db/access_chat_db');
const userDbHandler = require('./db_utilities/user_db/access_user_db');

const DASHBOARD_AUTO_REFRESH = 0;

// const wss = new WebSocket.Server({ port: 3030});
let wss = null;

// MAP: user/channelID/socket
// ISEO-TBD: is there any map to manage per user?
const socketToUserMap = [];
const userToSocketMap = [];
const channelIdToSocketList = [];
const socketToChannelIdMap = [];

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
    console.log(`Updating socketToUserMap for user = ${user_name}`);

    userToSocketMap[user_name] = [...userToSocketMap[user_name], currentSocket];

    socketToUserMap[currentSocket.id] = user_name;
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
  const regex = /CSD:(.*):(.*):(.*)/g;
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
      // console.log(`addSocketToChannel, channel = ${channelId}`);
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


function getListOfSocketsByChannelId(channelId) {
  return channelIdToSocketList[channelId];
}

function processChatMsgHeader(data) {
  let targetSockets = [];

  const { channel_id, sender, msg } = parseChatMsgHeader(data);

  if (channel_id == undefined) {
    console.log('No channelID has been identified');
    return { targets: null, id: channel_id, message: msg };
  }

  // console.log("channel found. channel ID = " + channel_id)
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
      // console.log("Writer = " + socketToUserMap[incomingSocket.id]);

      const chat = { writer: socketToUserMap[incomingSocket.id], message, timestamp: Date.now() };
      channel.chat_history.push(chat);
      channel.save();

      if (targets == undefined) {
        console.warn(`No socket available for channel ID = ${id}`);
        return;
      }

      targets.forEach((target) => {
        if (target != incomingSocket && target.readyState === WebSocket.OPEN) {
          console.log("forwarding the packet");
          target.send(data);
        } else {
          // console.log("Same socket");
        }
      });
    });
  } else {
    console.warn('No chatting channel found with given channel ID');
  }
}

function sendDashboardControlMessage(command, userNameList) {
  try {
    switch (command) {
      case DASHBOARD_AUTO_REFRESH:
        userNameList.forEach((name) => {
          // console.log(`sending control message to user = ${name}`);
          if (userToSocketMap[name] !== undefined) {
            userToSocketMap[name].forEach((_socket) => {
              // console.log('sending control message');
              _socket.send('CSC:0');
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

function sendDashboardControlMessageToSingleUser(command, userName) {
  switch (command) {
    case DASHBOARD_AUTO_REFRESH:
      if (userToSocketMap[userName] !== undefined) {
        userToSocketMap[userName].forEach((_socket) => {
          // console.log('sending control message');
          _socket.send('CSC:0');
        });
      }
      break;
    default: console.warn('Unknown command'); break;
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

    foundUser.chatting_channels.dm_channels.forEach((channel) => {
      console.log(`current channel name = ${channel.name}`);
      // found the partial matching
      if (channel.name.search(channel_id) != -1) {
        // remove the chatting channel from chatting server.
        removeChannel(channel.name);
      } else {
        new_dm_channels.push(channel);
      }
    });

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
  chatServerMain, removeChannel, removeChannelFromUserDb, sendDashboardControlMessage, sendDashboardControlMessageToSingleUser, DASHBOARD_AUTO_REFRESH
};
