var User          = require("../../models/user");
var async         = require("async");

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


module.exports = {getUserByName: getUserByName_, 
                  findUserById: findUserById_,
                  deleteListingFromUserDB: deleteListingFromUserDB}