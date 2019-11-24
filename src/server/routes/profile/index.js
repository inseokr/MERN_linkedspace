var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../../models/user");
var RentalRequest = require("../../models/listing/tenant_request");
var node = require("deasync");

node.loop = node.runLoopOnce;


router.get("/", function(req,res){
    // 1. get user information from DB
    User.findById(req.user._id, function(err, curr_user){

        var userInfo = {
            user_id: req.user._id,
            profile_picture: curr_user.profile_picture,
            firstname: curr_user.firstname,
            lastname: curr_user.lastname,
            username: curr_user.username,
            email: curr_user.email,
            phone: curr_user.phone,
            password: curr_user.password,
            birthdate: curr_user.birthdate,
            address: curr_user.address,
            gender: curr_user.gender

        };

        res.render("./profile/profile_main", {user_info: userInfo});
    });

});

router.put("/:user_id", function(req, res){
    User.findById(req.params.user_id, function(err, curr_user){
        curr_user.firstname = req.body.first_name;        
        curr_user.lastname = req.body.last_name;        
        curr_user.username = req.body.user_name;        
        curr_user.phone = req.body.phone;        
        curr_user.email = req.body.email;      
        curr_user.address = req.body.location;

        // Why should I use Date structure??
        var birthdayString = req.body.birthdate.year+"-"+req.body.birthdate.month+"-"+req.body.birthdate.date;
        curr_user.birthdate = new Date(birthdayString);

        curr_user.gender = req.body.gender;

        curr_user.save();

        res.redirect("/");

    });

});


router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;