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
const uuidv4 = require('uuid/v4')
const WebSocket = require('ws');
const chatDbHandler = require('./db_utilities/chatting_db/access_chat_db');

const wss = new WebSocket.Server({ port: 3030});

// MAP: user/channelID/socket
// ISEO-TBD: is there any map to manage per user?
var socketToUserMap = [];
var userToSocketMap = [];
var channelIdToSocketList = [];

// ISEO-TBD: this map is not being used
var channelIdToUserList = []; 

function updateUserSocketMap(currentSocket, user_name)
{
    // <note> The socket list should be dynamically updated.
    // How to remove a specific socket from the list then?
    // We may have multiple sockets?
    // check if the user_name exists in the array
    (userToSocketMap[user_name]==undefined) ?
        userToSocketMap[user_name] = [currentSocket] :
        userToSocketMap[user_name] = [...userToSocketMap[user_name], currentSocket];

    console.log("Updating socketToUserMap for user = " + user_name);

    socketToUserMap[currentSocket.id] = user_name;

    // <TBD> When is the right point to do this?
    // We may consult DB here and get the list of channels for this user and update it.
    addSocketToChannel("iseo-dm-justin", currentSocket);
}

function handleCtrlMsg(rxMsg) {
    const regex = /CSC:(.*):(.*)/g;
    let parsedString = regex.exec(rxMsg);

    // <note> parsedString will have "null/undefined" if pattern is not found.
    // parsedString[0]: whole string
    // parsedString[1]: Ctrl message type, [Register]
    // parsedString[2]:
    // + Register
    //   user name
    return parsedString;
}

function parseChatMsgHeader(data)
{
    const regex = /CSD:(.*):(.*):(.*)/g;
    let parsedString = regex.exec(data);

    return {channel_id: parsedString[1], sender: parsedString[2], msg: parsedString[3]};
}

function addUserToChannel(channelId, user)
{
    addSocketToChannel(channelId, userToSocketMap[user]);
}

function addSocketToChannel(channelId, socket_)
{
    (channelIdToSocketList[channelId]==undefined) ?
        channelIdToSocketList[channelId] = [socket_] :
        channelIdToSocketList[channelId] = [...channelIdToSocketList[channelId], socket_];
}

function removeSocketToChannel(channelId, socket_)
{
    // remove the socket from the list.
    let newList = [];

    channelIdToSocketList[channelId].forEach(socket =>
    {
        if(socket!=socket_) newList = [...newList, socket];
    })

    channelIdToSocketList[channelId] = newList;
}

function getListOfSocketsByChannelId(channelId)
{
    return channelIdToSocketList[channelId];
}

function processChatMsgHeader(data)
{
    let targetSockets = [];

    let {channel_id, sender, msg} = parseChatMsgHeader(data);

    if(channel_id==undefined){
        console.log("No channelID has been identified");
        return {targets: null, id: channel_id, message: msg};
    }
    else {
        console.log("channel found. channel ID = " + channel_id)
        targetSockets = getListOfSocketsByChannelId(channel_id);
        return {targets: targetSockets, id: channel_id, sender: sender, message: msg};
    }
}

function routeMessage(data, incomingSocket)
{
    let {targets, id, sender, message} = processChatMsgHeader(data);

    // find the channel DB entry with given channelId
    if(id!=null){
        chatDbHandler.findChatChannel(id).then(function(channel){

            if(channel==null){
                console.log("Channel couldn't be found");
                return;
            }
            // add to history
            console.log("Writer = " + socketToUserMap[incomingSocket.id]);

            const chat = {writer: socketToUserMap[incomingSocket.id], message: message, timestamp: Date.now()};
            channel.chat_history.push(chat);
            channel.save();

            targets.forEach(function each(target) {
                if (target!=incomingSocket && target.readyState === WebSocket.OPEN) {
                    console.log("forwarding the packet");
                    target.send(data);
                }
                else {
                    console.log("Same socket");
                }
            });
        });         
    }   
    else
    {
        console.log("No chatting channel found with given channel ID");
        return;
    } 

}

module.exports = function() {

    // <note> register DM channel for testing
    // between justin and iseo
    channelIdToUserList["iseo-dm-justin"] = ["iseo", "justin"];

    wss.on('connection', function connection(ws) {
        ws.id = uuidv4();
        
        console.log("New connection: UUID = " + ws.id);

        ws.on('message', function incoming(data) {

            console.log("Chat Server: received data = " + data);
            // It goes through all sockets registered to this server
            const result = handleCtrlMsg(data);

            if(result!=undefined) {
                switch(result[1])
                {
                    case "Register":
                        // Register the user with current ws
                        // <note> we may need to keep 2 separate mapping then?
                        // <note> how to handle the case when there are multiple sockets for the same users?
                        updateUserSocketMap(ws, result[2]);
                        console.log("Yay, now I could register the socket");
                        break;
                    default: break;
                }
            }
            else {
                routeMessage(data, ws);
            }
        });
    });
}