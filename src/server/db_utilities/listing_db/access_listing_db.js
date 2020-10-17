var User            = require("../../models/user");
var TenantRequest   = require("../../models/listing/tenant_request");
var LandlordRequest = require("../../models/listing/landlord_request");
var async           = require("async");
const chatDbHandler = require('../chatting_db/access_chat_db');
const userDbHandler = require('../user_db/access_user_db');
var chatServer      = require('../../chatting_server');


function checkDuplicate(user_list, name)
{
  let bDuplicate = false;

  if(user_list.length>=1)
  {
    bDuplicate = user_list.some(
      _user => _user.username===name 
      );
  }

  return bDuplicate;
}

// <note> only for tenant listing for now
async function addToSharedUserGroup(listing, friend_name, type, child_index, bSave)
{

  return new Promise(resolve => {
    userDbHandler.getUserByName(friend_name).then(async (_friend)=> {
      if(_friend==null)
      {
        console.warn("Friend not found");
        resolve(0);
      }

      // 1. check duplicate.
      switch(type)
      {
        // parent
        case 1: 
          // find the ID of the friend
          if(checkDuplicate(listing.shared_user_group, _friend.username)==true)
          {
            console.log("Friend already in the group");
            resolve(0);
          }
          else
          {
            foundListing.shared_user_group.push(
              {id: _friend._id, username: _friend.username,
               profile_picture: _friend.profile_picture});
          }
          break;

        // child
        case 2:
          if(checkDuplicate(listing.child_listings[child_index].shared_user_group, _friend.username)==true)
          {
            console.log("Duplicate found");
            resolve(0);
          }
          else
          {
            listing.child_listings[child_index].shared_user_group.push(
              {id: _friend._id, username: _friend.username,
               profile_picture: _friend.profile_picture});
          }
          break;

        default:
          console.warn("Unknown chattingType");
          resolve(0);
      }

      if(bSave==true)
      {

        listing.save((err) => {
          if(err)
          {
            console.warn("DB save failure");
            resolve(0);
          }

          console.log("ISEO: user added successfully");
          resolve(1);
        });
      }
      else
      {
        resolve(1);
      }
    });
  });


}

function cleanChildListingFromParent(foundListing, child_listing_id, channel_id_prefix) 
{
  // use filter to create a new array
    let tempArray = [];
    foundListing.child_listings.forEach(listing => 
      {
        if(listing.listing_id.equals(child_listing_id))
        {
          // let's remove chatting channels as well
          // remove chatting channels
          // 1. go through check shared_group and remove dm channels from there
          listing.shared_user_group.map((user) => {
            chatServer.removeChannelFromUserDb(user.username, channel_id_prefix);
                  // remove chatting channels from chatting channel DB as well
          });

          chatDbHandler.removeChannelsByPartialChannelId(channel_id_prefix);
        }
        else
        {
          //console.log(" preserve this item");
          tempArray.push(listing);
        }
      })

    //console.log("size of tempArray = " + tempArray.length);
    foundListing.child_listings = [...tempArray];

    foundListing.save((err) => {

      if(err) {
        console.warn("foundListing saving error = " + err);
        return('child listing removal failed');
      }

      return ('Child listing removed successfully');
    });
}


function cleanAllChildListingsFromParent(parent, bRequiredSave = false) 
{
    parent.child_listings.forEach(listing => 
      {
           let channel_id_prefix = parent._id+"-child-"+listing.listing_id;

          // let's remove chatting channels as well
          // remove chatting channels
          // 1. go through check shared_group and remove dm channels from there
          listing.shared_user_group.map((user) => {
            chatServer.removeChannelFromUserDb(user.username, channel_id_prefix);
                  // remove chatting channels from chatting channel DB as well
          });

          chatDbHandler.removeChannelsByPartialChannelId(channel_id_prefix);
      })

    if(bRequiredSave==true)
    {
      // clean the child_listings.
      parent.child_listings = [];

      parent.save((err) => {
        if(err) {
          console.warn("foundListing saving error = " + err);
        }
      });
    }
}

async function deleteChildListingFromAllParents(listing_id)
{
  const allListings = await tenantListing.find();

  console.log("allListings.length="+allListings.length);

  for(let index = 0; index<allListings.length; index++)
  {
    if(allListings[index].child_listings.length>0)
    {
      cleanChildListingFromParent(allListings[index], listing_id, allListings[index]._id+"-child-"+listing_id);
    }
  }
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


async function getCoverPicture(list_id)
{
  return new Promise(resolve => {
    LandlordRequest.findById(list_id, function(err, foundList){
      resolve(foundList.pictures[0].path);
    });

  });
}

module.exports = { cleanChildListingFromParent:      cleanChildListingFromParent,
                   cleanAllChildListingsFromParent:  cleanAllChildListingsFromParent,
                   deleteChildListingFromAllParents: deleteChildListingFromAllParents,
                   getRequesterId:                   getRequesterId,
                   getCoverPicture:                  getCoverPicture,
                   addToSharedUserGroup:             addToSharedUserGroup}