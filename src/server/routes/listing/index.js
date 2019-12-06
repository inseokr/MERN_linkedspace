var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../models/user");
var RentalRequest = require("../../models/listing/tenant_request");
var node = require("deasync");

node.loop = node.runLoopOnce;


router.get("/", function(req,res){
	res.render("listing_main");
});

router.post("/", function(req, res){

    if(req.body.post_type=="landlord")
    {
        res.render("listing/landlord/new", {listing_info: { listing: null, listing_id: null}});
        
    } else 
    {
    	res.render("listing/tenant/new", {listing_info: { listing: null, listing_id: null}});
    }
});

router.get("/show_active_listing", function(req,res){
    User.findById(req.user._id).populate('landlord_listing').populate('tenant_listing').exec(function(err, foundUser){
    //User.findById(req.user._id).populate('tenant_listing').exec(function(err, foundUser){
    //User.findById(req.user._id).exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            var tenant_listing = [];
            var landlord_listing = [];

            //<note> yes, landlord_listing array got screwed up after populate... darn...
            
            foundUser.tenant_listing.forEach(function(listing){
                var tlist = {id: listing._id , picture: listing.profile_pictures[0].path}
                console.log("tenant profile picture => " + tlist.picture);
                tenant_listing.push(tlist);
            });


            foundUser.landlord_listing.forEach(function(listing){
                var llist = {id: listing._id , picture: listing.pictures[0].path}
                console.log("landlord cover picture => " + llist.picture);
                landlord_listing.push(llist);
            });

            // passing whole data structure may not be a good idea?
            res.render("listing/show_active_listing", {tenant_listing: tenant_listing, landlord_listing: landlord_listing});
        }
    });
});


router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;