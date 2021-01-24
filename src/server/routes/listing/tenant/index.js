const express = require('express');

const router = express.Router();
const passport = require('passport');
const node = require('deasync');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const TenantRequest = require('../../../models/listing/tenant_request');
const User = require('../../../models/user');

const userDbHandler = require('../../../db_utilities/user_db/access_user_db');
const chatDbHandler = require('../../../db_utilities/chatting_db/access_chat_db');
const listingDbHandler = require('../../../db_utilities/listing_db/access_listing_db');
const { addUserToList, removeUserFromList } = require('../../../utilities/array_utilities');
const { sendNotificationEmail } = require('../../../utilities/notifications');

const chatServer = require('../../../chatting_server');

const { fileDeleteFromCloud } = require('../../../aws_s3_api');

const serverPath = './src/server';

node.loop = node.runLoopOnce;

function sendDashboardAutoRefresh(currUserName, shared_user_group) {
  const userNameList = [];
  for (let index = 0; index < shared_user_group.length; index++) {
    if (currUserName !== shared_user_group[index].username) {
      userNameList.push(shared_user_group[index].username);
    }
  }
  chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, userNameList);
}

function sendDashboardControlMessage(currUserName, shared_user_group, controlCode) {
  const userNameList = [];
  for (let index = 0; index < shared_user_group.length; index++) {
    if (currUserName !== shared_user_group[index].username) {
      userNameList.push(shared_user_group[index].username);
    }
  }
  chatServer.sendDashboardControlMessage(controlCode, userNameList);
}


