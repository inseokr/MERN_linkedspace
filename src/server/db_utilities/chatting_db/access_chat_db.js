var User            = require("../../models/user");
var ChatChannel     = require("../../models/chatting/chatting_channel");
var async           = require("async");

const userDbHandler = require('../../db_utilities/user_db/access_user_db');

// create DM channel
async function getMemberInfoByUserName(name)
{
  return new Promise(resolve => {
    User.findOne({username: name}, function(err, foundMember){
      if(err || foundMember==null)
      {
        //console.log("No user found with given user name");  
        return;
      }
      else 
      {
        //console.log("User Found");
        var memberInformation = {id: foundMember._id, name: foundMember.username};

        resolve(memberInformation);
      }
    });
  });
}

async function getListOfChannelsByUserName(name)
{
  return new Promise(resolve => {
    User.findOne({username: name}, function(err, foundUser){
      if(err || foundUser==null)
      {
        return;
      }
      else
      {
        resolve(foundUser.chatting_channels);
      }
    });
  });
}

function removeChannelsByPartialChannelId(channel_id)
{
  ChatChannel.deleteMany({"channel_id": { "$regex": channel_id, "$options": "i"}}, (err) => {
      // let's remove the found channel from database.
      if(err) console.warn("removeChannelsByPartialChannelId: error");

      console.log("removeChannelsByPartialChannelId: successfully deleted");
  });
}

async function getChannelByChannelId(channelName)
{
  return new Promise(resolve => {
  	//console.log("getChannelByChannelId with channelName = " + channelName);

    ChatChannel.findOne({channel_id: channelName}, function(err, foundChannel){
      if(err || foundChannel===null)
      {
        //console.log("No such channel found");
        resolve(null);
      }
      else
      {
        //console.log("Channel found");
        resolve(foundChannel);
      }
    });
  })
}

function addChannelToUser(chat_channel)
{
	chat_channel.members.forEach(member => {
	    userDbHandler.getUserById(member.id).then((foundUser) => {

        console.log("addChannelToUser: foundUser = " + foundUser);
        
	    	if(foundUser)
	    	{

          foundUser.chatting_channels.dm_channels.forEach((channel)=>{
            if(channel.name == chat_channel.channel_id)
            {
              // duplicate exists;
              console.log("duplicate found");
              return;
            }

          });

	    		// <note> id is now known yet.
	    		const dm_channel = {id: chat_channel.id_, name: chat_channel.channel_id, lastReadIndex: 0};
	    		foundUser.chatting_channels.dm_channels.push(dm_channel);
	    		foundUser.save();
	    	}
	    });
	})
}

module.exports = { findChatPartyByName: getMemberInfoByUserName, 
                   findChatChannel:     getChannelByChannelId, 
                   addChannelToUser:    addChannelToUser,
                   getChannels:         getListOfChannelsByUserName,
                   removeChannelsByPartialChannelId: removeChannelsByPartialChannelId}