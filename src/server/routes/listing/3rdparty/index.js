var express            = require("express");
var router             = express.Router();
var passport           = require("passport");
var User 	           = require("../../../models/user");
var node               = require("deasync");
var path               = require("path");
var fs                 = require("fs");
var _3rdPartyListing   = require("../../../models/listing/_3rdparty_listing");

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


	console.log("3rd party listinng = " + JSON.stringify(req.body));

	var filename = path.parse(req.body.file_name).base;


	var newListing = new _3rdPartyListing;

	newListing.requester.id       = req.user._id;
	newListing.requester.username = req.user.username;
	newListing.requester.profile_picture = req.user.profile_picture;

	newListing.listingSource      = req.body.listingSource;
	newListing.listingUrl         = req.body.sourceUrl;
	newListing.listingSummary     = req.body.rentalSummary;
	newListing.rentalPrice        = req.body.rentalPrice;

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


return router;

}

