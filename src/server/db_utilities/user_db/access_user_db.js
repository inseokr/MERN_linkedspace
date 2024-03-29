const async = require('async');
const User = require('../../models/user');
const TenantRequest = require('../../models/listing/tenant_request');
const LandlordRequest = require('../../models/listing/landlord_request');
const Event = require('../../models/listing/event');
const { sendNotificationEmail } = require('../../utilities/notifications');
// ISEO-TBD: WOW it's really interesting problem.
// <note> functions defined in this module may not work well, not a function error, if chatting_server is included.
// This is crazy problem...
// OMG... cross referencing situations....
// const chatServer = require('../../chatting_server');

// create DM channel
async function getUserByName_(name) {
  // console.log("getUserByName_: name = " + name);

  return new Promise((resolve) => {
    User.findOne({ username: name }, (err, foundUser) => {
      if (err || foundUser == null) {
        console.log('No user found with given user name');
      } else {
        // console.log("User Found");
        resolve(foundUser);
      }
    });
  });
}

async function findUserById_(id) {
  console.log('findUserById_ called');

  return new Promise((resolve) => {
    User.findById(id, (err, foundUser) => {
      if (err || foundUser == null) { 
        console.log('No user found with given user name');
      } else {
        // console.log("User Found");
        resolve(foundUser);
      }
    });
  });
}

function deleteOwnListing(user, listing) {
  let tempListings = [];

  switch (listing.listingType) {
    case 'landlord':
      tempListings = user.landlord_listing.filter(listing_ => listing_.equals(listing._id) == false);
      user.landlord_listing = tempListings;
      break;
    case 'tenant':
      tempListings = user.tenant_listing.filter(listing_ => listing_.equals(listing._id) == false);
      user.tenant_listing = tempListings;
      break;
    case '_3rdparty':
      tempListings = user._3rdparty_listing.filter(listing_ => listing_.equals(listing._id) == false);
      user._3rdparty_listing = tempListings;
      break;
    case 'event':
      tempListings = user.events.filter(listing_ => listing_.equals(listing._id) == false);
      user.events = tempListings;
      break;
    default: console.warn(`Unknown listing type  = ${listing.listingType}`);
  }
}

function deleteListingFromFriends(user, listing) {
  let tempListings = [];

  switch (listing.listingType) {
    case 'landlord':
      tempListings = user.incoming_landlord_listing.filter(listing_ => listing_.id.equals(listing._id) == false);
      user.incoming_landlord_listing = tempListings;
      break;
    case 'tenant':
      tempListings = user.incoming_tenant_listing.filter(listing_ => listing_.id.equals(listing._id) == false);
      user.incoming_tenant_listing = tempListings;
      break;
    case 'event':
      tempListings = user.incoming_events.filter(listing_ => listing_.id.equals(listing._id) == false);
      user.incoming_events = tempListings;
      break;
    default: console.warn(`Unknown listing type  = ${listing.listingType}`);
  }
}

async function deleteListingFromUserDB(listing) {
  const creator = await findUserById_(listing.requester);

  // 1. remove it from creator
  deleteOwnListing(creator, listing);

  // 2. remove it from all users received this listing
  // : currently the listing will be shared among friends only
  //   let's go through friends list for now.
  //   Later we need to keep track of it.
  for (let index = 0; index < creator.direct_friends.length; index++) {
    const friend = await findUserById_(creator.direct_friends[index]);
    if (friend != null) {
      //console.warn(`deleteListingFromUserDB: deleting the listing for user =${friend.username}`);
      deleteListingFromFriends(friend, listing);
      friend.save();
    } else {
      console.warn('deleteListingFromUserDB: the friend can\'t be found');
    }
  }

  //console.warn('deleteListingFromUserDB: creator save');
  creator.save();
}

function getReferringFriendsByListingId(user, listing_id, type) {
  const incomingListingArray = (type == 'tenant') ? user.incoming_tenant_listing : user.incoming_landlord_listing;

  for (let index = 0; index < incomingListingArray.length; index++) {
    if (incomingListingArray[index].id.equals(listing_id) == true) {
      return incomingListingArray[index].list_of_referring_friends;
    }
  }

  return [];
}


async function getRequesterId(listing_id, type) {
  return new Promise((resolve) => {
    switch (type) {
      case 'landlord':
        LandlordRequest.findById(listing_id, (err, listing) => {
          if (err) {
            console.warn(`listing not found with err = ${err}`);
            resolve(null);
          }

          resolve(listing.requester);
        });
        break;

      case 'tenant':
        TenantRequest.findById(listing_id, (err, listing) => {
          if (err) {
            console.warn(`listing not found with err = ${err}`);
            resolve(null);
          }

          resolve(listing.requester);
        });
        break;

      default:
        console.log('Why default');
        resolve(null);
        break;
    }
  });
}

