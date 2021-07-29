const express = require('express');
const router = express.Router();
const node = require('deasync');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');

const Event = require('../../models/listing/event');
const User = require('../../models/user');

const userDbHandler = require('../../db_utilities/user_db/access_user_db');
const listingDbHandler = require('../../db_utilities/listing_db/access_listing_db');
const chatDbHandler = require('../../db_utilities/chatting_db/access_chat_db');
const chatServer = require('../../chatting_server');
const { handleLikeAction,  handleDislikeAction, handleNeutralAction } = require('../../utilities/listing_utilities');
const { fileDeleteFromCloud } = require('../../aws_s3_api');
const serverPath = './src/server';

node.loop = node.runLoopOnce;

function createNewEvent(req, res, coordinates) { 
    const newEvent = new Event();
    try {
    newEvent.requester = req.user._id;
    newEvent.location = req.body.reverseLocation;
    //console.warn(`createNewEvent: location=${newEvent.location}`);

    newEvent.date = req.body.date;
    newEvent.summary = req.body.summary;
    newEvent.coordinates = coordinates;
    newEvent.state = 0;

    newEvent.shared_user_group.push(req.user._id);
    // organizer will be implicitly added to the attendance list
    newEvent.attendanceList.push(req.user.username);

    } catch (err) {
        res.json({result: 'FAIL', reason: err});
        return;
    }


    newEvent.save(async (err) => {
        if (err) {
            console.warn(`New Event Save Failure: err=${err}`);
            res.json({result: 'FAIL', reason: 'New Event Save Failure'});
            return;
        }

        User.findById(req.user._id, async (err, foundUser) => {
            if (err) {
                console.warn(`User not found`);
                res.json({result: 'FAIL', reason: 'user not found'});
            }

            if(req.body.userList.length>1) {
              // create a group channel based on user list
              let groupChat = await chatDbHandler.getGroupChat(req.user.username, req.body.userList, 0, newEvent._id);
              groupChat.friend_list.push({username: foundUser.username, profile_picture: foundUser.profile_picture});
              newEvent.list_of_group_chats.push(groupChat);
              newEvent.save();
            }

            foundUser.events.push(newEvent._id);

            //console.warn(`createNewEvent successful`);

            // let's share this event with friends if any
            //console.warn(`forwarding events: length of friends = ${req.body.userList.length}`);
            let userNameList = await userDbHandler.forwardEvents(newEvent, foundUser, req.body.userList);
            //console.warn(`length of userNameList =${JSON.stringify(userNameList)}`);
            chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH_EVENT, userNameList, foundUser.username);

            
            foundUser.save(()=>res.json({result: 'OK'}));
        });
    });
}

