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
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3030});

// MAP: user/channelID/socket
var socketToUserMap = [];
var userToSocketMap = [];
var channelIdToSocketList = [];
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

    socketToUserMap[currentSocket] = user_name;

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

function extractChannelId(data)
{
    const regex = /CSD:(.*):(.*)/g;
    let parsedString = regex.exec(data);

    return parsedString[1];
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

function getDestinationSockets(data, incomingSocket)
{
    let targetSockets = [];
    let channelId = extractChannelId(data);

    if(channelId==undefined){
        console.log("No channelID has been identified");
        return null;
    }
    else {
        targetSockets = getListOfSocketsByChannelId(channelId);
        return targetSockets;
    }
}

function routeMessage(data, incomingSocket)
{
    console.log("routeMessage: got message from socket = " + incomingSocket);
    let listOfTargetSockets = getDestinationSockets(data, incomingSocket);

    listOfTargetSockets.forEach(function each(target) {
        if (target!=incomingSocket && target.readyState === WebSocket.OPEN) {
            console.log("forwarding the packet");
            target.send(data);
        }
        else {
            console.log("Same socket");
        }
    });
}

module.exports = function() {

    // <note> register DM channel for testing
    // between justin and iseo
    channelIdToUserList["iseo-dm-justin"] = ["iseo", "justin"];

    wss.on('connection', function connection(ws) {
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