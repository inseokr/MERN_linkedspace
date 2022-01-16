const async = require('async');
const User = require('../../models/user');
const chatServer = require('../../chatting_server');
const ChatChannel = require('../../models/chatting/chatting_channel');

const userDbHandler = require('../user_db/access_user_db');

async function getGroupChat(currentUserName, chatMemberList, chatType, listingId) {

  if(chatType!==0) return null;

  let concatenatedFriendsString = '';
  const group_chat =  { channel_id: '', friend_list: [] };

  // 1. go through friends list
  for (let index = 0; index < chatMemberList.length; index++) {

    let foundFriend = await User.findById(chatMemberList[index]);
    group_chat.friend_list.push({username: foundFriend.username, profile_picture: foundFriend.profile_picture});

    const hypen = (index >= 1) ? '-' : '';

    concatenatedFriendsString = concatenatedFriendsString + hypen + foundFriend.username;
  }

  concatenatedFriendsString = `${concatenatedFriendsString}-${currentUserName}`;

  // let's sort it
  let userList = concatenatedFriendsString.split('-').sort();
  concatenatedFriendsString = '';

  for (let index = 0; index < userList.length; index++) {
    const hypen = (index >= 1) ? '-' : '';
    concatenatedFriendsString = concatenatedFriendsString + hypen + userList[index];
  }

  group_chat.channel_id = `${listingId}-parent-${concatenatedFriendsString}`;

  return group_chat;
}

// create DM channel
async function getMemberInfoByUserName(name) {
  return new Promise((resolve) => {
    User.findOne({ username: name }, (err, foundMember) => {
      if (err || foundMember == null) {
        // console.log("No user found with given user name");

      } else {
        // console.log("User Found");
        const memberInformation = { id: foundMember._id, name: foundMember.username };

        resolve(memberInformation);
      }
    });
  });
}

async function getListOfChannelsByUserName(name) {
  return new Promise((resolve) => {
    User.findOne({ username: name }, (err, foundUser) => {
      if (err || foundUser == null) {

      } else {
        resolve(foundUser.chatting_channels);
      }
    });
  });
}

function removeChannelsByPartialChannelId(channel_id) {
  ChatChannel.deleteMany({ channel_id: { $regex: channel_id, $options: 'i' } }, (err) => {
    // let's remove the found channel from database.
    if (err) console.warn('removeChannelsByPartialChannelId: error');

    console.log('removeChannelsByPartialChannelId: successfully deleted');
  });
}

async function getChannelByChannelId(channelName) {
  return new Promise((resolve) => {
  	// console.log("getChannelByChannelId with channelName = " + channelName);

    ChatChannel.findOne({ channel_id: channelName }, (err, foundChannel) => {
      if (err || foundChannel === null) {
        // console.log("No such channel found");
        resolve(null);
      } else {
        // console.log("Channel found");
        resolve(foundChannel);
      }
    });
  });
}

async function updateChannelId(oldId, newId) {
  return new Promise((resolve) => {
    ChatChannel.findOne({ channel_id: oldId }, (err, foundChannel) => {
      if (err || foundChannel === null) {
        // console.log("No such channel found");
        resolve(null);
      } else {
        // console.log("Channel found");
        foundChannel.channel_id = newId;
        foundChannel.save(()=> resolve(foundChannel));
      }
    });
  });
}

async function addChannelToSingleUser(chat_channel, user) {

  return new Promise((resolve) => {

    let bDuplicate = false;

    for (let index = 0; index < user.chatting_channels.dm_channels.length; index++) {
      if (user.chatting_channels.dm_channels[index].name == chat_channel.channel_id) {
        //console.log(`duplicate found: index=${index}, channel id=${user.chatting_channels.dm_channels[index].name}`);
        bDuplicate = true;
        resolve("chatting channel already in the list");
      }
    }
    
    if(bDuplicate===false) {
      const dm_channel = { id: chat_channel.id_, name: chat_channel.channel_id, lastReadIndex: 0 };
      user.chatting_channels.dm_channels.push(dm_channel);
      user.save();
      resolve("chatting channel added");
    }
  });

}

async function addChannelToUser(chat_channel) {
  let numOfProcessed = 0;
  const numOfMembers = chat_channel.members.length;
  const userNameList = [];

  //console.warn(`chat_channel: = ${JSON.stringify(chat_channel)}`);

  return new Promise((resolve) => {
    if (numOfMembers === 0) resolve(null);

    chat_channel.members.forEach((member) => {
      //console.warn(`member name: ${member.name}`);

      userDbHandler.findUserById(member.id).then((foundUser) => {
        numOfProcessed++;

        if (foundUser) {
          let bDuplicate = false;
          userNameList.push(foundUser.username);

          for (let index = 0; index < foundUser.chatting_channels.dm_channels.length; index++) {
            if (foundUser.chatting_channels.dm_channels[index].name == chat_channel.channel_id) {
              //console.log(`duplicate found: index=${index}, channel id=${foundUser.chatting_channels.dm_channels[index].name}`);
              bDuplicate = true;
            }
          }

          // <note> id is now known yet.
          if (bDuplicate === false) {
            const dm_channel = { id: chat_channel.id_, name: chat_channel.channel_id, lastReadIndex: 0 };
            foundUser.chatting_channels.dm_channels.push(dm_channel);
            //console.warn(`adding ${chat_channel.channel_id} to user: ${foundUser.username}`);
            foundUser.save(()=> {
              chatServer.registerUserSocketToChannel(chat_channel.channel_id, foundUser.username);
            });
          }
        }

        if (numOfProcessed === chat_channel.members.length) {
          //console.warn(`numOfProcessed=${numOfProcessed}, userNameList=${JSON.stringify(userNameList)}`);
          resolve(userNameList);
        }
      });
    });
  });
}

module.exports = {
  findChatPartyByName: getMemberInfoByUserName,
  findChatChannel: getChannelByChannelId,
  addChannelToUser,
  addChannelToSingleUser,
  getChannels: getListOfChannelsByUserName,
  removeChannelsByPartialChannelId,
  getGroupChat,
  updateChannelId
};