function readListingFromFriends(user, listing_type, listing_id) {
  console.log('readListingFromFriends');

  const listingArray = (listing_type === 'tenant') ? user.incoming_tenant_listing : user.incoming_landlord_listing;

  for (let index = 0; index < listingArray.length; index++) {
    if (listingArray[index].id.equals(listing_id)) {
      console.log('readListingFromFriends: found listing!!');
      listingArray[index].status = 'Read';
      return;
    }
  }
}

async function getListingById(listing_id, type) {
  console.log(`listing_id = ${JSON.stringify(listing_id)}`);

  return new Promise((resolve) => {
    switch (type) {
      case 'landlord':
        LandlordRequest.findById(listing_id, (err, listing) => {
          if (err) {
            console.warn(`listing not found with err = ${err}`);
            resolve(null);
          }

          resolve(listing);
        });
        break;

      case 'tenant':
        TenantRequest.findById(listing_id, (err, listing) => {
          if (err) {
            console.warn(`listing not found with err = ${err}`);
            resolve(null);
          }

          resolve(listing);
        });
        break;

      case 'event':
        Event.findById(listing_id, (err, listing) => {
          if (err) {
            console.warn(`listing not found with err = ${err}`);
            resolve(null);
          }

          resolve(listing);
        });
        break;

      default:
        console.log('Why default');
        resolve(null);
        break;
    }
  });
}


function checkDuplicate(list, id) {
  let bDuplicate = false;

  if (list.length >= 1) {
    bDuplicate = list.some(
      _list => _list.id.equals(id)
    );
  }

  return bDuplicate;
}


function checkUserIdDuplicate(list, id) {
  let bDuplicate = false;

  if (list.length >= 1) {
    bDuplicate = list.some(
      _list => _list.equals(id)
    );
  }
  // console.warn(`checkUserIdDuplicate: ${bDuplicate}`);
  return bDuplicate;
}

async function updateChannelId(userList, oldId, newId) {

  if(userList===undefined || userList.length===0) {
    //console.warn(`updateChannelId: user list is empty?`);
    return;
  } 

  for (let index = 0; index < userList.length; index++) {
    const foundFriend = await getUserByName_(userList[index].username);
    if(foundFriend) {
      for(let chatIndex=0; chatIndex < foundFriend.chatting_channels.dm_channels.length;chatIndex++) {
        if(foundFriend.chatting_channels.dm_channels[chatIndex].name===oldId) {
          foundFriend.chatting_channels.dm_channels[chatIndex].name = newId;
          foundFriend.save();
          break;
        }
      }
    }
  }  
}

async function forwardEvents(event, reqUser, userList) {
  let userNameList = [];

  //console.warn(`forwarding events function`);

  if(userList===undefined || userList.length===0) {
    console.warn(`forwardEvents: user list is empty?`);
    return;
  } 

  let forwardCount = 0;

  //console.warn(`forwarding events function: userList.length=${userList.length}`);

  for (let index = 0; index < userList.length; index++) {
    const friend = userList[index];
    // <note> this line won't wait till the callback unction is completed though
    const foundFriend = await User.findById(friend);
    //console.warn(`foundFriend=${JSON.stringify(foundFriend)}` );
    if (foundFriend) {
      // let's check duplicate records
      if ((checkDuplicate(foundFriend.incoming_events, event._id) === true)
          || foundFriend._id.equals(event.requester)) {
        // <note> Only warning?? why do we still continue it?
        console.warn('Duplicate');
      }
      else {
        foundFriend.incoming_events.push({
          id: event._id,
          received_date: Date.now(),
          status: 'New'
        });

        const notificationBody = `A new event has been shared by ${reqUser.username}.\n\n`
          + 'Please click the following link to get to the listing page.\n\n'
          + `${process.env.REACT_SERVER_URL}/event/${event._id}/get\n`;
        sendNotificationEmail(foundFriend.email, `new event shared by ${reqUser.username}`, notificationBody);

        //console.warn(`forwardEvents: friend name=${foundFriend.username}`);

        foundFriend.save();
        userNameList.push(foundFriend.username);

        if (checkUserIdDuplicate(event.shared_user_group, foundFriend._id) === false) {
          const _wait = await event.shared_user_group.push(foundFriend._id);
        }
        forwardCount++;
      }

    }
  }

  if (forwardCount >= 1) {
    //console.warn('Event Forwarded Successfully');
    event.save();
  } 

  return userNameList;
}

