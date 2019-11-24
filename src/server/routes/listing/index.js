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


router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;