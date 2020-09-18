var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../models/user");
var RentalRequest = require("../../models/listing/tenant_request");
var node = require("deasync");
var path = require("path");

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
                //console.log("tenant profile picture => " + tlist.picture);
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

router.get("/get_active_listing/own", function(req,res) {

    User.findById(req.user._id).populate('landlord_listing').populate('tenant_listing').populate('_3rdparty_listing').exec(function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            var tenant_listing = [];
            var landlord_listing = [];
            var _3rdparty_listing = [];

            //<note> yes, landlord_listing array got screwed up after populate... darn...
            foundUser.tenant_listing.forEach(function(listing){

                let profile_picture = (listing.profile_pictures[0]==undefined)? "": listing.profile_pictures[0].path;

                var tlist = {id: listing._id , picture: profile_picture, listingType: "tenant"}
                tenant_listing.push(tlist);
            });

            foundUser.landlord_listing.forEach(function(listing){
                let listing_picture = (listing.pictures[0]==undefined)? "": listing.pictures[0].path;

                var llist = {id: listing._id , picture: listing_picture, listingType: "landlord"}
                landlord_listing.push(llist);
            });


            foundUser._3rdparty_listing.forEach(function(listing){
                var llist = {id: listing._id , 
                             picture: listing.coverPhoto.path,
                             requester: {name: listing.requester.username, profile_picture: listing.requester.profile_picture}, 
                             url: listing.listingUrl, 
                             source: listing.listingSource, 
                             summary: listing.listingSummary,
                             location: listing.location,
                             price: listing.rentalPrice,
                             coordinates: listing.coordinates,
                             listingType: "_3rdparty"
                            }
                _3rdparty_listing.push(llist);
            });

            // passing whole data structure may not be a good idea?
            res.json({tenant_listing: tenant_listing, landlord_listing: landlord_listing, _3rdparty_listing: _3rdparty_listing});
        }
    });
});


router.get("/get_active_listing/friend", function(req,res) {

    User.findById(req.user._id).exec(async function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            var tenant_listing = [];
            var landlord_listing = [];
            var _3rdparty_listing = [];

            for(let index=0; index<foundUser.incoming_landlord_listing.length; index++)
            {
                let listing = foundUser.incoming_landlord_listing[index];
                let pathToPopulate = 'incoming_landlord_listing.'+index+".id";

                await foundUser.populate({path: pathToPopulate, model: "LandlordRequest"}).execPopulate();
                foundUser.populated(pathToPopulate);

                if(listing.id!=null){
                    var llist = {id: listing.id._id , picture: listing.id.pictures[0].path,
                                 friend: listing.list_of_referring_friends[listing.list_of_referring_friends.length-2],
                                 timestamp: listing.received_date}
                    landlord_listing.push(llist);
                }
            }


            for(let index=0; index<foundUser.incoming_tenant_listing.length; index++)
            {
                let listing = foundUser.incoming_tenant_listing[index];
                let pathToPopulate = 'incoming_tenant_listing.'+index+".id";

                await foundUser.populate({path: pathToPopulate, model: "TenantRequest"}).execPopulate();
                foundUser.populated(pathToPopulate);

                if(listing.id!=null){
                    var tlist = {id: listing.id._id , picture: listing.id.profile_pictures[0].path, 
                                 friend: listing.list_of_referring_friends[listing.list_of_referring_friends.length-2],
                                 timestamp: listing.received_date 
                                 }
                    tenant_listing.push(tlist);
                }
            }

            // passing whole data structure may not be a good idea?
            res.json({tenant_listing: tenant_listing, landlord_listing: landlord_listing, _3rdparty_listing: _3rdparty_listing});
        }
    });
});

router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;
