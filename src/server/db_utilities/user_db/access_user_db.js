var User          = require("../../models/user");
var async         = require("async");

// ISEO-TBD: WOW it's really interesting problem.
// <note> functions defined in this module may not work well, not a function error, if chatting_server is included.
// This is crazy problem... 
// OMG... cross referencing situations.... 
//const chatServer = require('../../chatting_server');

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
        //console.log("User Found");
        resolve(foundUser);
      }
    });
  });
}

async function findUserById_(id)
{
  console.log("findUserById_ called");

  return new Promise(resolve => { 
    User.findById(id, function(err, foundUser){
      if(err || foundUser==null)
      {
        console.log("No user found with given user name");  
        return;
      }
      else 
      {
        //console.log("User Found");
        resolve(foundUser);
      }
    });
  });
}


module.exports = {getUserByName: getUserByName_, 
                  findUserById: findUserById_}