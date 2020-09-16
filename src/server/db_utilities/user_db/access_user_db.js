var User          = require("../../models/user");
var TenantRequest   = require("../../models/listing/tenant_request");
var LandlordRequest = require("../../models/listing/landlord_request");
var async         = require("async");


const listingDbHandler = require('../listing_db/access_listing_db');

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

function deleteOwnListing(user, listing)
{
  let tempListings = [];

  switch(listing.listingType)
  {
    case "landlord": 
      tempListings = user.landlord_listing.filter(listing_ => listing_.equals(listing._id)==false);
      user.landlord_listing = tempListings;
      break;
    case "tenant":
      tempListings = user.tenant_listing.filter(listing_ => listing_.equals(listing._id)==false);
      user.tenant_listing = tempListings;
      break;
    case "_3rdparty":
      tempListings = user._3rdparty_listing.filter(listing_ => listing_.equals(listing._id)==false);
      user._3rdparty_listing = tempListings;
      break;
    default: console.warn("Unknown listing type  = " + listing.listingType); return;
  }
}

function deleteListingFromFriends(user, listing)
{
  let tempListings = [];

  switch(listing.listingType)
  {
    case "landlord": 
      tempListings = user.incoming_landlord_listing.filter(listing_ => listing_.id.equals(listing._id)==false);
      user.incoming_landlord_listing = tempListings;
      break;
    case "tenant":
      tempListings = user.incoming_tenant_listing.filter(listing_ => listing_.id.equals(listing._id)==false);
      user.incoming_tenant_listing = tempListings;
      break;
    default: console.warn("Unknown listing type  = " + listing.listingType); return;
  }
}

async function deleteListingFromUserDB(listing)
{
  let creator = await findUserById_(listing.requester.id);

  // 1. remove it from creator
  deleteOwnListing(creator, listing);

  // 2. remove it from all users received this listing
  // : currently the listing will be shared among friends only
  //   let's go through friends list for now. 
  //   Later we need to keep track of it.
  for(let index=0; index< creator.direct_friends.length; index++)
  {
    let friend = await findUserById_(creator.direct_friends[index].id);
    if(friend!=null)
    {
      deleteListingFromFriends(friend, listing);
      friend.save();
    }
  }

  creator.save();
}

function getReferringFriendsByListingId(user, listing_id, type)
{
  let incomingListingArray = (type=="tenant")? user.incoming_tenant_listing: user.incoming_landlord_listing;

  for(let index=0; index<incomingListingArray.length; index++)
  {
    if(incomingListingArray[index].id.equals(listing_id)==true)
    {
      return incomingListingArray[index].list_of_referring_friends;
    }
  }

  return [];
}


async function getRequesterId(listing_id, type)
{
  return new Promise((resolve) => {

    switch(type)
    {
      case "landlord":
        LandlordRequest.findById(listing_id, (err, listing) => {
          if(err)
          {
            console.warn("listing not found with err = " + err);
            resolve(null);
          }
          
          resolve(listing.requester.id);

        } );
        break;

      case "tenant":
        TenantRequest.findById(listing_id, (err, listing) => {
          if(err)
          {
            console.warn("listing not found with err = " + err);
            resolve(null);
          }

          resolve(listing.requester.id);
        } );
        break;

      default:
        console.log("Why default"); 
        resolve(null);
        break;
    }
  });
}

function handleListingForward(req, res, type)
{

  function checkDuplicate(list, id)
  {
    let bDuplicate = false;

    if(list.length>=1)
    {
      bDuplicate = list.some(
        _list => _list.id.equals(id) 
        );
    }

    return bDuplicate;
  }

  User.findById(req.user._id, async function(err, foundUser){

    if(err)
    {
      res.json({result : 'User not found'});
      console.log("User not found");
      return;
    }

    var listing_info = { id: req.params.list_id, 
                         list_of_referring_friends: [],
                         received_date: Date.now()};

    if(type=="landlord")
    {
      listing_info.cover_picture = await listingDbHandler.getCoverPicture(req.params.list_id);
    }

    let forwardCount = 0;

    getRequesterId(req.params.list_id, type).then(requester_id => 
    {
      foundUser.direct_friends.forEach(function(friend){

        // Need to find the friend object and then update it.
        const result = User.findById(friend.id, function(err, foundFriend){
          if(err)
          {
            console.log("No friend found with given ID");
            return 0;
          }

          // let's check duplicate records
          if(checkDuplicate((type=="tenant")? 
             foundFriend.incoming_tenant_listing:foundFriend.incoming_landlord_listing , listing_info.id)==true ||
             foundFriend._id.equals(requester_id))
          {
            return 1;
          }

          // build list_of_referring_friends
          // 1. check if the user owns the listing or just forwarding it from others
          if(requester_id.equals(req.user._id)==true)
          {
            let referringFriends = [];

            let creator =   {profile_picture: foundUser.profile_picture,
                       friend_id: req.user._id,
                       friend_name: foundUser.username};
            let forwardee = {profile_picture: foundFriend.profile_picture,
                       friend_id: foundFriend._id,
                       friend_name: foundFriend.username};
            
            referringFriends.push(creator);
            referringFriends.push(forwardee);

            listing_info.list_of_referring_friends = referringFriends;

          }
          else
          {
            // copy list_of_referring_friends and then add forwardee
            // get list_of_referring_friends by listing ID
            let referringFriends = getReferringFriendsByListingId(foundUser, req.params.list_id, type);
            let forwardee = {profile_picture: foundFriend.profile_picture,
                       friend_id: foundFriend._id,
                       friend_name: foundFriend.username};
            
            referringFriends.push(forwardee); // just append itself to the list.

            listing_info.list_of_referring_friends = referringFriends;
            
          }

          if(type=="tenant")
          {
            foundFriend.incoming_tenant_listing.push(listing_info);
          }
          else
          {
            foundFriend.incoming_landlord_listing.push(listing_info);
          }

          foundFriend.save();
          return 2;
        });

        if(result==2) forwardCount++; 
      });
    });

    if(forwardCount>=0)
    {
      res.json({result : 'Listing Forwarded Successfully'});
    }
    else
    {
      res.json({result : 'No listing forwarded'});
    };
  });
}

module.exports = {getUserByName: getUserByName_, 
                  findUserById: findUserById_,
                  deleteListingFromUserDB: deleteListingFromUserDB,
                  getReferringFriendsByListingId: getReferringFriendsByListingId,
                  handleListingForward, handleListingForward}