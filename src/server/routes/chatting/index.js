var express       = require("express");
var router        = express.Router();
var User          = require("../../models/user");
var ChatChannel   = require("../../models/chatting/chatting_channel");
var ChatL1P       = require("../../models/chatting/channel_level1_parent");
var ChatL2P       = require("../../models/chatting/channel_level2_parent");
var ChatDb   	  = require("../../models/chatting/chatting_db");

module.exports = function(app) {

	router.get("/channel", function(req, res){
		console.log("Get Channel API is called");
		res.json("ok");
	});

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

	router.post("/new", function(req, res){

	  console.log("Channel is being created from chatting routes");

	  var newChannel = new ChatChannel;

	  //newChannel.channel_id   = req.body.channel_id;
	  //newChannel.channel_type = req.body.channel_type;

	  // <note> probably we don't need to pass this information?
	  // all the channel creation will be done by the user loggined now.
	  // <note> The app defined here is different from the app in "App.js"
	  //newChannel.channel_creator.name = app.locals.currentUser.username;
	  //newChannel.channel_creator.id   = app.locals.currentUser._id; // need to double check it.
	  // <note> req.body doesn't include those information.

	  // process list of members
	  req.body.members.forEach(function(err, member)
	  {
	    console.log("member name = " + member);
	 
	    getMemberInfoByUserName(member).then((memberInfo) => {
	          newChannel.members.push(memberInfo);        
	          newChannel.save();
	    });
	  });

	  res.json("success");

	});
	return router;
}
