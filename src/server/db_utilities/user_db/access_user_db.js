var User          = require("../../models/user");
var async         = require("async");

// create DM channel
async function getUserByName_(name)
{
  console.log("getUserByName_: name = " + name);

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

module.exports = {getUserByName: getUserByName_, getUserById: getUserById}