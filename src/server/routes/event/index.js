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
const { fileDeleteFromCloud } = require('../../aws_s3_api');
const serverPath = './src/server';


node.loop = node.runLoopOnce;

function createNewEvent(req, res, coordinates) { 
    const newEvent = new Event();

    try {
    newEvent.requester = req.user._id;
    newEvent.location = req.body.location;
    newEvent.date = req.body.date;
    newEvent.dateString = `${newEvent.date.toLocaleTimeString([], 
                                {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}`;
    newEvent.summary = req.body.summary;
    newEvent.coordinates = coordinates;
    newEvent.state = 0;

    newEvent.shared_user_group.push(req.user._id);
    } catch (err) {
        res.json({result: 'FAIL', reason: err});
        return;
    }

    newEvent.save((err) => {
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

            foundUser.events.push(newEvent._id);
            foundUser.save();

            //console.warn(`createNewEvent successful`);
            res.json({result: 'OK'});

            // let's share this event with friends if any
            let userNameList = await userDbHandler.forwardEvents(newEvent, foundUser, req.body.userList);
            //console.warn(`length of userNameList =${JSON.stringify(userNameList)}`);
            chatServer.sendDashboardControlMessage(chatServer.DASHBOARD_AUTO_REFRESH_EVENT, userNameList, foundUser.username);
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
            res.redirect('/');
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

      router.delete('/:list_id', (req, res) => {
        Event.findById(req.params.list_id, (err, foundListing) => {
            if (err) {
                console.log('Listing not found');
                res.json({result: 'FAIL', reason: 'Event not found with given ID'});
                return;
            }
    
            // clean up chatting related resources
            // 1. go through all the child listing and remove chatting channels.
            listingDbHandler.cleanAllChildListingsFromParent(foundListing);
    
            // 3. remove channels in the parent level
            const channel_id_prefix = `${req.params.list_id}-`;
            chatDbHandler.removeChannelsByPartialChannelId(channel_id_prefix);
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
                    // console.warn(`deleteOwnListing`);
                    userDbHandler.deleteOwnListing(foundUser, foundListing);
                } else {
                    // console.warn(`deleteListingFromFriends`);
                    userDbHandler.deleteListingFromFriends(foundUser, foundListing);
                }
                foundUser.save();
                chatServer.sendDashboardControlMessageToSingleUser(chatServer.DASHBOARD_AUTO_REFRESH_EVENT, foundUser.username);
                });
                // chatServer.removeChannelFromUserDb(foundListing.shared_user_group[userIndex].username, channel_id_prefix);
            });
        
            foundListing.remove();

            res.json({result: 'OK'});
        });
      });

    return router;
};