var User          = require("../../models/user");
var async         = require("async");

// create DM channel
async function getUserByName_(name)
{
  //console.log("getUserByName_: name = " + name);

  return new Promise(resolve => {
    User.findOne({username: name}, function(err, foundUser){
      if(err || foundUser==null)
      {
        console.log("No user found with given user name");
        return;
      }
      else 
      {
        console.log("User Found");
        resolve(foundUser);
      }
    });
  });
}

async function getUserById(id)
{
  return new Promise(resolve => { 
    User.findById(id, function(err, foundUser){
      if(err || foundUser==null)
      {
        console.log("No user found with given user name");  
        return;
      }
      else 
      {
        console.log("User Found");
        resolve(foundUser);
      }
    });
  });
}

function removeDmChannel(name, channel_id)
{
  getUserByName_(name).then((foundUser) => {

    console.log("user name: "+name);
    console.log("channel name: "+channel_id);

    console.log("Previous dm_channels length = " + foundUser.chatting_channels.dm_channels.length);

    foundUser.chatting_channels.dm_channels = 
      foundUser.chatting_channels.dm_channels.filter((channel) => channel.name.search(channel_id) == -1);
    
    console.log("After dm_channels length = " + foundUser.chatting_channels.dm_channels.length);
    foundUser.save();
  });
}

module.exports = {getUserByName: getUserByName_, getUserById: getUserById, removeDmChannel: removeDmChannel}