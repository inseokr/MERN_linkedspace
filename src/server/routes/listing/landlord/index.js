var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../../models/user");
var LandlordRequest = require("../../../models/listing/landlord_request");
var node = require("deasync");
var path = require("path");

node.loop = node.runLoopOnce;


router.post("/new", function(req, res){
	if(req.body.submit=="exit"){
		res.render("listing_main");
	}else{
		var newListing = new LandlordRequest;

		//add username and id
        newListing.requester.id = req.user._id;
        newListing.requester.username = req.user.username;
        newListing.rental_property_information = req.body.rental_property_information;
        newListing.rental_property_information.location = req.body.location;

        newListing.move_in_date = req.body.move_in_date;
        newListing.rental_duration = req.body.rental_duration;
        newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
        newListing.rental_budget = req.body.rental_budget;
        newListing.num_of_bedrooms = 0;

        newListing.save(function(err){

        if(err){
        	console.log("New Listing Save Failure");
        	res.render("/");
        }

        User.findById(req.user._id, function(err, foundUser){

        	if(err){
        		console.log("User Not found with given User");
        		return;
        	}


        	foundUser.landlord_listing.id = newListing._id;
        	foundUser.save();
        });

		res.render("listing/landlord/new_step2", {listing_info: { listing: newListing, listing_id: newListing._id}});

		});
	}
});

router.post("/:listing_id/new", function(req, res){

	LandlordRequest.findById(req.params.listing_id, function(err, foundListing){

		foundListing.rental_property_information = req.body.rental_property_information;
		foundListing.rental_property_information.location = req.body.location;

    	foundListing.save(function(err){

    		if(err){
		    	console.log("New Listing Save Failure");
    			res.render("/");
    		}

			res.render("listing/landlord/new_step2", {listing_info: { listing: foundListing, listing_id: req.params.listing_id}});
    	});

	});
});

