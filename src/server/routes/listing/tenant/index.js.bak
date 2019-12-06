var express       = require("express");
var router        = express.Router();
var passport      = require("passport");
var User 	      = require("../../../models/user");
var TenantRequest = require("../../../models/listing/tenant_request");
var node          = require("deasync");
var path          = require("path");
var fs            = require("fs");

node.loop = node.runLoopOnce;

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
        newListing.location = req.body.location;
        newListing.move_in_date = req.body.move_in_date;
        newListing.rental_duration = req.body.rental_duration;
        newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
        newListing.rental_budget = req.body.rental_budget;

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

        	foundUser.tenant_listing.id = newListing._id;
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

        TenantRequest.findById(foundUser.tenant_listing.id, function(err, foundListing){
        	if(err || foundListing == null)
        	{
        		req.flash("error", "No Active Listing Found");
        		res.redirect("/");
        		return;
        	}

			// need to change to support array of list instead
			res.render("listing/tenant/show_list", {listing_info: { listing: foundListing, list_id: foundUser.tenant_listing.id}});
        });
	});
});


router.get("/:list_id/edit", function(req, res){
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

module.exports = router;