var express       = require("express");
var router        = express.Router();

var fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
var User          = require("../../models/user");
var ChatChannel   = require("../../models/chatting/chatting_channel");
var ChatL1P       = require("../../models/chatting/channel_level1_parent");
var ChatL2P       = require("../../models/chatting/channel_level2_parent");
var ChatDb        = require("../../models/chatting/chatting_db");
var node 		  = require("deasync");
var async         = require("async");

node.loop = node.runLoopOnce;

// <note> somehow React can't find the routes defined here....
module.exports = function(app) {
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

	router.get("/get", function(req,res){
		console.log("channel/get called");
		res.json("success");
	});

	router.post("/new", function(req, res){
		console.log("channels/new API called");
	  	getChannelByChannelId(req.body.channel_id).then((channel) => {
		    if(channel!=null)
		    {
		      console.log("Channel already exists");
		      res.json("exists");
		      return;
		    }

		    var newChannel = new ChatChannel;

		    newChannel.channel_id   = req.body.channel_id;
		    newChannel.channel_type = req.body.channel_type;

		    // <note> The app defined here is different from the app in "App.js"
		    // <note> we should re-factor index.js in the root routes directory, need to inherit app. 
		    //newChannel.channel_creator.name = app.locals.currentUser.username;
		    //newChannel.channel_creator.id   = app.locals.currentUser._id; // need to double check it.
		    // <note> req.body doesn't include those information.

		    // process list of members
		    // <note> forEach doesn't guarantee the order of member and it could come in 0, 1 or 1,0
		    // <note> Please don't rely on index value to check if it's the last item 'cause getMemberInfoByUserName
		    // could be called in parallel.
		    let numberOfPushedMembers = 0;
		    for (index = 0; index < req.body.members.length; index++)
		    {
		      console.log("index = " + index);

		      getMemberInfoByUserName(req.body.members[index]).then((memberInfo) => {
		            numberOfPushedMembers++;

		            newChannel.members.push(memberInfo);
		            
		            if(req.body.members.length==numberOfPushedMembers)
		            {
		              console.log("Saving it to the database"); 
		              newChannel.save();
		              res.json("success");
		            }
		      });
		    }
	  	});

	});

	return router;
}