// the route name may need to be revised.
router.put("/:list_id", function(req, res){
	
	if(req.body.submit=="exit"){
		res.render("/");
	}else{
		LandlordRequest.findById(req.params.list_id, function(err, foundListing){
			if(err){
				req.flash("error", "No such listing found");
				res.redirect("/");
			}else{
				switch(req.body.submit){
					case "step#2":
						handleStep2(req,res,foundListing);
						res.render("listing/landlord/new_step3", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
						break;
					case "step#3":
						handleStep3(req,res,foundListing);
						res.render("listing/landlord/new_step4", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
						break;
					case "step#4":
						handleStep4(req,res,foundListing);
						res.render("listing/landlord/new_step5", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
						break;
					case "step#5":
						handleStep5(req,res,foundListing);
						res.render("listing/landlord/new_step6", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
						break;
					case "step#6":
						handleStep6(req,res,foundListing);
						// need to add user ID of roommates if exists.
						req.flash("success", "Listing posted successfully");

      					var facilities = [];
      					var amenities = [];

      					preprocessListing(foundListing, facilities, amenities);
						res.render("listing/landlord/show", 
							{listing_info: { listing: foundListing, accessibleSpaces: facilities, availableAmenities: amenities}});
						break;
					default: 
						req.flash("error", "No such step found");
						res.redirect("/");
						break;
				}
			}
		});
	}
});

router.get("/:list_id/step1", function(req,res){ // Code for the previous button in step 2
	LandlordRequest.findById(req.params.list_id, function(err, foundListing){
		if(err){
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/landlord/new", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/step2", function(req,res){ // Code for the previous button in step 3
	LandlordRequest.findById(req.params.list_id, function(err, foundListing){
		if(err){
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/landlord/new_step2", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/step3", function(req,res){  // Code for the previous button in step 4
	LandlordRequest.findById(req.params.list_id, function(err, foundListing){
		if(err){
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/landlord/new_step3", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/step4", function(req,res){  // Code for the previous button in step 5
	LandlordRequest.findById(req.params.list_id, function(err, foundListing){
		if(err){
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/landlord/new_step4", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/step5", function(req,res){  // Code for the previous button in step 6
	LandlordRequest.findById(req.params.list_id, function(err, foundListing){
		if(err){
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/landlord/new_step5", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

router.get("/:list_id/step6", function(req,res){  // Code for the step 6 stepwizard
	LandlordRequest.findById(req.params.list_id, function(err, foundListing){
		if(err){
    		console.log("Listing not found");
    		return;
    	}
        res.render("listing/landlord/new_step6", {listing_info: { listing: foundListing, listing_id: req.params.list_id}});
	});
});

function handleStep1(req, res, foundListing){
	foundListing.requester.id = req.user._id;
	foundListing.requester.username = req.user.username;
    foundListing.rental_property_information = req.body.rental_property_information;
    foundListing.rental_property_information.location = req.body.location;
    foundListing.move_in_date = req.body.move_in_date;
    foundListing.rental_duration = req.body.rental_duration;
    foundListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
    foundListing.rental_budget = req.body.rental_budget;
    foundListing.save();
}

function handleStep2(req, res, foundListing){
	// this should be a number instead?
	foundListing.bedrooms = []; // Clear bedroom array to update with new bed forms.
	foundListing.num_of_bedrooms = req.body.num_of_bedrooms;
	for(var bedIndex=0; bedIndex<=foundListing.num_of_bedrooms; bedIndex++){
		var curBedRoom = eval(`req.body.bedroom_${bedIndex}`);
		console.log(curBedRoom);
		if(curBedRoom.bedding_provided==="on"){
			curBedRoom.bedding_provided = true;
		}else{
			curBedRoom.bedding_provided = false;
		}
		foundListing.bedrooms.push(curBedRoom);
		foundListing.num_of_total_guests = foundListing.num_of_total_guests + Number(curBedRoom.num_of_guests_bedroom);
		var numOfBathRooms = parseFloat(curBedRoom.num_of_bathrooms);
		foundListing.num_of_total_baths = foundListing.num_of_total_baths + numOfBathRooms;
	}
	foundListing.save();
}

function handleStep3(req, res, foundListing){
	for(var key in req.body.amenities){
		req.body.amenities[key] = true; // Anything in req.body.amenities should be set to true.
	}
	foundListing.amenities = req.body.amenities;
	foundListing.save();
}

function handleStep4(req, res, foundListing){
	for(var key in req.body.accessible_spaces){
		req.body.accessible_spaces[key] = true; // Anything in req.body.amenities should be set to true.
	}
	foundListing.accessible_spaces = req.body.accessible_spaces;
	foundListing.save();
}

function handleStep5(req, res, foundListing){
	// handle caption data?
	// 1. need to know the totall numbers uploaded.
	// <note> There could be empty picture entry....
	var processedPictures = 0;

	for(var picIndex=0; processedPictures<foundListing.num_of_pictures_uploaded;picIndex++){
		if(foundListing.pictures[picIndex].path!=""){
			foundListing.pictures[picIndex].caption = eval(`req.body.caption_${picIndex+1}`);
			processedPictures++;
		}	
	}
	foundListing.save();
}


function handleStep6(req, res, foundListing){
	foundListing.summary_of_listing = req.body.summary_of_listing.trim();
	foundListing.summary_of_neighborhood = req.body.summary_of_neighborhood.trim();
	foundListing.summary_of_transportation = req.body.summary_of_transportation.trim();
	foundListing.rental_terms = req.body.rental_terms;
	foundListing.move_in_date = req.body.move_in_date;
	foundListing.contact = req.body.contact;
	foundListing.save();
}

function preprocessListing(listing, accessibleSpaces, amenities){
	if(listing.accessible_spaces.living_room!='off'){
		accessibleSpaces.push("living room");
	}

	if(listing.accessible_spaces.pool!='off'){
		accessibleSpaces.push("pool");
	}

	if(listing.accessible_spaces.gym!='off'){
		accessibleSpaces.push("gym");
	}

	if(listing.accessible_spaces.laundry!='off'){
		accessibleSpaces.push("laundry");
	}

	if(listing.accessible_spaces.kitchen!='off'){
		accessibleSpaces.push("kitchen");
	}

	if(listing.accessible_spaces.parking!='off'){
		accessibleSpaces.push("parking");
	}

	// amenities
	if(listing.amenities.internet!='off'){
		amenities.push("Internet");
	}

	if(listing.amenities.closet!='off'){
		amenities.push("Closet");
	}

	if(listing.amenities.tv!='off'){
		amenities.push("TV entertainment system");
	}

	if(listing.amenities.ac!='off'){
		amenities.push("Air Conditioner");
	}

	if(listing.amenities.desk!='off'){
		amenities.push("Desk");
	}

	if(listing.amenities.smoke_detector!='off'){
		amenities.push("Smoke detector");
	}

	if(listing.amenities.private_entrance!='off'){
		amenities.push("Private entrance");
	}

	if(listing.amenities.fire_extinguisher!='off'){
		amenities.push("Fire extinguisher");
	}
}

// ISEO: this is just for testing

router.get("/show", function(req, res){
	res.render("listing/landlord/show_v1");
});

router.get("/marker_trial", function(req, res){
	res.render("listing/landlord/marker_trial")
});

router.get("/marker_trial_v1", function(req, res){
	res.render("listing/landlord/marker_trial_v1")
});

router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/landlord/${fileName}`));
});


router.get("/new_step3", function(req,res){
	res.render("listing/landlord/new_step3");
});

router.get("/new_step4", function(req,res){
	res.render("listing/landlord/new_step4");
});

router.get("/new_step5", function(req,res){
	res.render("listing/landlord/new_step5");
});

router.get("/new_step6", function(req,res){
	res.render("listing/landlord/new_step6");
});


router.get("/edit", function(req,res){
	res.render("listing/landlord/new_step5");
});

router.get("/temp", function(req,res){
	res.render("listing/landlord/new_step6");
});

module.exports = router;