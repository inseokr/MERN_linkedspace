const express = require('express');
const router = express.Router();
const node = require('deasync');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');

//const cheerio = require(`cheerio`);
//const axios = require('axios');
//const request = require('request');

const Event = require('../../models/listing/event');
const User = require('../../models/user');
const Restaurant = require('../../models/place/Restaurant');

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
    newEvent.endDate = req.body.endDate;
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
            res.json(null);
            return;
          }
    
          /* await foundListing.populate('requester', 'username profile_picture loggedInTime').execPopulate();
          foundListing.populated('requester'); */
          if (req.user === undefined) {
            res.json(null);
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


      // req.body: {channel_id_prefix, child_listing_id}
      // req.body: {childIndex}
      router.post('/:list_id/removeChild', (req, res) => {
        // console.log("addChild post event. listing_id = " + req.body.parent_listing_id);
        if (req.user === undefined) {
          console.warn('removeChild failure as req.user is undefined');
          res.json({result: 'FAIL', reason: 'removeChild only allowed for authorized users'});
        }
    
        Event.findById(req.params.list_id).populate('requester').populate('shared_user_group', 'username').exec((err, foundListing) => {
          if (err) {
            console.log('event not found');
            res.json({result: 'FAIL', reason: 'event not found'});
            return;
          }
    
          if (foundListing.child_listings.length == 0) {
            console.log('no child listing found');
            res.json({result: 'FAIL', reason: 'no child listing'});
            return;
          }
    
          // use filter to create a new array
          let childIndex = req.body.childIndex;
          let child_listing_id = foundListing.child_listings[childIndex].listing_id;
          let channel_id_prefix = `${req.params.list_id}-child-${child_listing_id}`;

          //console.warn(`channel_id_prefix: ${channel_id_prefix}`);
    
          if (childIndex !== -1) {
            const listing = foundListing.child_listings[childIndex];
            const numOfUsers = listing.shared_user_group.length;
            let numOfUsersProcessed = 0;
    
            listing.shared_user_group.map(async (user, userIndex) => {
              // console.warn(`listingIndex = ${listingIndex}`);
              // console.warn(`userIndex = ${userIndex}`);
    
              const pathToPopulate = `child_listings.${childIndex}.shared_user_group.${userIndex}`;
              await foundListing.populate(pathToPopulate, 'username profile_picture loggedInTime').execPopulate();
              foundListing.populated(pathToPopulate);
    
              chatServer.removeChannelFromUserDb(foundListing.child_listings[childIndex].shared_user_group[userIndex].username, channel_id_prefix);

              // <note> saving should be done here?
              // Nope... not really. it's so messy logic.
              numOfUsersProcessed++;
    
              if (numOfUsersProcessed === numOfUsers) {
                foundListing.child_listings.splice(childIndex, 1);
    
                foundListing.save((err) => {
                  if (err) {
                    console.warn(`foundListing saving error = ${err}`);
                    res.json({result: 'FAIL', reason: 'child listing removal failed'});
                  } else {
                    // remove chatting channels from chatting channel DB as well
                    chatDbHandler.removeChannelsByPartialChannelId(channel_id_prefix);
                    res.json({result: 'OK'});

                    // send auto-refresh to shared_user_group
                    // build user name list
                    const userNameList = [];
                    for (let index = 0; index < foundListing.shared_user_group.length; index++) {
                      if (req.user.username !== foundListing.shared_user_group[index].username) {
                        userNameList.push(foundListing.shared_user_group[index].username);
                      }
                    }
                    chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH, userNameList);

                    // remove the place/restaurant from DB
                    Restaurant.findById(child_listing_id, (err, place) => {
                      if (err) {
                        console.warn('place not found');
                        return;
                      }

                      try {
                        if(place.coverPhoto.path != '') {
                          let foundIndex = place.coverPhoto.path.indexOf('user_resources');

                          if(foundIndex!==-1) {
                            fileDeleteFromCloud(place.coverPhoto.path);
                            fs.unlinkSync(serverPath + place.coverPhoto.path);
                          }

                        }
                      } catch (err) {
                        console.error(err);
                      }
                      place.remove();
                    });
                  }
                });
              }
            });
          } else {
            console.warn('no matching child listing found');
            res.json({result: 'FAIL', reason: 'no child lising found'});
          }
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

      router.post('/:list_id/hide', (req, res) => {

        Event.findById(req.params.list_id, (err, foundEvent) => {
          if(err) {
            res.json({result: 'FAIL', reason: 'event not found'})
            return;
          }

          const { childIndex } = req.body;
          if(foundEvent.child_listings.length && foundEvent.child_listings[childIndex]) {
            foundEvent.child_listings[childIndex].hide = true;
          }

          foundEvent.save();
          res.json({result: 'OK'});
        });  
      
      });

      router.post('/:list_id/show', (req, res) => {

        Event.findById(req.params.list_id, (err, foundEvent) => {
          if(err) {
            res.json({result: 'FAIL', reason: 'event not found'})
            return;
          }

          const { childIndex } = req.body;
          if(foundEvent.child_listings.length && foundEvent.child_listings[childIndex]) {
            foundEvent.child_listings[childIndex].hide = false;
          }

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

      router.post('/:list_id/modifyGroupChat', async (req, res) => {
        //console.warn(`Modifying Group Chat..........................................................`);
        Event.findById(req.params.list_id, async (err, foundEvent) => {
          if (err) {
            console.warn('event not found');
            res.send('event not found');
          }

          let { oldChannelId, newChannelId, childIndex, newMember, operation } = req.body;

          try {
          if(operation==='add') {
            // 1. update chatting channel database
            let channel = await chatDbHandler.updateChannelId(oldChannelId, newChannelId);

            // 2. update user data base
            await userDbHandler.updateChannelId(foundEvent.list_of_group_chats[0].friend_list, oldChannelId, newChannelId);

            // <note> let's handle parent level for now
            let list_of_group_chats = (childIndex>=0)? foundEvent.child_listings[childIndex].list_of_group_chats: foundEvent.list_of_group_chats;

            if(list_of_group_chats) {
              for(let index=0;index<list_of_group_chats.length; index++) {
                if(list_of_group_chats[index].channel_id===oldChannelId){
                  // update channel ID
                  list_of_group_chats[index].channel_id = newChannelId;
                  // add member
                  // {username, profile_picture}
                  list_of_group_chats[index].friend_list.push(newMember);
                  foundEvent.save(()=>res.json({result: 'OK'}));
                  break;
                }
              }
            }

            // 4. add the group chat to the newly added member
            if(channel) {
              let user = await userDbHandler.getUserByName(newMember.username);
              if(user) {
                await chatDbHandler.addChannelToSingleUser(channel, user);
              }
            }

            // 5. update mapping table in chatting_servers
            chatServer.updateSocketMap(oldChannelId, newChannelId);
          }
          } catch(err) {
            res.json({result: 'FAIL'});
            console.warn(`err=${err}`);
          }
        });
       
      });


      router.post('/:list_id/addGroupChat', (req, res) => {

        Event.findById(req.params.list_id, async (err, foundListing) => {
          if (err) {
            console.log('Listing not found');
            res.json({ result: 'Listing not found' });
            return;
          }

          function checkDuplicate(group_chat_list, channelId) {
            let bDuplicate = false;
    
            if (group_chat_list.length >= 1) {
              bDuplicate = group_chat_list.some(
                group_chat => group_chat.channel_id===channelId
              );
            }
    
            return bDuplicate;
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

          if(checkDuplicate(
              (chattingType==1) ? 
                foundListing.list_of_group_chats: 
                foundListing.child_listings[childInfo.index].list_of_group_chats, 
                req.body.channel_id)===true) {
                  console.warn('Channel=$channelId exists already');
                  res.json({ result: 'Channel exists already' });
                  return;
          }
    
          friends.forEach(async (_friend) => {
            const result = await listingDbHandler.addToSharedUserGroup(foundListing, _friend.username, chattingType, childInfo.index, false);

            if(result===0) {
              console.warn(`user's already in the shared user group??`);
              //res.json({ result: 'Duplicate user found'});
              //return;
            }

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
                // need to check duplicate...
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
            return;
          }

          // 1. update summary if any
          if(req.body.summary) {
            foundEvent.summary = req.body.summary;
          }

          if(req.body.date) {
            foundEvent.date = req.body.date;
          }

          if(req.body.endDate) {
            foundEvent.endDate = req.body.endDate;
          }

          if(req.body.reverseLocation && req.body.coordinates) {
            foundEvent.location = req.body.reverseLocation;
            foundEvent.coordinates = req.body.coordinates;
          }

          foundEvent.save(()=>res.json({result: 'OK'}));
        });
      });

      router.post('/:list_id/postNote', (req, res) => {
        Event.findById(req.params.list_id, (err, foundEvent) => {
          if (err) {
            console.warn('listing not found');
            res.json({result: 'fail', reason: 'listing not found'});
            return;
          }

          let {childIndex, content} = req.body;

          if(childIndex!==-1) {
            if(foundEvent.child_listings[childIndex]) {
              foundEvent.child_listings[childIndex].note = content;
            }
          }
          else {
            foundEvent.note = content;
          }
          foundEvent.save(()=>res.json({result: 'success'}));
        });
      });

      router.post('/:list_id/setDateOnPlace', (req, res) => {
        Event.findById(req.params.list_id, (err, foundEvent) => {
          if (err) {
            console.warn('listing not found');
            res.json({result: 'fail', reason: 'listing not found'});
            return;
          }

          let {childIndex, date} = req.body;

          if(childIndex!==-1) {
            if(foundEvent.child_listings[childIndex]) {
              foundEvent.child_listings[childIndex].date = date;
            }
          }
          foundEvent.save(()=>res.json({result: 'success'}));
        });
      });

      router.post('/:list_id/filter/update', (req, res) => {
        Event.findById(req.params.list_id, (err, foundEvent) => {
          if (err) {
            console.warn('listing not found');
            res.json({result: 'fail', reason: 'listing not found'});
            return;
          }

          let {filter} = req.body;

          foundEvent.filter = filter;
          
          foundEvent.save(()=>res.json({result: 'success'}));
        });
      });


      router.post('/:list_id/label/update', (req, res) => {
        Event.findById(req.params.list_id, (err, foundEvent) => {
          if (err) {
            console.log('listing not found');
            res.send('listing_not_found');
          }

          let {childIndex, selectedList} = req.body;

          if(childIndex===-1 || !selectedList) {
            console.warn(`Not applicable`);
            return;
          }
      
          //console.warn(`childIndex=${childIndex}, selectedList=${JSON.stringify(selectedList)}`);
          foundEvent.child_listings[childIndex].labels = [...selectedList];
      
          // add any new label to the main list
          if(!foundEvent.labels || foundEvent.labels.length===0) {
            foundEvent.labels = selectedList;
      
          } else {
            for(let index=0; index< selectedList.length; index++) {
              if(foundEvent.labels.indexOf(selectedList[index])===-1) {
                foundEvent.labels.push(selectedList[index]);
              }
            }
          }
          foundEvent.save(()=>res.json({result: 'success'}));
        });
      });

      router.get('/:list_id/friends-location', async (req, res) => {

        // working example
        // const response = await axios.get('https://www.theguardian.com/uk');
        // const html = response.data;
        // const $ = await cheerio.load(html);
        // $('.fc-item__title', html).each(function() {
        //   let title = $(this).text();
        //   console.warn(`title=${title}`);
        // })
        // const response = await axios.get('https://www.airbnb.com/rooms/12834174?check_in=2021-12-18&check_out=2021-12-19&federated_search_id=0af8cf52-2078-4b08-a3a4-525a4c275ef2&source_impression_id=p3_1639362135_mH%2FdS9RvZVxAx7%2F8&guests=1&adults=1');
        // const html = response.data;
        // const $ = await cheerio.load(html);
        // $('._6tbg2q', html).each(function() {
        //   let src = $(this).attr('src');
        //   console.warn(`title=${src}`);
        // })

        Event.findById(req.params.list_id, async (err, foundEvent) => {
          if (err) {
            console.log('listing not found');
            res.json({result: 'fail', err: 'listing not found'});
          }

          // 1. collect the last reported location of users
          await foundEvent.populate('shared_user_group', 'username lastReportedLocation').execPopulate();
          foundEvent.populated('shared_user_group');

          res.json({result: 'success', locations: foundEvent.shared_user_group});

          // 2. trigger to get the latest location
          chatServer.getLocation(req.params.list_id, foundEvent.shared_user_group, req.user.username, foundEvent.summary);
        });
      });

      router.post('/:list_id/send-user-location', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundEvent) => {

          if (err) {
            res.json({result: 'fail', err: 'listing not found'});
          }

          let location = req.body.location;
          let requester = req.body.requester;

          chatServer.sendUserLocation(req.params.list_id, requester, req.user.username, location);

          res.json({result: 'success'});
        });
      });

      // utilities for itinerary/route

      const getItineraryIndex = (itinerary, dayOffset)=> {
        if(itinerary && itinerary.length>0) {
          // check if there is any entry with the same dayOffset value

          for(let index=0; index<itinerary.length; index++) {
            if(itinerary[index] && itinerary[index].dayOffset===dayOffset) {
              return index;
            }
          }
          return -1;
        }
        else {
          return -1;
        }

      }

      // creating a new route
      router.post('/:list_id/itinerary/route', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundEvent) => {

          if (err) {
            res.json({result: 'fail', err: 'listing not found'});
            return;
          }

          let {dayOffset, routeName, route} = req.body;

          if(foundEvent.itinerary && foundEvent.itinerary.length>0) {
            // check if there is any entry with the same dayOffset value
            let itinerary = foundEvent.itinerary;
            let foundEntry = false;

            for(let index=0; index<itinerary.length; index++) {
              if(itinerary[index].dayOffset===dayOffset) {
                // check if there is any route with the same route name already
                for(let routeIndex=0; routeIndex<itinerary[index].routes.length; routeIndex++) {
                  if(routeName===itinerary[index].routes[routeIndex].routeName) {
                    res.json({result: 'fail', reason: 'route name already exists'});          
                    return;
                  }
                }
                // no duplicate route exists. let's add this route
                foundEntry = true;
                foundEvent.itinerary[index].routes.push({routeName: routeName, route: route});
              }
            }

            if(foundEntry===false) {
              let newEntry = {dayOffset: dayOffset, routes: []};
              newEntry.routes.push({routeName: routeName, route: route});
              foundEvent.itinerary.push(newEntry);

              foundEvent.save(()=> {
                  res.json({result: 'success'});
              });
            }
            else {
              foundEvent.save(()=> {
                res.json({result: 'success'});
              });
            }
          } 
          else {
            // it doesn't exist yet
            let newEntry = {dayOffset: dayOffset, routes: []};
            newEntry.routes.push({routeName: routeName, route: route});
            foundEvent.itinerary.push(newEntry);

            foundEvent.save(()=> {
                res.json({result: 'success'});
            });
          }
        });
      });

      // modify a route
      router.put('/:list_id/itinerary/route', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundEvent) => {

          if (err) {
            res.json({result: 'fail', err: 'listing not found'});
            return;
          }

          let {dayOffset, routeName, route} = req.body;

          // let's find a route with given parameters
          if(!foundEvent.itinerary || foundEvent.itinerary.length===0) {
            res.json({result: 'fail', err: 'no route found'});
            return;
          }

          let itinerary = foundEvent.itinerary;
          let foundEntry = false;

          for(let index=0; index<itinerary.length; index++) {
            if(itinerary[index].dayOffset===dayOffset) {
              // check if there is any route with the same route name already
              for(let routeIndex=0; routeIndex<itinerary[index].routes.length; routeIndex++) {
                if(routeName===itinerary[index].routes[routeIndex].routeName) {
                  // let's update it.
                  foundEvent.itinerary[index].routes[routeIndex].route = route;
                  foundEntry = true;
                  foundEvent.save(()=> {
                    res.json({result: 'success'});
                  })
                }
              }
            }
          }

          if(foundEntry===false) {
            res.json({result: 'fail', reason: 'no entry found to update'});
          }
        });
      });

      // delete a route
      router.delete('/:list_id/itinerary/route', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundEvent) => {

          if (err) {
            res.json({result: 'fail', err: 'listing not found'});
            return;
          }

          let {dayOffset, routeName, route} = req.body;

          // let's find a route with given parameters
          if(!foundEvent.itinerary || foundEvent.itinerary.length===0) {
            res.json({result: 'fail', err: 'no route found'});
            return;
          }

          let itinerary = foundEvent.itinerary;
          let foundEntry = false;

          for(let index=0; index<itinerary.length; index++) {
            if(itinerary[index].dayOffset===dayOffset) {
              // check if there is any route with the same route name already
              let newRouteList = itinerary[index].routes.filter((entry)=> entry.routeName!==routeName);

              foundEvent.itinerary[index].routes = newRouteList;

              foundEntry = true;
              foundEvent.save(()=> {
                res.json({result: 'success'});
              })
            }
          }

          if(foundEntry===false) {
            res.json({result: 'fail', err: 'no route found'});
          }
        });
      });


      // add place to a day
      router.post('/:list_id/itinerary/day/add', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundEvent) => {

          if (err) {
            res.json({result: 'fail', err: 'event not found'});
            return;
          }
          // dayOffset: 0(start date)..n(end date)
          // places: array of place index in the child_listings
          let {dayOffset, places} = req.body;

          let itinerary = foundEvent.itinerary;
          
          // check if there is an entry with given dayOffset already.
          let foundIndex = getItineraryIndex(itinerary, dayOffset);

          if(foundIndex!=-1) {
            // It exists already.
            // Let's check if it's the same as dayOffset. If not then let's relocate it.
            if(foundIndex!==dayOffset) {
              itinerary[dayOffset] = itinerary[foundIndex];
              // let's clean the entry as well
              itinerary[foundIndex] = undefined;
            }

            if(itinerary[dayOffset].places) {
              let _places = itinerary[dayOffset].places;
              itinerary[dayOffset].places = [..._places, ...places];
              //console.warn(`new place: place=${JSON.stringify(_currentListing.itinerary[dayOffset].places)}`);
            }
            else {
              itinerary[dayOffset].places = places;
              //console.warn(`new place: place=${JSON.stringify(currentListing.itinerary[dayOffset].places)}`);
            }

            foundEvent.save(()=> {
              res.json({result: 'success'});
            });

          }
          else {
            // doesn't exist. let's just copy it.
            let places2Add = places;
            itinerary[dayOffset] = {dayOffset, places: places2Add};

            foundEvent.save(()=> {
              res.json({result: 'success'});
            });
          }
        });
      });


      // Remove a place to a day
      // <note> Just a single entry for now.
      router.post('/:list_id/itinerary/day/remove', (req, res) => {
        Event.findById(req.params.list_id, async (err, foundEvent) => {

          if (err) {
            res.json({result: 'fail', err: 'event not found'});
            return;
          }
          // dayOffset: 0(start date)..n(end date)
          // places: array of place index in the child_listings
          let {dayOffset, places} = req.body;

          let itinerary = foundEvent.itinerary;
          
          // check if there is an entry with given dayOffset already.
          let foundIndex = getItineraryIndex(itinerary, dayOffset);

          let bSuccessfuRemoval = false;

          if(foundIndex!=-1) {
            // It exists already.
            // Let's check if it's the same as dayOffset. If not then let's relocate it.
            if(foundIndex!==dayOffset) {
              itinerary[dayOffset] = itinerary[foundIndex];
              // let's clean the entry as well
              itinerary[foundIndex] = undefined;
            }

            places.map((place)=> {
              itinerary[dayOffset].places = itinerary[dayOffset].places.filter((item)=> {return item.placeIndex!==place.placeIndex});
              bSuccessfuRemoval = true;
            })

           
          }
          else {
            if(itinerary[dayOffset] && itinerary[dayOffset].places && itinerary[dayOffset].places.length>0) {
              place2Remove.map((place)=> {
                itinerary[dayOffset].places = itinerary[dayOffset].places.filter((item)=> {return item.placeIndex!==place.placeIndex});
                bSuccessfuRemoval = true;
              })
            }
          }

          if(bSuccessfuRemoval===true) {
            foundEvent.save(()=> {
              res.json({result: 'success'});
            });
          }
          else {
            res.json({result: 'fail', err: 'no entry exist'});
          }
        });
    });

    // add place to a day
    router.put('/:list_id/itinerary/day/route/update', (req, res) => {
      Event.findById(req.params.list_id, async (err, foundEvent) => {
        if (err) {
          res.json({result: 'fail', err: 'event not found'});
          return;
        }
        // dayOffset: 0(start date)..n(end date)
        // places: array of place index in the child_listings
        let {dayOffset, direction, placeIndex} = req.body;
        let itinerary = foundEvent.itinerary;

        // need to update backend DB as well.
        if(direction==='up') {
          // move the place higher
          let _placeIndex = foundEvent.itinerary[dayOffset].places[placeIndex-1].placeIndex;

          foundEvent.itinerary[dayOffset].places[placeIndex-1].placeIndex = foundEvent.itinerary[dayOffset].places[placeIndex].placeIndex;
          foundEvent.itinerary[dayOffset].places[placeIndex].placeIndex = _placeIndex;
        }
        else {
          let _placeIndex = itinerary[dayOffset].places[placeIndex].placeIndex;
          
          foundEvent.itinerary[dayOffset].places[placeIndex].placeIndex = foundEvent.itinerary[dayOffset].places[placeIndex+1].placeIndex;
          foundEvent.itinerary[dayOffset].places[placeIndex+1].placeIndex = _placeIndex;
        }

        foundEvent.itinerary = [...itinerary];

        //console.warn(`new itinerary=${JSON.stringify(foundEvent.itinerary[dayOffset])}`);
        foundEvent.save((err)=> { 
          if(err) {
            console.warn(`err=${err}`);
            res.json({result: 'fail'});
          }
          res.json({result: 'success'});
        });
      });
    });


    // APIs related to comments
    router.post('/:list_id/comments/add', (req, res) => {
      Event.findById(req.params.list_id, async (err, foundEvent) => {

        if (err) {
          res.json({result: 'fail', err: 'listing not found'});
        }

        let {childIndex, channel_id, chatIndex, writer, message, timestamp, rating, photos} = req.body;

        if(childIndex>=0) {
          foundEvent.child_listings[childIndex].comments.push({channel_id, chatIndex, writer, message, timestamp, rating, photos});
        }
        else {
          foundEvent.comments.push({channel_id, chatIndex, writer, message, timestamp, rating, photos});
        }

        foundEvent.save((err)=> {
          if(err) {
            console.warn(`err=${err}`)
            res.json({result: 'fail'});
          }
          else {
            //console.warn(`Comment added successfully!!`);
            res.json({result: 'success'});
          }
        });

      });
    });

    // APIs related to comments
    router.put('/:list_id/comments/update', (req, res) => {
      console.warn(`Comment update API is called`);
      Event.findById(req.params.list_id, async (err, foundEvent) => {
        if (err) {
          res.json({result: 'fail', err: 'listing not found'});
        }

        let {childIndex, channel_id, chatIndex, writer, message, timestamp, rating, photos, commentIndex} = req.body;

        if(childIndex>=0) {
          foundEvent.child_listings[childIndex].comments[commentIndex] = {channel_id, chatIndex, writer, message, timestamp, rating, photos};
        }
        else {
          foundEvent.comments[commentIndex] = {channel_id, chatIndex, writer, message, timestamp, rating, photos};
        }

        foundEvent.save((err)=> {
          if(err) {
            console.warn(`err=${err}`)
            res.json({result: 'fail'});
          }
          else {
            console.warn(`Comment has been updated successfully!!`);
            res.json({result: 'success'});
          }
        });
      });
    });

    return router;
};