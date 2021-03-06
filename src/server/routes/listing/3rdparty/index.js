const express = require('express');

const router = express.Router();
const passport = require('passport');
const node = require('deasync');
const path = require('path');
const fs = require('fs');
const User = require('../../../models/user');
const _3rdPartyListing = require('../../../models/listing/_3rdparty_listing');
const listingDbHandler = require('../../../db_utilities/listing_db/access_listing_db');

const serverPath = './src/server';
const picturePath = '/public/user_resources/pictures/3rdparty/';

const { fileUpload2Cloud, fileDeleteFromCloud } = require('../../../aws_s3_api');


node.loop = node.runLoopOnce;

module.exports = function (app) {
  router.post('/file_upload', (req, res) => {
    const sampleFile = req.files.file_name;
    const picPath = serverPath + picturePath + sampleFile.name;

    console.log(`file_upload: picPath=${picPath}`);
    sampleFile.mv(picPath, (err) => {
      if (err) return res.status(500).send(err);
      res.send('File uploaded!');
    });
  });


  router.post('/file_delete', (req, res) => {
    const filename = req.body.file_name.replace(/^.*[\\\/]/, '');
    const picPath = serverPath + picturePath + filename;
    fileDeleteFromCloud(picturePath + filename);
    fs.unlinkSync(picPath);
    res.send('File Deleted!');
  });


  router.post('/new', (req, res) => {
    //console.warn(`Original file name =${req.body.file_name}`);
    const copiedFileName = req.body.file_name;
    //console.warn(`copiedFileName =${copiedFileName}`);
    const filename = copiedFileName.replace(/^.*[\\\/]/, '');
    //console.warn(`converted file name = ${filename}`);

    const newListing = new _3rdPartyListing();

    newListing.requester = req.user._id;

    newListing.listingSource = req.body.listingSource;
    newListing.listingUrl = req.body.sourceUrl;
    newListing.listingSummary = req.body.rentalSummary;
    newListing.rentalPrice = req.body.rentalPrice.replace(/\$|,/g, '');

    // set location information
    newListing.location.street = req.body['location[street]'];
    newListing.location.city = req.body['location[city]'];
    newListing.location.state = req.body['location[state]'];
    newListing.location.country = req.body['location[country]'];
    newListing.location.zipcode = req.body['location[zipcode]'];

    newListing.coordinates.lat = req.body['coordinates[lat]'];
    newListing.coordinates.lng = req.body['coordinates[lng]'];

    // let's create a database
    // rename the file with listing_id
    if (filename != '') {
      const original_path = serverPath + picturePath + filename;
      const new_full_picture_path = `${picturePath + newListing.requester}_${filename}`;
      const new_path = `${serverPath + new_full_picture_path}`;
      fs.rename(original_path, new_path, (err) => {
        if (err) throw err;
        fileUpload2Cloud(serverPath, new_full_picture_path);
      });
      // ISEO-TBD: The path should start from "/public/..."?
      newListing.coverPhoto.path = new_full_picture_path;
    }

    newListing.save((err) => {
      if (err) {
	    	console.log('New Listing Save Failure');
	    	console.log(`error = ${err}`);
        res.json({ result: 'New Listing Save Failure' });
	    }

	    User.findById(req.user._id, (err, foundUser) => {
	    	foundUser._3rdparty_listing.push(newListing._id);
	    	foundUser.save();
    	});
    });

    res.json({ result: 'successul creation of listing' });
  });


  router.post('/:listing_id/new', (req, res) => {
    _3rdPartyListing.findById(req.params.listing_id, (err, foundListing) => {
      //console.log('Updating 3rdparty posting');

      /*console.warn(`file_name=${req.body.file_name}`);
      //const filename = path.parse(req.body.file_name).base;
      const filename = req.body.file_name.replace(/^.*[\\\/]/, '');
      console.warn(`after conversion: file_name=${filename}`);*/
      //console.warn(`Original file name =${req.body.file_name}`);
      const copiedFileName = req.body.file_name;
      //console.warn(`copiedFileName =${copiedFileName}`);
      const filename = copiedFileName.replace(/^.*[\\\/]/, '');
      //console.warn(`converted file name = ${filename}`);

	    foundListing.listingSource = req.body.listingSource;
	    foundListing.listingUrl = req.body.sourceUrl;
	    foundListing.listingSummary = req.body.rentalSummary;
	    foundListing.rentalPrice = req.body.rentalPrice.replace(/\$|,/g, '');

      foundListing.location.street = req.body['location[street]'];
      foundListing.location.city = req.body['location[city]'];
      foundListing.location.state = req.body['location[state]'];
      foundListing.location.country = req.body['location[country]'];
      foundListing.location.zipcode = req.body['location[zipcode]'];
  
      foundListing.coordinates.lat = req.body['coordinates[lat]'];
      foundListing.coordinates.lng = req.body['coordinates[lng]'];

      if (filename != '') {
  	    const original_path = serverPath + picturePath + filename;
        const new_full_picture_path = `${picturePath + foundListing.requester}_${filename}`;
        const new_path = `${serverPath + new_full_picture_path}`;
        fs.rename(original_path, new_path, (err) => {
          if (err) throw err;
          //console.log('File renamed successfully');
          fileUpload2Cloud(serverPath, new_full_picture_path);
        });

        // ISEO-TBD: The path should start from "/public/..."?
        foundListing.coverPhoto.path = new_full_picture_path;
      }

    	foundListing.save((err) => {
    		if (err) {
		    	console.log('Listing Save Failure');
    			res.redirect('/');
    		}

        res.redirect('/');
    	});
    });
  });

  router.delete('/:list_id', (req, res) => {
    // Clean all resources such as pictures.

    // Get landlord listing.
    _3rdPartyListing.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}

    	try {
    		if (foundListing.coverPhoto.path != '') {
    			fileDeleteFromCloud(foundListing.coverPhoto.path);
    			fs.unlinkSync(serverPath + foundListing.coverPhoto.path);
    		}
	    } catch (err) {
	    	console.error(err);
	    }

      // Need to remove this listing from dashboard and delete all other resources such as chatting channels.
      // 1. need to check the listing contains it as a child listing
      listingDbHandler.deleteChildListingFromAllParents(foundListing._id);

      foundListing.remove();

    	req.flash('success', 'Listing Deleted Successfully');
      // res.send("listing deleted successfully");
      res.redirect('/ActiveListing');
    });
  });

  return router;
};
