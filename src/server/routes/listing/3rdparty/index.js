var express       = require("express");
var router        = express.Router();
var passport      = require("passport");
var User 	      = require("../../../models/user");
var TenantRequest = require("../../../models/listing/tenant_request");
var node          = require("deasync");
var path          = require("path");
var fs            = require("fs");

var serverPath         = "./src/server";
var picturePath        = "./src/server/public/user_resources/pictures/3rdparty/"

node.loop = node.runLoopOnce;

module.exports = function(app) {


router.post('/file_upload', function(req, res) {

  let sampleFile = req.files.file_name;
  let picPath = picturePath+sampleFile.name;

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

	const picPath = picturePath+filename;
	fs.unlinkSync(picPath);
	res.send('File Deleted!');
});


router.post("/new", function(req, res){

	console.log("ISEO: 3rd party listing: body=" + JSON.stringify(req.body));

	var filename = path.parse(req.body.file_name).base;

	User.findById(req.params.user_id, function(err, curr_user){

		if(err){
			console.log("No user found with given user id");
			res.send('no user found');
			return;
		}

		// let's create a database

		// rename the file with listing_id
		let original_path = picturePath + filename;
		let new_path = picturePath + req.params.user_id + "_" +filename;
		fs.rename(original_path, new_path, function(err){
			if(err) throw err;
			console.log('File renamed successfully')
		})

	});

	res.send('New Listing Created!');
});


return router;

}

