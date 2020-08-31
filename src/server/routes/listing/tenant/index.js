var express       = require("express");
var router        = express.Router();
var passport      = require("passport");
var User 	      = require("../../../models/user");
var TenantRequest = require("../../../models/listing/tenant_request");
var node          = require("deasync");
var path          = require("path");
var fs            = require("fs");

const userDbHandler = require('../../../db_utilities/user_db/access_user_db');
const chatDbHandler = require('../../../db_utilities/chatting_db/access_chat_db');

node.loop = node.runLoopOnce;



module.exports = function(app) {

router.post("/new", function(req, res){
	if(req.body.submit=="exit")
	{
		res.render("listing_main");
	}
	else
	{
		// create a new listing\
		var newListing = new TenantRequest;

		//add username and id
        newListing.requester.id = req.user._id;
        newListing.requester.username = req.user.username;
        newListing.requester.profile_picture = req.user.profile_picture;
        
        newListing.location = req.body.location;
        newListing.move_in_date = req.body.move_in_date;
        newListing.rental_duration = req.body.rental_duration;
        newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
        newListing.rental_budget = req.body.rental_budget;
				newListing.coordinates = {"lat": 0, "lng": 0};

		newListing.shared_user_group.push({id: req.user._id, username:req.user.username, profile_picture: req.user.profile_picture});

        newListing.save(function(err){

        if(err) {
        	console.log("New Listing Save Failure");
        	res.render("/");
        }

        User.findById(req.user._id, function(err, foundUser){

        	if(err)
        	{
        		console.log("User Not found with given User");
        		return;
        	}

        	foundUser.tenant_listing.push(newListing._id);

        	foundUser.save();
        });

		res.render("listing/tenant/new_step2", {listing_info: { listing: newListing, listing_id: newListing._id}});

        });
	}
});


router.post("/:listing_id/new", function(req, res){

	TenantRequest.findById(req.params.listing_id, function(err, foundListing){

	    foundListing.location = req.body.location;
	    foundListing.move_in_date = req.body.move_in_date;
	    foundListing.rental_duration = req.body.rental_duration;
	    foundListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
	    foundListing.rental_budget = req.body.rental_budget;

    	foundListing.save(function(err){

    		if(err) {
		    	console.log("New Listing Save Failure");
    			res.render("/");
    		}

			res.render("listing/tenant/new_step2", {listing_info: { listing: foundListing, listing_id: req.params.listing_id}});
    	});

	});
});

// the route name may need to be revised.
router.put("/:list_id", function(req, res){

	if(req.body.submit=="exit")
	{
		res.render("/");
	}
	else
	{
		TenantRequest.findById(req.params.list_id, function(err, foundListing){
			if(err){
				req.flash("error", "No such listing found");
				res.redirect("/");
			} else {

				if(req.body.submit=="step#2")
				{
					foundListing.rental_preferences = req.body.preferences;

					foundListing.save();

					res.render("listing/tenant/new_step3", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
				} else {
					foundListing.rental_description = req.body.rental_description;

					foundListing.roommate_request = req.body.roommate_request;
					foundListing.group_rental = req.body.group_rental;
					foundListing.num_of_roommates = req.body.num_of_roommates;
					foundListing.roommate_request = req.body.roommate_request;
					foundListing.num_of_requested_roommates = req.body.num_of_requested_roommates;

					if(foundListing.num_of_profile_picture_uploaded!=0)
					{
						foundListing.profile_pictures[0].caption = req.body.caption;
					}

					foundListing.phone = req.body.phone;
					foundListing.email = req.body.email;

					if(req.body.group_rental=="on")
					{
						var listOfRoomMate = [];
						var callBackProcessed = false;
						var userFound = false;

						// add user id to roommate list
						for(var roommate_idx=1; roommate_idx<=req.body.num_of_roommates; roommate_idx++)
						{
							callBackProcessed = false;
							userFound = false;
							// TBD
							var roommate_id = eval(`req.body.roommate_${roommate_idx}`);

							User.find({ "username":  roommate_id}, function (err, tempUser){
								if(err)
								{
									console.log("User not found");
								}
								else
								{
									if(tempUser.length==1)
									{
										// ISEO: it will be successfull even if there is no record found with given condition!!
										listOfRoomMate[roommate_idx] = {id:tempUser[0]._id, username: roommate_id};
										//console.log("roomMate=" + roomMate);
										console.log("listOfRoomMate[roommate_idx]" + listOfRoomMate[roommate_idx]);
										userFound = true;


										//foundListing.roommates.push(roomMate);
										// you should save here... otherwise all the data will be gone, Dude!!
										//foundListing.save();
									}
									else
									{
										req.flash("error", "no such error found");
									}
								}

								callBackProcessed=true;
							});

							while(callBackProcessed==false) node.loop();// This will give no chance to child process at all

							if(userFound==true) foundListing.roommates.push(listOfRoomMate[roommate_idx]);
						}

						foundListing.save();

					}
					else
					{
						foundListing.save();
					}
					// need to add user ID of roommates if exists.
					req.flash("success", "Listing posted successfully");
					let preferences = [];

					preprocessingListing(foundListing, preferences);

					res.render("listing/tenant/show", {listing_info: { listing: foundListing, rentalPreferences: preferences, list_id: 0}});
				}
			}

		});

	}
});

router.get("/tenant_dashboard", function(req,res){
	res.render("listing/tenant/tenant_dashboard");
});

router.get("/:list_id/step1", function(req,res){
	TenantRequest.findById(req.params.list_id, function(err, foundListing){
		if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/tenant/new", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});


router.get("/:list_id/step2", function(req,res){
	TenantRequest.findById(req.params.list_id, function(err, foundListing){
		if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/tenant/new_step2", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/step3", function(req,res){
	TenantRequest.findById(req.params.list_id, function(err, foundListing){
		if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/tenant/new_step3", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/show", function(req, res){

	// Get tenant listing.
    TenantRequest.findById(req.params.list_id, function(err, foundListing){
    	if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}

    	let preferences = [];

		preprocessingListing(foundListing, preferences);

		res.render("listing/tenant/show", {listing_info: { listing: foundListing, rentalPreferences: preferences, list_id: req.params.list_id}});

	});
});

router.get("/show", function(req, res){

	// Get tenant listing.
	User.findById(req.user._id, function(err, foundUser){
        if(err)
        {
        	console.log("User Not found with given User");
        	return;
        }

        TenantRequest.findById(foundUser.tenant_listing[0].id, function(err, foundListing){
        	if(err || foundListing == null)
        	{
        		req.flash("error", "No Active Listing Found");
        		res.redirect("/");
        		return;
        	}

			// need to change to support array of list instead
			res.render("listing/tenant/show_list", {listing_info: { listing: foundListing, list_id: foundUser.tenant_listing[0].id}});
        });
	});
});


router.get("/:list_id/fetch", function(req, res){

	console.log("REACT: fetch tenant listing request with listing id= " + JSON.stringify(req.params.list_id));

	TenantRequest.findById(req.params.list_id).populate('child_listings._3rd_party_listings.listing_id').exec(function(err, foundListing){
		if(err)
		{
			console.log("Listing not found");
			return;
		}

		//console.log("foundListing = " + JSON.stringify(foundListing));

		// send child listings as well
		res.json(foundListing);
	});

});


router.post("/:list_id/edit", function(req, res){
	// Get tenant listing.
    TenantRequest.findById(req.params.list_id, function(err, foundListing){
    	if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}
		res.render("listing/tenant/new", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});




router.post("/:list_id/addUserGroup", function(req, res){

	TenantRequest.findById(req.params.list_id, function(err, foundListing){

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


    	if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}
    	let chattingType = req.body.chattingType;
    	let childInfo    = req.body.childInfo;
    	let friend       = req.body.friend;

    	console.log("friend = " + JSON.stringify(friend));

    	userDbHandler.getUserByName(friend.username).then((_friend)=> {
    		if(_friend==null)
    		{
    			console.log("Friend not found");
    			res.json({result: "Friend not found"})
    			return;
    		}
	    	// 1. check duplicate.
	    	switch(chattingType)
	    	{
	    		case 1: 
	    			// find the ID of the friend
	    			if(checkDuplicate(foundListing.shared_user_group, _friend.username)==true)
	    			{
	    				console.log("Duplicate found");
	    				res.json({result: "Duplicate found"});
	    				return;
	    			}
	    			foundListing.shared_user_group.push({id: _friend._id, 
	    				                                 username: _friend.username,
	    				                             	 profile_picture: _friend.profile_picture});
	    			break;
	    		case 2:
	    			if(childInfo.type==0)
	    			{
		    			if(checkDuplicate(foundListing.child_listings._3rd_party_listings[childInfo.index].shared_user_group, _friend.username)==true)
		    			{
		    				console.log("Duplicate found");
		    				res.json({result: "Duplicate found"});
		    				return;
		    			}

	    				foundListing.child_listings._3rd_party_listings[childInfo.index].shared_user_group.push({id: _friend._id, 
	    					                                                                                     username: _friend.username,
	    					                                                                                     profile_picture: _friend.profile_picture});
	    			}
	    			else
	    			{
		    			if(checkDuplicate(foundListing.child_listings.internal_listings[childInfo.index].shared_user_group, _friend.username)==true)
		    			{
		    				console.log("Duplicate found");
		    				res.json({result: "Duplicate found"});
		    				return;
		    			}

	    				foundListing.child_listings.internal_listings[childInfo.index].shared_user_group.push({id: _friend._id, 
	    					                                                                                   username: _friend.username,
	    					                                                                                   profile_picture: _friend.profile_picture});
	    			}
	    			break;
	    		default:
	    			console.log("Unknown chattingType");
	    			res.json({result: "Unknown chattingType"}); 
	    			return;
	    	}

	    	foundListing.save((err) => {
	    		if(err)
	    		{
	    			res.json({result: "DB save failure"});
	    			return;
	    		}
	    		console.log("ISEO: user added successfully");
		    	res.json({result: "Added successfully"});
	    	});
	    });
	});
});


router.delete("/:list_id", function(req, res){
	// Clean all resources such as pictures.

	// Get tenant listing.
    TenantRequest.findById(req.params.list_id, function(err, foundListing){
    	if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}

    	try {
    		fs.unlinkSync(foundListing.profile_pictures[0].path);
	    } catch(err){
	    	console.error(err);
	    }

		foundListing.remove();

    	req.flash("success", "Listing Deleted Successfully");
		res.redirect("/");
	});
});


router.get("/:list_id/show/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/tenant/${fileName}`));
});


// It's a bit strange but browser sends tenant/:list_id/:filename as the URL with the following image request
// <img src="Peter.jpg">
router.get("/:list_id/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});


router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

router.post("/addChild", function(req, res){

	console.log("addChild post event. listing_id = " + req.body.parent_listing_id);

	TenantRequest.findById(req.body.parent_listing_id).populate('requester.id').exec(function(err, foundListing){
		if(err)
		{
			console.log("listing not found");
			res.send('listing_not_found');
			return;
		}

		if(req.body.listing_type=="_3rdparty")
		{
			console.log("listing  found");

			let _3rdparty_listing = { listing_id: null, 
									  created_by: {id: null, username: ""}, shared_user_group: []};

			console.log("child_listing_id = " + req.body.child_listing_id);

			_3rdparty_listing.listing_id = req.body.child_listing_id;

			// let's check if it's a duplicate request.
			let foundDuplicate = false;

			console.log("foundListing = " + JSON.stringify(foundListing));

			if(foundListing.child_listings.length>=1)
			{
				foundListing.child_listings.forEach(
					listing => {
						if(listing.id.equals(req.body.child_listing_id)) 
						{
							foundDuplicate = true;
						}
					}); 

				if(foundDuplicate==true)
				{
					console.log("Duplicate request");
					res.send("Duplicate request");
					return;
				}
			}

			// default user group
			// 1. check if the parent listing is created by me
			console.log("req.user._id="+req.user._id);
			console.log("foundListing.requester.id="+foundListing.requester.id);

			if(foundListing.requester.id.equals(req.user._id))
			{
				console.log("Updating user group, created by the current user");
				let _user = {id: foundListing.requester.id, username: foundListing.requester.username, profile_picture: foundListing.requester.id.profile_picture};
				_3rdparty_listing.shared_user_group.push(_user);
				
				_3rdparty_listing.created_by.id = req.user._id;
				_3rdparty_listing.created_by.username = foundListing.requester.username;

				foundListing.child_listings._3rd_party_listings.push(_3rdparty_listing);
			}
			// tenant & creator of child listing
			else
			{
				console.log("Updating user group, created by friend");

				// <note> the 3rd party listing could be added by either tenant or friends.
				// It's a friend case.
				let _creatorOfParent = {id: foundListing.requester.id, username: foundListing.requester.username, profile_picture: foundListing.requester.id.profile_picture};
				let _creatorOfChild  = {id: req.user._id, username: req.body.username, profile_picture: req.user.profile_picture};

				_3rdparty_listing.created_by.id = foundListing.requester.id;
				_3rdparty_listing.created_by.username = foundListing.requester.username;

				_3rdparty_listing.shared_user_group.push(_creatorOfParent);
				_3rdparty_listing.shared_user_group.push(_creatorOfChild);
				foundListing.child_listings._3rd_party_listings.push(_3rdparty_listing);
			}

			foundListing.save();
		}
		else
		{
			// landlord listing
		}

		res.send("Successfully added");

	});
});


router.post("/removeChild", function(req, res){

	TenantRequest.findById(req.body.parent_listing_id, function(err, foundListing){
		if(err)
		{
			console.log("listing not found");
			res.send('listing_not_found');
			return;
		}

		if(req.body.listing_type=="_3rdparty")
		{
			console.log("remove 3rd party listing");

			if(foundListing.child_listings.length==0)
			{
				console.log("no child listing found");
				res.send('no child lising found')
				return;
			}


			// use filter to create a new array
			let tempArray = [];
			foundListing.child_listings._3rd_party_listings.forEach(listing => 
				{
					console.log("req.body.child_listing_id = " + req.body.child_listing_id);
					console.log("ID to compare against = " + listing.listing_id);
					if(listing.listing_id.equals(req.body.child_listing_id))
					{
						// let's remove chatting channels as well
						// remove chatting channels
						// 1. go through check shared_group and remove dm channels from there
						listing.shared_user_group.map((user) => {
							userDbHandler.removeDmChannel(user.username, req.body.channel_id_prefix);
						});
					}
					else
					{
						console.log(" preserve this item");
						tempArray.push(listing);
					}
				})

			console.log("size of tempArray = " + tempArray.length);
			foundListing.child_listings._3rd_party_listings = [...tempArray];

			foundListing.save();

			// remove chatting channels from chatting channel DB as well
			chatDbHandler.removeChannelsByPartialChannelId(req.body.channel_id_prefix);
		}

		res.send('Child listing removed successfully');
	});

});


function preprocessingListing(listing, preferences)
{

	if(listing.rental_preferences.furnished!='off')
	{
		preferences.push("Furnished");
	}

	if(listing.rental_preferences.kitchen!='off')
	{
		preferences.push("Kitchen");
	}

	if(listing.rental_preferences.parking!='off')
	{
		preferences.push("Parking");
	}

	if(listing.rental_preferences.internet!='off')
	{
		preferences.push("Internet");
	}

	if(listing.rental_preferences.private_bathroom!='off')
	{
		preferences.push("Private Bathroom");
	}

	if(listing.rental_preferences.separate_access!='off')
	{
		preferences.push("Separate Entrance");
	}

	if(listing.rental_preferences.smoking_allowed!='off')
	{
		preferences.push("Smoke Friendly");
	}

	if(listing.rental_preferences.pet_allowed!='off')
	{
		preferences.push("Pet Allowed");
	}

	if(listing.rental_preferences.easy_access_public_transport!='off')
	{
		preferences.push("Easy Access to Public Transport");
	}
}

// forward listing to direct friends
router.post("/:list_id/forward", function(req, res){

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

	console.log("forward: post");
	User.findById(req.user._id, function(err, foundUser){

		if(err)
		{
			console.log("User not found");
			return;
		}

		var listing_info = { id: req.params.list_id, 
			                 friend_id: req.user._id, 
			                 received_date: Date.now()};
		let forwardCount = 0;

		foundUser.direct_friends.forEach(function(friend){

			// Need to find the friend object and then update it.
			const result = User.findById(friend.id, function(err, foundFriend){
				if(err)
				{
					console.log("No friend found with given ID");
					return 0;
				}

				// let's check duplicate records
				if(checkDuplicate(foundFriend.incoming_tenant_listing, listing_info.id)==true)
				{
					return 1;
				}
				foundFriend.incoming_tenant_listing.push(listing_info);
				foundFriend.save();
				return 2;
			});

			if(result==2) forwardCount++; 
		});
		console.log("forwardCount="+forwardCount);
		res.json({result : 'Listing forwarded successfully'});
	});

});

return router;

}

