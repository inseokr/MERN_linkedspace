const express = require('express');

const router = express.Router();

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const node = require('deasync');
const async = require('async');
const User = require('../../models/user');
const ChatChannel = require('../../models/chatting/chatting_channel');
const ChatL1P = require('../../models/chatting/channel_level1_parent');
const ChatL2P = require('../../models/chatting/channel_level2_parent');
const ChatDb = require('../../models/chatting/chatting_db');

const chatDbHandler = require('../../db_utilities/chatting_db/access_chat_db');
const chatServer = require('../../chatting_server');

node.loop = node.runLoopOnce;

// <note> somehow React can't find the routes defined here....
module.exports = function (app) {
  router.get('/get', (req, res) => {
    chatDbHandler.findChatChannel('iseo-dm-justin').then((channel) => {
      if (channel != null) {
        // //console.log("channel found");
        res.json(channel);
      }
    });
  });

  router.post('/update', (req, res) => {
    let result = { op_result: 'success' };

    // console.log("chatting update called, channel = " + req.body.channel_id + " index= " + req.body.lastReadIndex);

    // update channel DB in User DB
    User.findOne({ username: req.user.username }, (err, user) => {
      if (err) {
        result = { op_result: 'failed' };
        // console.log("User not found");
        res.json(result);
        return;
      }

      // find the channel and update the index.
      try {
        for (let index = 0; index < user.chatting_channels.dm_channels.length; index++) {
          const channel = user.chatting_channels.dm_channels[index];
          if (channel.name == req.body.channel_id) {
            // console.warn(`Channel found`);
            channel.lastReadIndex = req.body.lastReadIndex;
            user.save();
            res.json(result);
            return;
          }
        }

        // console.warn(`Channel not found`);
        chatDbHandler.findChatChannel(req.body.channel_id).then((channel) => {
          // It's a dirty patch to
          chatDbHandler.addChannelToSingleUser(channel, user).then((result) => {
            res.json({ op_result: result });
          });
        });
      } catch (err) {
        console.log(`err=${err}`);
        res.json({ op_result: err });
      }
    });
  });

  router.post('/new', (req, res) => {
	    if (req.user === undefined) {
	      const result = { bNewlyCreated: false, channel: null };
	      res.json(result);
	      return;
	    }

    	// What if we're getting the new channel request even before it's saved in the database?
	  	chatDbHandler.findChatChannel(req.body.channel_id).then((channel) => {
		    if (channel != null) {
		      const result = { bNewlyCreated: false, channel };

		      // console.log("Channel exists already. returning the channel");

		      res.json(result);
		      return;
		    }

		    const newChannel = new ChatChannel();

     		console.warn(`New channel: channel ID = ${req.body.channel_id}`);
		    newChannel.channel_id = req.body.channel_id;
		    newChannel.channel_type = req.body.channel_type;

		    // <note> The app defined here is different from the app in "App.js"
		    // <note> we should re-factor index.js in the root routes directory, need to inherit app.
		    newChannel.channel_creator.name = req.user.username;
		    // ISEO-DEPLOY-ISSUE
      		// : Is it safe to use appl.locals here?? will it work when multiple users got loggined?
		    newChannel.channel_creator.id = app.locals.currentUser[req.user.username].id_;
		    // <note> req.body doesn't include those information.

		    // process list of members
		    // <note> forEach doesn't guarantee the order of member and it could come in 0, 1 or 1,0
		    // <note> Please don't rely on index value to check if it's the last item 'cause getMemberInfoByUserName
		    // could be called in parallel.
		    let numberOfPushedMembers = 0;
		    for (index = 0; index < req.body.members.length; index++) {
		      // //console.log("index = " + index);
		      chatDbHandler.findChatPartyByName(req.body.members[index]).then(async (memberInfo) => {
		            numberOfPushedMembers++;

		            console.warn(`adding ${JSON.stringify(memberInfo)} to the chatting channel`);

		            newChannel.members.push(memberInfo);

		            if (req.body.members.length == numberOfPushedMembers) {
			            console.warn('Saving it to the database');

			            newChannel.save((err, product, numAffected) => {
			              if (err) {
			                console.warn(`newChannel.save failed with err = ${err}`);
			                const result = { bNewlyCreated: false, channel: null };
			                res.json(result);
			                return;
			              }

			              chatDbHandler.addChannelToUser(newChannel).then((userNameList) => {
				              const result = { bNewlyCreated: true };
				              res.json(result);

				              // console.warn(`userNameList = ${JSON.stringify(userNameList)}`);
				              if (userNameList !== null && userNameList !== undefined) {
				              	// remove current user from the list
				              	const adjustedUsernameList = userNameList.filter(user => user !== req.user.username);
				              	// console.warn(`adjustedUsernameList: ${JSON.stringify(adjustedUsernameList)}`);
				              	chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, adjustedUsernameList);
				              }
			              });
			            });
		            }
		      });
		    }
	  	});
  });

  return router;
};