module.exports = function (app) {

    router.post('/new', async (req, res) => {
        /* req.body
        {
        location: {
            street:
            city:
            state:
            zipcode:
            country
        },
        coordinates: {
            lat,
            lng
        },
        date,
        summary,
        userList: [ {userName} ]
        }
        */
        if(req.body.coordinates!==null) {
            createNewEvent(req, res, req.body.coordinates);
        }
        else {
            if(req.body.location!==null) {
                const {
                    street, city, state, zipcode, country
                } = req.body.location;
                const address = `${street}, ${city}, ${state}, ${zipcode}. ${country}`;
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`).then(
                    response => response.json()).then((response) => {
                        const { results, status } = response;
                        if (status === 'OK') {
                            const { geometry } = results[0];
                            const { location } = geometry;
                            createNewEvent(req, res, location);
                        } else {
                            console.warn('New Event Creation failure');
                            res.json({result: 'FAIL', reason: 'Location is wrong'});
                        }
                    }
                );
            }
            else {
                console.warn(`Location is not provided`);
                res.json({result: 'FAIL', reason: 'Location is not provided'});
            }
        }
    });

    router.get('/:list_id/fetch', (req, res) => {
        //console.log(`REACT: fetch event with listing id= ${JSON.stringify(req.params.list_id)}`);
        Event.findById(req.params.list_id, async (err, foundListing) => {
          if (err || foundListing === null) {
            console.warn('Listing not found');
            console.warn(`err=${err}`);
            res.json({result: 'FAIL', reason: 'Listing not found'});
            return;
          }
    
          /* await foundListing.populate('requester', 'username profile_picture loggedInTime').execPopulate();
          foundListing.populated('requester'); */
          if (req.user === undefined) {
            res.json(foundListing);
            return;
          }
    
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
    

                let pathToDislikedUserList = `child_listings.${index}.listOfDislikedUser`;
                await foundListing.populate(pathToDislikedUserList, 'username').execPopulate();
                foundListing.populated(pathToDislikedUserList);

                //console.warn(`listOfDislikedUser: =${JSON.stringify(foundListing.child_listings[index].listOfDislikedUser)}`);

                let pathToUserList = `child_listings.${index}.listOfLikedUser`;
                await foundListing.populate(pathToUserList, 'username').execPopulate();
                foundListing.populated(pathToUserList);

                //console.warn(`listOfLikedUser: =${JSON.stringify(foundListing.child_listings[index].listOfLikedUser)}`);



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
              await foundListing.populate('requester', 'username lastname firstname profile_picture loggedInTime').execPopulate();
              foundListing.populated('requester');
    
              // update status of listing ID from friends
              //console.log(`foundListing.requester=${JSON.stringify(foundListing.requester)}`);
    
              res.json(foundListing);
    
              // update recent visited listing
              foundUser.lastVistedListingId = req.params.list_id;
            });
          });
        });
      });

      router.post('/addChild', (req, res) => {
        // console.log("addChild post event. listing_id = " + req.body.parent_listing_id);
        if (req.user === undefined) {
          console.warn('addChild failure as req.user is undefined');
          res.json({result: 'FAIL', reason: 'addChild only allowed for authorized users'});
        }
    
        Event.findById(req.body.parent_listing_id).populate('requester').populate('shared_user_group', 'username').exec((err, foundListing) => {
          if (err) {
            console.log('listing not found');
            res.json({result: 'FAIL', reason: 'listing not found'});
            return;
          }
    
          // console.log("listing  found");
          // support restuarant only for now.
          const listing_type = 'Restaurant';
    
          const child_listing = {
            listing_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: listing_type
            },
            listing_type,
            created_by: { id: null, username: '' },
            shared_user_group: []
          };
    
          child_listing.listing_id = ObjectId(req.body.child_listing_id);
    
          // let's check if it's a duplicate request.
          let foundDuplicate = false;
    
          // console.log("foundListing = " + JSON.stringify(foundListing));
    
          if (foundListing.child_listings.length >= 1) {
            foundListing.child_listings.forEach(
              (listing) => {
                if (listing.listing_id.equals(req.body.child_listing_id)) {
                  foundDuplicate = true;
                }
              }
            );
    
            if (foundDuplicate == true) {
                res.json({result: 'FAIL', reason: 'Duplicate exists'});
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
    
            //console.warn(`adding child listing: ${JSON.stringify(child_listing)}`);
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
            //console.warn(`adding child listing: ${JSON.stringify(child_listing)}`);
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
              res.json({result: 'FAIL', reason: 'child listing add failed'});
            } else {
                res.json({result: 'OK'});
                // send auto-refresh to shared_user_group
                // build user name list
                const userNameList = [];
                for (let index = 0; index < foundListing.shared_user_group.length; index++) {
                if (req.user.username !== foundListing.shared_user_group[index].username) {
                    userNameList.push(foundListing.shared_user_group[index].username);
                }
                }
                chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH_EVENT, userNameList);
            }
          });
        });
      });

      router.post('/:list_id/attendance', (req, res) => {

        Event.findById(req.params.list_id, (err, foundEvent) => {
          if(err) {
            res.json({result: 'FAIL', reason: 'event not found'})
            return;
          }

          let _attendanceList = [];

          if(foundEvent.attendanceList) {
            _attendanceList = foundEvent.attendanceList;
          }

          let _attendance = req.body.attendance;

          if(_attendance===true) {
            //console.warn(`Attending`);
            _attendanceList.push(req.user.username);
          } 
          else {
            //console.warn(`Skipping`);
            let _index= _attendanceList.indexOf(req.user.username);
            _attendanceList.splice(_index, 1);
          }

          foundEvent.attendanceList = _attendanceList;

          //console.warn(`_attendanceList=${JSON.stringify(_attendanceList)}`);
          foundEvent.save();
          res.json({result: 'OK'});

        });  
      
      });

      router.delete('/:list_id', (req, res) => {

        function finalProcess(res, foundListing, totalNumberOfUser, numOfProcessed) {
            //console.warn(`finalProcess: numOfProcessed=${numOfProcessed}`);
            // clean up chatting related resources
            // 1. go through all the child listing and remove chatting channels.
            // <note> how to ensure that previous action has been completed?
            if(totalNumberOfUser===numOfProcessed) {
              listingDbHandler.cleanAllChildListingsFromParent(foundListing);
              foundListing.remove();
              res.json({result: 'OK'});
            }
        }

        Event.findById(req.params.list_id, (err, foundListing) => {
            if (err || foundListing===null) {
                console.log('Listing not found');
                res.json({result: 'FAIL', reason: 'Event not found with given ID'});
                return;
            }
    
    
            // 3. remove channels in the parent level
            const channel_id_prefix = `${req.params.list_id}-`;
            chatDbHandler.removeChannelsByPartialChannelId(channel_id_prefix);
            let numOfProcessed = 0;
            let totalNumberOfUser = (foundListing.shared_user_group)? foundListing.shared_user_group.length : 0;

            if(foundListing.shared_user_group) {
              foundListing.shared_user_group.map(async (user, userIndex) => {
                  const pathToPopulate = `shared_user_group.${userIndex}`;
                  await foundListing.populate(pathToPopulate, 'username').execPopulate();
                  foundListing.populated(pathToPopulate);
          
                  const userName = foundListing.shared_user_group[userIndex].username;
          
                  userDbHandler.getUserByName(userName).then((foundUser) => {
                  const new_dm_channels = [];
          
                  for (let index = 0; index < foundUser.chatting_channels.dm_channels.length; index++) {
                      const channel = foundUser.chatting_channels.dm_channels[index];
                      if (channel.name.search(channel_id_prefix) != -1) {
                      // remove the chatting channel from chatting server.
                      chatServer.removeChannel(channel.name);
                      } else {
                      new_dm_channels.push(channel);
                      }
                  }
                  foundUser.chatting_channels.dm_channels = new_dm_channels;
                                    
                  // check if current user is the creator
                  if (foundListing.requester.equals(foundUser._id)) {
                    userDbHandler.deleteOwnListing(foundUser, foundListing);
                  } else {
                      // console.warn(`deleteListingFromFriends`);
                    userDbHandler.deleteListingFromFriends(foundUser, foundListing);
                  }

                  foundUser.save(()=> finalProcess(res, foundListing, totalNumberOfUser, ++numOfProcessed));

                  chatServer.sendDashboardControlMessageToSingleUser(
                    chatServer.DASHBOARD_AUTO_REFRESH_EVENT, 
                    foundUser.username, 
                    {
                      target: 'event',
                      type: 'delete',
                      id: req.params.list_id
                    });
                  });
                  // chatServer.removeChannelFromUserDb(foundListing.shared_user_group[userIndex].username, channel_id_prefix);
              });
            }



        });
      });

      // forward listing to direct friends
      // Let's move it to common utility
      router.post('/:list_id/forward', async (req, res) => {
        //console.warn(`EVENT: forward`);
        userDbHandler.handleListingForward(req, res, 'event');
      });



      router.post('/:list_id/addUserGroup', (req, res) => {
        // console.warn('addUserGroup');
        Event.findById(req.params.list_id, (err, foundListing) => {
          function checkDuplicate(user_list, _id) {
            let bDuplicate = false;
    
            if (user_list.length >= 1) {
              bDuplicate = user_list.some(
                _user => _user.equals(_id)
              );
            }
    
            return bDuplicate;
          }
    
          if (err || foundListing===null ) {
            console.warn('Listing not found');
            res.json({ result: 'Listing not found' });
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
                if (checkDuplicate(foundListing.shared_user_group, _friend._id) === false) {
                  foundListing.shared_user_group.push(_friend._id);
                }
    
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
    
                if (checkDuplicate(foundListing.child_listings[childInfo.index].shared_user_group, _friend._id) === false) {
                  // console.log(`Pushing friend = ${_friend.username}`);
                  foundListing.child_listings[childInfo.index].shared_user_group.push(_friend._id);
                }
    
                // let's add the current user if it's not the shared_user_group yet.
                if (checkDuplicate(foundListing.child_listings[childInfo.index].shared_user_group, req.user._id) === false) {
                  // console.warn('adding current user');
                  foundListing.child_listings[childInfo.index].shared_user_group.push(req.user._id);
                }
    
                break;
              default:
                console.log('Unknown chattingType');
                res.json({ result: 'Unknown chattingType' });
                return;
            }
    
            foundListing.save(async (err) => {
              if (err) {
                res.json({ result: 'DB save failure' });
                return;
              }
              // console.log('ISEO: user added successfully');
              res.json({ result: 'Added successfully' });
    
              // we should notify to other people in the group.
              let pathToPopulate = '';
    
              if (chattingType === 1) {
                pathToPopulate = 'shared_user_group';
              } else {
                pathToPopulate = `child_listings.${childInfo.index}.shared_user_group`;
              }
    
              await foundListing.populate(pathToPopulate, 'username').execPopulate();
              foundListing.populated(pathToPopulate);
    
              const userNameList = [];
              const notificationUserList = (chattingType === 1) ? foundListing.shared_user_group : foundListing.child_listings[childInfo.index].shared_user_group;
    
              for (let index = 0; index < notificationUserList.length; index++) {
                if (req.user.username !== notificationUserList[index].username) {
                  userNameList.push(notificationUserList[index].username);
                }
              }
              // <note> sendDashboardControlMessage expects username, not the ID
              chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH_EVENT, userNameList);
            });
          });
        });
      });


      router.post('/:list_id/addGroupChat', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundListing) => {
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
                    console.warn(`addGroupChat failure with reason=${err}`);
                    res.json({ result: 'DB save failure' });
                    return;
                  }
                  // console.log('addGroupChat: user added successfully');
                  // console.log(`addGroupChat: list_of_group_chats = ${JSON.stringify(foundListing.list_of_group_chats)}`);
                  res.json({ result: 'Added successfully' });
              });
            }
          });
        });
      });

      router.post('/:list_id/:child_id/vote/like', (req, res) => {
        Event.findById(req.params.list_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
          if (err) {
            console.log('listing not found');
            res.send('listing_not_found');
          }

          handleLikeAction(req, res, foundListing);
        });
      });
    
      router.post('/:list_id/:child_id/vote/dislike', (req, res) => {
        Event.findById(req.params.list_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
          if (err) {
            console.log('listing not found');
            res.send('listing_not_found');
          }
          handleDislikeAction(req, res, foundListing);

        });
      });

      router.post('/:list_id/:child_id/vote/neutral', (req, res) => {
        Event.findById(req.params.list_id).populate('shared_user_group', 'username').exec((err, foundListing) => {
          if (err) {
            console.log('listing not found');
            res.send('listing_not_found');
          }
          handleNeutralAction(req, res, foundListing);
        });
      });

      router.post('/:list_id/update', (req, res) => {
        Event.findById(req.params.list_id, (err, foundEvent) => {
          if (err) {
            console.warn('listing not found');
            res.send('listing_not_found');
          }

          // 1. update summary if any
          if(req.body.summary) {
            foundEvent.summary = req.body.summary;
          }

          if(req.body.date) {
            foundEvent.date = req.body.date;
          }

          if(req.body.reverseLocation && req.body.coordinates) {
            foundEvent.location = req.body.reverseLocation;
            foundEvent.coordinates = req.body.coordinates;
          }

          foundEvent.save(()=>res.json({result: 'OK'}));
        });
      });

    return router;
};