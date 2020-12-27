const async = require('async');
const User = require('../../models/user');
const ChatChannel = require('../../models/chatting/chatting_channel');

const userDbHandler = require('../user_db/access_user_db');
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

async function addChannelToUser(chat_channel) {
  let numOfProcessed = 0;
  const numOfMembers = chat_channel.members.length;
  const userNameList = [];

  return new Promise((resolve) => {
    if (numOfMembers === 0) resolve(null);

    chat_channel.members.forEach((member) => {
      userDbHandler.findUserById(member.id).then((foundUser) => {
        numOfProcessed++;

        if (foundUser) {
          let bDuplicate = false;
          userNameList.push(foundUser.username);

          for (let index = 0; index < foundUser.chatting_channels.dm_channels.length; index++) {
            if (foundUser.chatting_channels.dm_channels[index].name == chat_channel.channel_id) {
              console.log('duplicate found');
              bDuplicate = true;
            }
          }

          // <note> id is now known yet.
          if (bDuplicate === false) {
            const dm_channel = { id: chat_channel.id_, name: chat_channel.channel_id, lastReadIndex: 0 };
            foundUser.chatting_channels.dm_channels.push(dm_channel);
            foundUser.save();
          }
        }

        if (numOfProcessed === chat_channel.members.length) {
          // console.warn(`numOfProcessed=${numOfProcessed}, userNameList=${JSON.stringify(userNameList)}`);
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
  getChannels: getListOfChannelsByUserName,
  removeChannelsByPartialChannelId
};
