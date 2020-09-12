var express            = require("express");
var router             = express.Router();
var passport           = require("passport");
var User 	           = require("../../../models/user");
var node               = require("deasync");
var path               = require("path");
var fs                 = require("fs");
var _3rdPartyListing   = require("../../../models/listing/_3rdparty_listing");
const listingDbHandler = require('../../../db_utilities/listing_db/access_listing_db');


var serverPath         = "./src/server";
var picturePath        = "/public/user_resources/pictures/3rdparty/"

node.loop = node.runLoopOnce;

module.exports = function(app) {

router.post('/file_upload', function(req, res) {

  let sampleFile = req.files.file_name;
  let picPath = serverPath+picturePath+sampleFile.name;

  console.log("file_upload: picPath=" + picPath);
    sampleFile.mv(picPath, function(err) {
      if (err)
        return res.status(500).send(err);
      res.send('File uploaded!');
  });

});


router.post('/file_delete', function(req, res) {

	var filename = path.parse(req.body.file_name).base;

	console.log("file_delete: name = " + filename);

	const picPath = serverPath + picturePath+filename;
	fs.unlinkSync(picPath);
	res.send('File Deleted!');
});


router.post("/new", function(req, res){


	console.log("3rd party listinn = " + JSON.stringify(req.body));

	var filename = path.parse(req.body.file_name).base;


	var newListing = new _3rdPartyListing;

	newListing.requester.id       = req.user._id;
	newListing.requester.username = req.user.firstname + " " + req.user.lastname;
	newListing.requester.profile_picture = req.user.profile_picture;

	newListing.listingSource      = req.body.listingSource;
	newListing.listingUrl         = req.body.sourceUrl;
	newListing.listingSummary     = req.body.rentalSummary;
	newListing.rentalPrice        = req.body.rentalPrice.replace(/\$|,/g,"");


	// set location information
	newListing.location           = req.body.location;


	// let's create a database

	// rename the file with listing_id
	let original_path = serverPath + picturePath + filename;
	let new_path = serverPath + picturePath + newListing.requester.id + "_" +filename;
	fs.rename(original_path, new_path, function(err){
		if(err) throw err;
		console.log('File renamed successfully')
	})

	// ISEO-TBD: The path should start from "/public/..."?
	newListing.coverPhoto.path = picturePath + newListing.requester.id + "_" +filename;

	newListing.save(function(err){
		if(err) {
	    	console.log("New Listing Save Failure");
	    	console.log("error = " + err);
	    	res.redirect("/");
	    }

	    User.findById(req.user._id, function(err, foundUser){
	    	foundUser._3rdparty_listing.push(newListing._id);
	    	foundUser.save();
    	});
	})
	
	res.redirect("/");
});



router.post("/:listing_id/new", function(req, res){

	_3rdPartyListing.findById(req.params.listing_id, function(err, foundListing){

		console.log("Updating 3rdparty posting");

		var filename = path.parse(req.body.file_name).base;
	    
	    foundListing.listingSource  = req.body.listingSource;
	    foundListing.listingUrl	    = req.body.sourceUrl;
	    foundListing.listingSummary = req.body.rentalSummary;
	    foundListing.rentalPrice    = req.body.rentalPrice.replace(/\$|,/g,"");
	    foundListing.location       = req.body.location;


	    let original_path = serverPath + picturePath + filename;
		let new_path = serverPath + picturePath + foundListing.requester.id + "_" +filename;
		fs.rename(original_path, new_path, function(err){
			if(err) throw err;
			console.log('File renamed successfully')
		})


		// ISEO-TBD: The path should start from "/public/..."?
		foundListing.coverPhoto.path = picturePath + foundListing.requester.id + "_" +filename;

    	foundListing.save(function(err){

    		if(err) {
		    	console.log("Listing Save Failure");
    			res.redirect("/");
    		}

			res.redirect("/");
    	});

	});
});

router.delete("/:list_id", function(req, res){
	// Clean all resources such as pictures.

	// Get landlord listing.
    _3rdPartyListing.findById(req.params.list_id, function(err, foundListing){
    	if(err)
    	{
    		console.log("Listing not found");
    		return;
    	}

    	try {
    		if(foundListing.coverPhoto.path!=""){
    			fs.unlinkSync(serverPath+foundListing.coverPhoto.path);
    		}
	    } catch(err){
	    	console.error(err);	
	    }

		
		// Need to remove this listing from dashboard and delete all other resources such as chatting channels.
		// 1. need to check the listing contains it as a child listing
		listingDbHandler.deleteChildListingFromAllParents(foundListing._id);

		foundListing.remove();


    	req.flash("success", "Listing Deleted Successfully");
		//res.send("listing deleted successfully");
		res.redirect("/ActiveListing");
	});
});

return router;

}