module.exports = function (app) {
  router.post('/new', (req, res) => {
    if (req.body.submit == 'exit') {
      res.render('listing_main');
    } else {
      // create a new listing\
      const newListing = new TenantRequest();

      // add username and id
      newListing.requester = req.user._id;

      newListing.location = req.body.location;
      newListing.move_in_date = req.body.move_in_date;
      newListing.rental_duration = req.body.rental_duration;
      newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
      newListing.rental_budget = req.body.rental_budget;
      newListing.coordinates = { lat: 0, lng: 0 };

      newListing.shared_user_group.push(req.user._id);

      newListing.save((err) => {
        if (err) {
        	console.warn('New Listing Save Failure');
        	res.render('/');
        }

        User.findById(req.user._id, (err, foundUser) => {
        	if (err) {
        		console.log('User Not found with given User');
        		return;
        	}

        	foundUser.tenant_listing.push(newListing._id);

        	foundUser.save();
        });

        res.render('listing/tenant/new_step2', { listing_info: { listing: newListing, listing_id: newListing._id } });
      });
    }
  });


  router.post('/:listing_id/new', (req, res) => {
    TenantRequest.findById(req.params.listing_id, (err, foundListing) => {
	    foundListing.location = req.body.location;
	    foundListing.move_in_date = req.body.move_in_date;
	    foundListing.rental_duration = req.body.rental_duration;
	    foundListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
	    foundListing.rental_budget = req.body.rental_budget;

    	foundListing.save((err) => {
    		if (err) {
		    	console.log('New Listing Save Failure');
    			res.render('/');
    		}

        res.render('listing/tenant/new_step2', { listing_info: { listing: foundListing, listing_id: req.params.listing_id } });
    	});
    });
  });

  // the route name may need to be revised.
  router.put('/:list_id', (req, res) => {
    if (req.body.submit == 'exit') {
      res.render('/');
    } else {
      TenantRequest.findById(req.params.list_id, (err, foundListing) => {
        if (err) {
          req.flash('error', 'No such listing found');
          res.redirect('/');
        } else if (req.body.submit == 'step#2') {
          foundListing.rental_preferences = req.body.preferences;

          foundListing.save();

          res.render('listing/tenant/new_step3', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
        } else {
          foundListing.rental_description = req.body.rental_description;

          foundListing.roommate_request = req.body.roommate_request;
          foundListing.group_rental = req.body.group_rental;
          foundListing.num_of_roommates = req.body.num_of_roommates;
          foundListing.roommate_request = req.body.roommate_request;
          foundListing.num_of_requested_roommates = req.body.num_of_requested_roommates;

          if (foundListing.num_of_profile_picture_uploaded != 0) {
            foundListing.profile_pictures[0].caption = req.body.caption;
          }

          foundListing.phone = req.body.phone;
          foundListing.email = req.body.email;

          if (req.body.group_rental == 'on') {
            const listOfRoomMate = [];
            let callBackProcessed = false;
            let userFound = false;

            // add user id to roommate list
            for (var roommate_idx = 1; roommate_idx <= req.body.num_of_roommates; roommate_idx++) {
              callBackProcessed = false;
              userFound = false;
              // TBD
              var roommate_id = eval(`req.body.roommate_${roommate_idx}`);

              User.find({ username: roommate_id }, (err, tempUser) => {
                if (err) {
                  console.log('User not found');
                } else if (tempUser.length == 1) {
                  // ISEO: it will be successfull even if there is no record found with given condition!!
                  listOfRoomMate[roommate_idx] = { id: tempUser[0]._id, username: roommate_id };
                  // console.log("roomMate=" + roomMate);
                  // console.log("listOfRoomMate[roommate_idx]" + listOfRoomMate[roommate_idx]);
                  userFound = true;


                  // foundListing.roommates.push(roomMate);
                  // you should save here... otherwise all the data will be gone, Dude!!
                  // foundListing.save();
                } else {
                  req.flash('error', 'no such error found');
                }

                callBackProcessed = true;
              });

              while (callBackProcessed == false) node.loop();// This will give no chance to child process at all

              if (userFound == true) foundListing.roommates.push(listOfRoomMate[roommate_idx]);
            }

            foundListing.save();
          } else {
            foundListing.save();
          }
          // need to add user ID of roommates if exists.
          req.flash('success', 'Listing posted successfully');
          const preferences = [];

          preprocessingListing(foundListing, preferences);

          // res.render("listing/tenant/show", {listing_info: { listing: foundListing, rentalPreferences: preferences, list_id: 0}});
          res.redirect(`/listing/tenant/${foundListing._id}/get`);
        }
      });
    }
  });

  router.get('/tenant_dashboard', (req, res) => {
    res.render('listing/tenant/tenant_dashboard');
  });

  router.get('/:list_id/step1', (req, res) => {
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/tenant/new', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });


  router.get('/:list_id/step2', (req, res) => {
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/tenant/new_step2', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/step3', (req, res) => {
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/tenant/new_step3', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/show', (req, res) => {
    // Get tenant listing.
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}

    	const preferences = [];

      preprocessingListing(foundListing, preferences);

      res.render('listing/tenant/show', { listing_info: { listing: foundListing, rentalPreferences: preferences, list_id: req.params.list_id } });
    });
  });

  router.get('/show', (req, res) => {
    // Get tenant listing.
    User.findById(req.user._id, (err, foundUser) => {
      if (err) {
        	console.log('User Not found with given User');
        	return;
      }

      TenantRequest.findById(foundUser.tenant_listing[0].id, (err, foundListing) => {
        	if (err || foundListing == null) {
        		req.flash('error', 'No Active Listing Found');
        		res.redirect('/');
        		return;
        	}

        // need to change to support array of list instead
        res.render('listing/tenant/show_list', { listing_info: { listing: foundListing, list_id: foundUser.tenant_listing[0].id } });
      });
    });
  });


  router.get('/:list_id/fetch', (req, res) => {
    if (req.user === undefined) {
      console.log("fetch's not allowed when user is not logged in");
      res.json(null);
      return;
    }
    // console.log("REACT: fetch tenant listing request with listing id= " + JSON.stringify(req.params.list_id));

    TenantRequest.findById(req.params.list_id, async (err, foundListing) => {
      if (err || foundListing === null) {
        console.warn('Listing not found');
        console.warn(`err=${err}`);
        res.redirect('/');
        return;
      }

      /* await foundListing.populate('requester', 'username profile_picture loggedInTime').execPopulate();
      foundListing.populated('requester'); */

      const populateChildren = new Promise(async (resolve, reject) => {
        await foundListing.populate('shared_user_group', 'username profile_picture loggedInTime').execPopulate();
        foundListing.populated('shared_user_group');

        if (foundListing.child_listings.length > 0) {
          let numberOfPopulatedChildListing = 0;

          foundListing.child_listings.forEach(async (child, index, array) => {
            const pathToPopulate = `child_listings.${index}.listing_id`;

            // console.log("child listing reference = " + child.listing_type);

            await foundListing.populate({ path: pathToPopulate, model: child.listing_type }).execPopulate();
            foundListing.populated(pathToPopulate);

            const pathToRequester = `child_listings.${index}.listing_id.requester`;
            await foundListing.populate(pathToRequester, 'username profile_picture loggedInTime').execPopulate();
            foundListing.populated(pathToRequester);


            const pathToSharedUserGroup = `child_listings.${index}.shared_user_group`;
            await foundListing.populate(pathToSharedUserGroup, 'username profile_picture loggedInTime').execPopulate();
            foundListing.populated(pathToSharedUserGroup);
            // console.log("listing: listingType =  " + foundListing.child_listings[index].listing_id.listingType);
            // console.log("listing: index =  " + index);
            // console.log(`foundListing = ${JSON.stringify(foundListing)}`);
            if (++numberOfPopulatedChildListing == array.length) resolve();
          });
        } else {
          // resolve it right away.
          resolve();
        }
      });


      populateChildren.then(async () => {
        userDbHandler.findUserById(req.user._id).then(async (foundUser)	=> {
          const referringFriends = userDbHandler.getReferringFriendsByListingId(foundUser, req.params.list_id, 'tenant');

          foundListing.list_of_referring_friends = referringFriends.filter((friend, index) => index <= (referringFriends.length - 2));
          // console.log("foundListing = " + JSON.stringify(foundListing));

          await foundListing.populate('requester', 'username lastname firstname profile_picture loggedInTime').execPopulate();
          foundListing.populated('requester');

          // update status of listing ID from friends
          // console.log(`foundListing.requester=${JSON.stringify(foundListing.requester)}`);

          res.json(foundListing);

          // update recent visited listing
          foundUser.lastVistedListingId = req.params.list_id;

          if (!foundListing.requester.equals(foundUser._id)) {
            userDbHandler.readListingFromFriends(foundUser, 'tenant', req.params.list_id);
          }
          // console.log(`Recording liast visited listing ID =  ${JSON.stringify(foundUser.lastVistedListingId)}`);
          foundUser.save();
        });
      });
    });
  });


  router.post('/:list_id/edit', (req, res) => {
    // Get tenant listing.
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/tenant/new', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.post('/:list_id/setDashboardMode', (req, res) => {
    // Get tenant listing.
    TenantRequest.findById(req.params.list_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
      if (err) {
        console.log('Listing not found');
        res.send('No listing found');
        return;
      }
      sendDashboardControlMessage(req.user.username, foundListing.shared_user_group,
        (req.body.mode === 'normal') ? chatServer.DASHBOARD_CTRL_SET_MODE_NORMAL : chatServer.DASHBOARD_CTRL_SET_MODE_LOCKED);
      res.send('Dashboard mode is set');
    });
  });

  router.post('/:list_id/addGroupChat', (req, res) => {
    TenantRequest.findById(req.params.list_id, async (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		res.json({ result: 'Listing not found' });
    		return;
    	}

    	// list of parameters needed
    	// 1. chatting ID
    	// + parent list: (parent_listing_id)-parent-(list of friend_name)
    	// + child list:  (parent_listing_id)-child-(child_listing_id)-(list of friend name)
    	// 2. list of friends

    	// 1. check if there is a chatting channel created already. Skip it it it exists
    	const channelId = await chatDbHandler.findChatChannel(req.body.channel_id);

    	if (channelId != null) {
    		console.log('Channel=$channelId exists already');
    		res.json({ result: 'Channel exists already' });
    		return;
    	}

    	// 2. construct the group_chat using list of friends
    	// <note> list_of_group_chats
    	// <problem#1> User could create group chat first before creating any DM.
    	// We may need to add the current user to the shared_user_group as well if it's not in the list.
    	const { chattingType } = req.body;
    	const { childInfo } = req.body;
    	const { friends } = req.body;

    	// go through friend list and add it to shared_user_group
    	// <note> This process could be done in parallel.
    	// Nope... in my second thought. We'd better update list_of_group_chats.
    	// It's the same object anyhow. So we should complete all the operarions before save()
    	const group_chat = { channel_id: req.body.channel_id, friend_list: [] };

    	let numOfFriendsProcessed = 0;

    	friends.forEach(async (_friend) => {
    		const result = await listingDbHandler.addToSharedUserGroup(foundListing, _friend.username, chattingType, childInfo.index, false);
    		// let's update list_of_group_chats now
    		const userInfo = { username: _friend.username };

    		// console.log("numOfFriendsProcessed="+numOfFriendsProcessed);
    		// console.log("friends.length="+friends.length);

    		group_chat.friend_list.push(userInfo);
    		++numOfFriendsProcessed;

    		if (numOfFriendsProcessed == friends.length) {
		    	if (chattingType == 1) {
		    		foundListing.list_of_group_chats.push(group_chat);
			    	// console.log("group_chat = " + JSON.stringify(group_chat));
		    	} else {
			    	foundListing.child_listings[childInfo.index].list_of_group_chats.push(group_chat);
			    	// console.log("group_chat = " + JSON.stringify(group_chat));
			    	// console.log("index = " + childInfo.index);
		    	}

		    	// console.log("group_chat = " + JSON.stringify(foundListing.child_listings[childInfo.index].list_of_group_chats));

		    	foundListing.save((err) => {
			    		if (err) {
			    			res.json({ result: 'DB save failure' });
			    			return;
			    		}
			    		// console.log("addGroupChat: user added successfully");
			    		// console.log("addGroupChat: list_of_group_chats = " + JSON.stringify(foundListing.list_of_group_chats));
				    	res.json({ result: 'Added successfully' });
		    	});
    		}
    	});
    });
  });


  router.post('/:list_id/addUserGroup', (req, res) => {
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
      function checkDuplicate(user_list, _id) {
        let bDuplicate = false;

        if (user_list.length >= 1) {
          bDuplicate = user_list.some(
            _user => _user.equals(_id)
          );
        }

        return bDuplicate;
      }


    	if (err) {
    		console.log('Listing not found');
    		return;
    	}
    	const { chattingType } = req.body;
    	const { childInfo } = req.body;
    	const { friend } = req.body;

    	// console.log("friend = " + JSON.stringify(friend));
    	// console.log("userDbHandler = " + JSON.stringify(userDbHandler));
    	userDbHandler.getUserByName(friend.username).then((_friend) => {
    		if (_friend == null) {
    			console.log('Friend not found');
    			res.json({ result: 'Friend not found' });
    			return;
    		}
	    	// 1. check duplicate.
	    	switch (chattingType) {
	    		case 1:
	    			// find the ID of the friend
	    			if (checkDuplicate(foundListing.shared_user_group, _friend._id) == true) {
	    				console.log('Duplicate found');
	    				res.json({ result: 'Duplicate found' });
	    				return;
	    			}

	    			foundListing.shared_user_group.push(_friend._id);

            // let's add the current user if it's not the shared_user_group yet.
            if (checkDuplicate(foundListing.shared_user_group, req.user._id) === false) {
              foundListing.shared_user_group.push(req.user._id);
            }

	    			break;
	    		case 2:

            if (foundListing.child_listings[childInfo.index] === undefined) {
              console.warn('Child listing not created yet');
              res.json({ result: 'Child listing not created yet' });
              return;
            }

	    			if (checkDuplicate(foundListing.child_listings[childInfo.index].shared_user_group, _friend._id) == true) {
	    				// console.log('Duplicate found');
	    				res.json({ result: 'Duplicate found' });
	    				return;
	    			}
            // console.log(`Pushing friend = ${_friend.username}`);

    				foundListing.child_listings[childInfo.index].shared_user_group.push(_friend._id);

            // let's add the current user if it's not the shared_user_group yet.
            if (checkDuplicate(foundListing.child_listings[childInfo.index].shared_user_group, req.user._id) === false) {
              foundListing.child_listings[childInfo.index].shared_user_group.push(req.user._id);
            }

	    			break;
	    		default:
	    			console.log('Unknown chattingType');
	    			res.json({ result: 'Unknown chattingType' });
	    			return;
	    	}

	    	foundListing.save((err) => {
	    		if (err) {
	    			res.json({ result: 'DB save failure' });
	    			return;
	    		}
	    		// console.log("ISEO: user added successfully");
		    	res.json({ result: 'Added successfully' });

          let notificationUserList = (chattingType === 1) ? foundListing.shared_user_group : foundListing.child_listings[childInfo.index].shared_user_group;
          notificationUserList = notificationUserList.filter(user => !user.equals(req.user._id));

          // we should notify to other people in the group.
          // console.log(`notificationUserList = ${JSON.stringify(notificationUserList)}`);
          chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, notificationUserList);
	    	});
	    });
    });
  });


  router.post('/:list_id/dashboard/invite', (req, res) => {
    TenantRequest.findById(req.params.list_id).populate('shared_user_group', 'username email').exec((err, foundListing) => {
      if (err) {
        console.log('Listing not found');
        return;
      }

      // invite friends in the shared_group
      const lengthOfUserGroup = foundListing.shared_user_group.length;
      let numOfUsersProcessed = 0;
      const _userList = [];

      foundListing.shared_user_group.map((user, userIndex) => {
        // send e-mail notification
        const notificationBody = `${req.user.username} is inviting you to a dashboard.\n\n`
            + 'Please click the following link to get to the dashboard page.\n\n'
            + `${process.env.REACT_SERVER_URL}/listing/tenant/${req.params.list_id}/dashboard\n`;
        // sendNotificationEmail(user.email, `${req.user.username} is inviting to a dashboard`, notificationBody);
        numOfUsersProcessed++;
        _userList.push({ email: user.email, username: user.username, message: notificationBody });
        if (lengthOfUserGroup === numOfUsersProcessed) {
          res.json(_userList);
        }
      });

      if (lengthOfUserGroup === 0) res.json(null);
    });
  });

  router.delete('/:list_id', (req, res) => {
    // Clean all resources such as pictures.

    // Get tenant listing.
    TenantRequest.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}

    	try {
    		fileDeleteFromCloud(foundListing.profile_pictures[0].path);

    		fs.unlinkSync(serverPath + foundListing.profile_pictures[0].path);
	    } catch (err) {
	    	console.error(err);
	    }

	    // clean up chatting related resources
	    // 1. go through all the child listing and remove chatting channels.
	    listingDbHandler.cleanAllChildListingsFromParent(foundListing);

	    // 2. remove the tenant listing from other users including creator
	    userDbHandler.deleteListingFromUserDB(foundListing);

      // 3. remove channels in the parent level
      const channel_id_prefix = `${req.params.list_id}-`;
      chatDbHandler.removeChannelsByPartialChannelId(channel_id_prefix);

      foundListing.shared_user_group.map(async (user, userIndex) => {
        const pathToPopulate = `shared_user_group.${userIndex}`;
        await foundListing.populate(pathToPopulate, 'username').execPopulate();
        foundListing.populated(pathToPopulate);

        chatServer.removeChannelFromUserDb(foundListing.shared_user_group[userIndex].username, channel_id_prefix);
      });


      foundListing.remove();

    	req.flash('success', 'Listing Deleted Successfully');
      res.redirect('/ActiveListing');
    });
  });


  router.get('/:list_id/show/:filename', (req, res) => {
    const fileName = req.params.filename;
 	// console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/tenant/${fileName}`));
  });


  // It's a bit strange but browser sends tenant/:list_id/:filename as the URL with the following image request
  // <img src="Peter.jpg">
  router.get('/:list_id/:filename', (req, res) => {
    const fileName = req.params.filename;
 	// console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
  });


  router.get('/:filename', (req, res) => {
    const fileName = req.params.filename;
 	// console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
  });

  router.post('/:list_id/:child_id/liked/add', (req, res) => {
    TenantRequest.findById(req.params.list_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
      if (err) {
        console.log('listing not found');
        res.send('listing_not_found');
      }

      // find the index of child listing of which ID matches.
      let indexOfMatchingChildListing = -1;
      const childListingId = req.params.child_id;
      for (let index = 0; index < foundListing.child_listings.length; index++) {
        if (foundListing.child_listings[index].listing_id.equals(childListingId)) {
          indexOfMatchingChildListing = index;
          break;
        }
      }

      if (indexOfMatchingChildListing !== -1) {
        addUserToList(foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser, req.user._id);

        foundListing.save();
        // console.warn('Successfully added');
        // sendDashboardAutoRefresh(foundListing.child_listings[indexOfMatchingChildListing].shared_user_group);
        sendDashboardAutoRefresh(req.user.username, foundListing.shared_user_group);
        res.send('Successfully added');
      } else {
        console.warn('No child listing found with given ID');
        res.send('No child listing found with given ID');
      }
    });
  });

  router.post('/:list_id/:child_id/liked/remove', (req, res) => {
    TenantRequest.findById(req.params.list_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
      if (err) {
        console.log('listing not found');
        res.send('listing_not_found');
      }

      // find the index of child listing of which ID matches.
      let indexOfMatchingChildListing = -1;
      const childListingId = req.params.child_id;
      for (let index = 0; index < foundListing.child_listings.length; index++) {
        if (foundListing.child_listings[index].listing_id.equals(childListingId)) {
          indexOfMatchingChildListing = index;
          break;
        }
      }

      if (indexOfMatchingChildListing !== -1) {
        if (foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser !== undefined) {
          foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser = foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser.filter(_objId => _objId.equals(req.user._id) === false);
        }

        foundListing.save();
        // console.warn(`Successfully removed, length = ${foundListing.child_listings[indexOfMatchingChildListing].listOfLikedUser.length}`);
        sendDashboardAutoRefresh(req.user.username, foundListing.shared_user_group);
        res.send('Successfully removed');
      } else {
        console.warn('No child listing found with given ID');
        res.send('No child listing found with given ID');
      }
    });
  });


  router.post('/addChild', (req, res) => {
    // console.log("addChild post event. listing_id = " + req.body.parent_listing_id);

    TenantRequest.findById(req.body.parent_listing_id).populate('requester').populate('shared_user_group', 'username').exec((err, foundListing) => {
      if (err) {
        console.log('listing not found');
        res.send('listing_not_found');
        return;
      }

      // console.log("listing  found");

      const listing_type = (req.body.listing_type == '_3rdparty') ? '_3rdPartyListing' : 'LandlordRequest';

      const child_listing = {
 		    listing_id: {
          type: mongoose.Schema.Types.ObjectId,
		  		      ref: listing_type
        },
			  listing_type,
			  created_by: { id: null, username: '' },
			  shared_user_group: []
      };

      // console.log("child_listing_id = " + req.body.child_listing_id);

      child_listing.listing_id = req.body.child_listing_id;

      // let's check if it's a duplicate request.
      let foundDuplicate = false;

      // console.log("foundListing = " + JSON.stringify(foundListing));

      if (foundListing.child_listings.length >= 1) {
        foundListing.child_listings.forEach(
          (listing) => {
            console.log(`Child listing = ${JSON.stringify(listing)}`);
            if (listing.listing_id.equals(req.body.child_listing_id)) {
              foundDuplicate = true;
            }
          }
        );

        if (foundDuplicate == true) {
          console.log('Duplicate request');
          res.send('Duplicate request');
          return;
        }
      }

      // default user group
      // 1. check if the parent listing is created by me
      // console.log("req.user._id="+req.user._id);
      // console.log("foundListing.requester.id="+foundListing.requester.id);

      if (foundListing.requester.equals(req.user._id)) {
        // console.log("Updating user group, created by the current user");
        child_listing.shared_user_group.push(foundListing.requester);

        child_listing.created_by.id = req.user._id;
        child_listing.created_by.username = foundListing.requester.username;

        foundListing.child_listings.push(child_listing);
      }
      // tenant & creator of child listing
      else {
        // console.log("Updating user group, created by friend");

        // <note> the 3rd party listing could be added by either tenant or friends.
        // It's a friend case.
        child_listing.created_by.id = foundListing.requester;
        child_listing.created_by.username = req.user.username;

        child_listing.shared_user_group.push(foundListing.requester);
        child_listing.shared_user_group.push(req.user._id);
        foundListing.child_listings.push(child_listing);
      }

      // send auto-refresh to shared_user_group
      // build user name list
      /*
      const userNameList = [];
      for (let index = 0; index < foundListing.shared_user_group.length; index++) {
        userNameList.push(foundListing.shared_user_group[index].username);
      }

      chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, userNameList); */

      foundListing.save((err) => {
        if (err) {
          console.warn(`foundListing saving error = ${err}`);
          res.send('child listing add failed');
        } else {
          res.send('Successfully added');
          // send auto-refresh to shared_user_group
          // build user name list
          const userNameList = [];
          for (let index = 0; index < foundListing.shared_user_group.length; index++) {
            if (req.user.username !== foundListing.shared_user_group[index].username) {
              userNameList.push(foundListing.shared_user_group[index].username);
            }
          }
          chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, userNameList);
        }
      });
    });
  });


  router.post('/removeChild', (req, res) => {
    TenantRequest.findById(req.body.parent_listing_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
      if (err) {
        console.log('listing not found');
        res.send('listing_not_found');
        return;
      }

      // console.log("remove 3rd party listing");

      if (foundListing.child_listings.length == 0) {
        console.log('no child listing found');
        res.send('no child lising found');
        return;
      }


      // use filter to create a new array
      const tempArray = [];
      let listingIndex = -1;

      // find the matching listingIndex
      for (let index = 0; index < foundListing.child_listings.length; index++) {
        if (foundListing.child_listings[index].listing_id.equals(req.body.child_listing_id)) {
          listingIndex = index;
        } else {
          tempArray.push(foundListing.child_listings[index]);
        }
      }

      if (listingIndex !== -1) {
        const listing = foundListing.child_listings[listingIndex];
        const numOfUsers = listing.shared_user_group.length;
        let numOfUsersProcessed = 0;

        listing.shared_user_group.map(async (user, userIndex) => {
          // console.warn(`listingIndex = ${listingIndex}`);
          // console.warn(`userIndex = ${userIndex}`);

          const pathToPopulate = `child_listings.${listingIndex}.shared_user_group.${userIndex}`;
          await foundListing.populate(pathToPopulate, 'username profile_picture loggedInTime').execPopulate();
          foundListing.populated(pathToPopulate);

          // console.warn(`populated foundListing: ${JSON.stringify(foundListing)}`);

          // console.warn(`foundListing: ${JSON.stringify(foundListing.child_listings[0].shared_user_group[userIndex])}`);

          // chatServer.removeChannelFromUserDb(user.username, req.body.channel_id_prefix);
          // console.warn('user name=', foundListing.child_listings[listingIndex].shared_user_group[userIndex].username);
          chatServer.removeChannelFromUserDb(foundListing.child_listings[listingIndex].shared_user_group[userIndex].username, req.body.channel_id_prefix);

          // <note> saving should be done here?
          // Nope... not really. it's so messy logic.

          numOfUsersProcessed++;

          if (numOfUsersProcessed === numOfUsers) {
            foundListing.child_listings = [...tempArray];

            foundListing.save((err) => {
              if (err) {
                console.warn(`foundListing saving error = ${err}`);
                res.send('child listing removal failed');
              } else {
                // remove chatting channels from chatting channel DB as well
                chatDbHandler.removeChannelsByPartialChannelId(req.body.channel_id_prefix);
                res.send('Child listing removed successfully');

                // send auto-refresh to shared_user_group
                // build user name list
                const userNameList = [];
                for (let index = 0; index < foundListing.shared_user_group.length; index++) {
                  if (req.user.username !== foundListing.shared_user_group[index].username) {
                    userNameList.push(foundListing.shared_user_group[index].username);
                  }
                }
                chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, userNameList);
              }
            });
          }
        });
      } else {
        console.log('no matching child listing found');
        res.send('no child lising found');
      }
    });
  });


  function preprocessingListing(listing, preferences) {
    if (listing.rental_preferences.furnished != 'off') {
      preferences.push('Furnished');
    }

    if (listing.rental_preferences.kitchen != 'off') {
      preferences.push('Kitchen');
    }

    if (listing.rental_preferences.parking != 'off') {
      preferences.push('Parking');
    }

    if (listing.rental_preferences.internet != 'off') {
      preferences.push('Internet');
    }

    if (listing.rental_preferences.private_bathroom != 'off') {
      preferences.push('Private Bathroom');
    }

    if (listing.rental_preferences.separate_access != 'off') {
      preferences.push('Separate Entrance');
    }

    if (listing.rental_preferences.smoking_allowed != 'off') {
      preferences.push('Smoke Friendly');
    }

    if (listing.rental_preferences.pet_allowed != 'off') {
      preferences.push('Pet Allowed');
    }

    if (listing.rental_preferences.easy_access_public_transport != 'off') {
      preferences.push('Easy Access to Public Transport');
    }
  }

  // forward listing to direct friends
  router.post('/:list_id/forward', (req, res) => {
    userDbHandler.handleListingForward(req, res, 'tenant');
  });

  return router;
};