function handleListingForward(req, res, type) {
  
  // <note> need to handle the case where the user's already found.
  User.findById(req.user._id, async (err, foundUser) => {
    if (err) {
      res.json({ result: 'User not found' });
      console.log('User not found');
      return;
    }

    const listing_info = {
      id: req.params.list_id,
      list_of_referring_friends: [],
      received_date: Date.now()
    };

    const { userList } = req.body;

    let forwardCount = 0;
    const numOfProcessedUser = 0;
    let foundListing = null;
    const numOfUserList = userList.length;

    getListingById(req.params.list_id, type).then(async (listing) => {
      if (type == 'landlord') {
        listing_info.cover_picture = listing.pictures[0].path;
      }

      foundListing = listing;

      for (let index = 0; index < userList.length; index++) {
        const friend = userList[index];
        // <note> this line won't wait till the callback function is completed though
        const foundFriend = await User.findById(friend);
        if (foundFriend) {
          let inBox = [];

          switch(type) {
            case 'tenant':   inBox = foundFriend.incoming_tenant_listing; break;
            case 'event':    inBox = foundFriend.incoming_events; break;
            case 'landlord': inBox = foundFriend.incoming_landlord_listing; break;
            default: console.warn(`Unsupported type=${type}`); return;
          }

          // let's check duplicate records
          if (checkDuplicate(inBox, listing_info.id) == true
             || foundFriend._id.equals(listing.requester)) {
            console.warn('Duplicate');
          }

          // build list_of_referring_friends
          // 1. check if the user owns the listing or just forwarding it from others
          if(type!=='event') {
            if (listing.requester.equals(req.user._id) == true) {
              const referringFriends = [];

              const creator = {
                profile_picture: foundUser.profile_picture,
                friend_id: req.user._id,
                username: foundUser.username
              };
              const forwardee = {
                profile_picture: foundFriend.profile_picture,
                friend_id: foundFriend._id,
                username: foundFriend.username
              };

              referringFriends.push(creator);
              referringFriends.push(forwardee);

              listing_info.list_of_referring_friends = referringFriends;
            } else {
              // copy list_of_referring_friends and then add forwardee
              // get list_of_referring_friends by listing ID
              const referringFriends = getReferringFriendsByListingId(foundUser, req.params.list_id, type);
              const forwardee = {
                profile_picture: foundFriend.profile_picture,
                friend_id: foundFriend._id,
                username: foundFriend.username
              };

              referringFriends.push(forwardee); // just append itself to the list.

              listing_info.list_of_referring_friends = referringFriends;
            }
          }

          switch(type) {
            case 'tenant':   inBox = foundFriend.incoming_tenant_listing.push(listing_info); break;
            case 'event':    inBox = foundFriend.incoming_events.push(listing_info); break;
            case 'landlord': inBox = foundFriend.incoming_landlord_listing.push(listing_info); break;
            default: console.warn(`Unsupported type=${type}`); return;
          }

          const notificationBody = `A new tenant listing has been shared by ${req.user.username}.\n\n`
            + 'Please click the following link to get to the listing page.\n\n'
            + `${process.env.REACT_SERVER_URL}/listing/tenant/${req.params.list_id}/get\n`;
          sendNotificationEmail(foundFriend.email, `new listing shared by ${req.user.username}`, notificationBody);

          foundFriend.save();

          if (checkUserIdDuplicate(listing.shared_user_group, foundFriend._id) === false) {
            const _wait = await listing.shared_user_group.push(foundFriend._id);
          }

          forwardCount++;
        }
      }

      if (forwardCount >= 1) {
        res.json({ result: 'Listing Forwarded Successfully' });
        foundListing.save();
      } else {
        res.json({ result: 'No listing forwarded' });
      }
    });
  });
}


// status: ["online", "offline"]
async function updateLoggedInStatus(userName, status) {
  const foundUser = await getUserByName_(userName);

  if (foundUser !== null) {
    if (status === 'offline') {
      foundUser.loggedInTime = null;
    } else if (foundUser.loggedInTime !== null) {
      foundUser.loggedInTime = Date.now();
    }
    foundUser.save();
  }
}


function getListOfChattingChannelsById(user, type, id) {
  // <note> we will cover event type for now
  let chattingChannelIds = [];

  if(type==='event') {
    for(let index=0; index < user.chatting_channels.dm_channels.length; index++ ) {
      if(user.chatting_channels.dm_channels[index].name.includes(id)===true) {
        chattingChannelIds.push(user.chatting_channels.dm_channels[index]);
      }
    }
    return chattingChannelIds;
  }
  else {
    // <note> not supported yet
    return [];
  }
}

module.exports = {
  getUserByName: getUserByName_,
  findUserById: findUserById_,
  deleteListingFromUserDB,
  getReferringFriendsByListingId,
  handleListingForward,
  readListingFromFriends,
  updateLoggedInStatus,
  deleteOwnListing,
  deleteListingFromFriends,
  forwardEvents,
  updateChannelId,
  getListOfChattingChannelsById
};
