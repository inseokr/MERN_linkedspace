var User          = require("../../models/user");
var ChatChannel   = require("../../models/chatting/chatting_channel");
var async         = require("async");

// create DM channel
async function getMemberInfoByUserName(name)
{
  return new Promise(resolve => {
    User.findOne({username: name}, function(err, foundMember){
      if(err || foundMember==null)
      {
        console.log("No user found with given user name");  
        return;
      }
      else 
      {
        console.log("User Found");
        var memberInformation = {id: foundMember._id, name: foundMember.username};

        resolve(memberInformation);
      }
    });
  });
}

async function getChannelByChannelId(channelName)
{
  return new Promise(resolve => {
  	console.log("getChannelByChannelId with channelName = " + channelName);
  	
    ChatChannel.findOne({channel_id: channelName}, function(err, foundChannel){
      if(err || foundChannel===null)
      {
        console.log("No such channel found");
        resolve(null);
      }
      else
      {
        console.log("Channel found");
        resolve(foundChannel);
      }
    });
  })
}

module.exports = {findChatPartyByName: getMemberInfoByUserName, findChatChannel: getChannelByChannelId}