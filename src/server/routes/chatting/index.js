var express       = require("express");
var router        = express.Router();

var fileUpload    = require('express-fileupload');
const bodyParser  = require('body-parser');
var User          = require("../../models/user");
var ChatChannel   = require("../../models/chatting/chatting_channel");
var ChatL1P       = require("../../models/chatting/channel_level1_parent");
var ChatL2P       = require("../../models/chatting/channel_level2_parent");
var ChatDb        = require("../../models/chatting/chatting_db");
var node 		  = require("deasync");
var async         = require("async");

const chatDbHandler = require('../../db_utilities/chatting_db/access_chat_db');

node.loop = node.runLoopOnce;

// <note> somehow React can't find the routes defined here....
module.exports = function(app) {

	router.get("/get", function(req,res){
		chatDbHandler.findChatChannel("iseo-dm-justin").then((channel) => {
			if(channel!=null)
			{
				//console.log("channel found");
				res.json(channel);
				return;
			}
		})
	});

	router.post("/update", function(req,res){
		let result = {op_result: "sucess"};

		//console.log("chatting update called, channel = " + req.body.channel_id + "index= " + req.body.lastReadIndex);

		// update channel DB in User DB
		User.findOne({username: req.user.username}, function(err, user){
			if(err)
			{
				result = {op_result: "failed"};
				console.log("User not found");
				res.json(result);
				return;
			}

			// find the channel and update the index.
			user.chatting_channels.dm_channels.forEach((channel) => {
				if(channel.name==req.body.channel_id)
				{
					console.log("Found channel and now the index is being udpated");
					channel.lastReadIndex = req.body.lastReadIndex;
					user.save();
					res.json(result);
					return;
				}
			});
		});
	});

	router.post("/new", function(req, res){
	  	chatDbHandler.findChatChannel(req.body.channel_id).then((channel) => {
		    if(channel!=null)
		    {
		      let result = {bNewlyCreated: false, channel: channel};

		      //console.log("Channel exists already. returning the channel");

		      res.json(result);
		      return;
		    }

		    var newChannel = new ChatChannel;

		    newChannel.channel_id   = req.body.channel_id;
		    newChannel.channel_type = req.body.channel_type;

		    // <note> The app defined here is different from the app in "App.js"
		    // <note> we should re-factor index.js in the root routes directory, need to inherit app. 
		    newChannel.channel_creator.name = req.user.username;
		    newChannel.channel_creator.id   = app.locals.currentUser[req.user.username].id_;
		    // <note> req.body doesn't include those information.

		    // process list of members
		    // <note> forEach doesn't guarantee the order of member and it could come in 0, 1 or 1,0
		    // <note> Please don't rely on index value to check if it's the last item 'cause getMemberInfoByUserName
		    // could be called in parallel.
		    let numberOfPushedMembers = 0;
		    for (index = 0; index < req.body.members.length; index++)
		    {
		      //console.log("index = " + index);

		      chatDbHandler.findChatPartyByName(req.body.members[index]).then((memberInfo) => {
		            numberOfPushedMembers++;

		            newChannel.members.push(memberInfo);

		            if(req.body.members.length==numberOfPushedMembers)
		            {
		              console.log("Saving it to the database"); 
		              newChannel.save(function (err, product, numAffected) {
		              	if(err)
		              	{
		              		console.log("newChannel.save failed with err = " + err);
		              	}
		              	chatDbHandler.addChannelToUser(newChannel);
		              });
		            }
		      });
		    }

		    let result = {bNewlyCreated: true};

		    res.json(result);

		    console.log("Channel just created");
	  	});

	});

	return router;
}
