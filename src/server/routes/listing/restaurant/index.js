const express = require('express');

const router = express.Router();
const passport = require('passport');
const node = require('deasync');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const User = require('../../../models/user');
const Restaurant = require('../../../models/place/Restaurant');

const listingDbHandler = require('../../../db_utilities/listing_db/access_listing_db');

const serverPath = './src/server';
const picturePath = '/public/user_resources/pictures/restaurant/';

const { fileUpload2Cloud, fileDeleteFromCloud } = require('../../../aws_s3_api');
const { fetchYelpBusinessSearch } = require('../../../utilities/yelpApiWrapper');
const { fetchGoogleBusiness, fetchGoogleBusinessPhoto, fetchGooglePlaceByCoordinate, processPriceLevel } = require('../../../utilities/googleApiWrapper');

node.loop = node.runLoopOnce;

module.exports = function (app) {
  router.post('/file_upload', (req, res) => {
    const sampleFile = req.files.photo;
    const picPath = serverPath + picturePath + sampleFile.name;

    //console.log(`file_upload: picPath=${picPath}`);
    //console.warn(`sampleFile=${JSON.stringify(sampleFile)}`);

    sampleFile.mv(picPath, (err) => {
      if (err) {
        console.warn(`file can't be replaced!! with error code=${err}`);
        return res.status(500).send(err);
      }

      //console.warn(`File successfully replaced`);
      res.json({result: 'OK'});
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
    //const copiedFileName = req.body.imgFileName;
    //console.warn(`copiedFileName =${copiedFileName}`);
    //const filename = copiedFileName.replace(/^.*[\\\/]/, '');
    //console.warn(`converted file name = ${filename}`);
    const filename = req.body.imgFileName;

    const newListing = new Restaurant();

    newListing.requester = req.user._id;

    newListing.listingSource = req.body.listingSource;
    newListing.listingUrl = req.body.listingUrl;
    newListing.listingSummary = req.body.listingSummary;
    newListing.locationString = req.body.location;

    //console.warn(`imageUrl: ${req.body.imageUrl}`);

    if(req.body.imageUrl) {
      newListing.coverPhoto.path = req.body.imageUrl;
    } else {
      // let's create a database
      // rename the file with listing_id
      try {
        if (filename !== '' && filename!==null ) {
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
      } catch (err) {
        console.warn(`File rename failure with err=${err}`);
      }
    }

    if(req.body.coordinates) {
      newListing.coordinates.lat = location.latitude;
      newListing.coordinates.lng = location.longitude;

      newListing.save((err) => {
        if (err) {
            console.log('New Listing Save Failure');
            console.log(`error = ${err}`);
        res.json({ result: 'New Listing Save Failure' });
        }

        User.findById(req.user._id, (err, foundUser) => {
            foundUser.places.restaurant.push(newListing._id);
            foundUser.save();
        });
      });

      //console.warn(`newListing ID = ${newListing._id}`);
      res.json({ result: 'successul creation of listing', createdId: newListing._id });
    } else {
      // set location information
      let address = req.body.location;
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`).then(
          response => response.json()).then((response) => {
              const { results, status } = response;
              if (status === 'OK') {
                  const { geometry } = results[0];
                  const { location } = geometry;
                  newListing.coordinates.lat = location.lat;
                  newListing.coordinates.lng = location.lng;


                  newListing.save((err) => {
                      if (err) {
                          console.log('New Listing Save Failure');
                          console.log(`error = ${err}`);
                      res.json({ result: 'New Listing Save Failure' });
                      }

                      User.findById(req.user._id, (err, foundUser) => {
                          foundUser.places.restaurant.push(newListing._id);
                          foundUser.save();
                      });
                  });

                  //console.warn(`newListing ID = ${newListing._id}`);
                  res.json({ result: 'successful creation of listing', createdId: newListing._id });

              } else {
                  console.warn('New Event Creation failure');
                  res.json({result: 'FAIL', reason: 'Location is wrong'});
              }
          }
      );
    }

  });

  router.post('/new_yelp', (req, res) => {
    const newListing = new Restaurant();
    newListing.requester = req.user._id;

    newListing.listingSource = 'Yelp';
    newListing.listingUrl = req.body.webViewUrl;

    // example
    /*{"id":"eO5tJ35vZ2orLd1IY2-6Iw",
      "alias":"koja-kitchen-fremont-4",
      "name":"Koja Kitchen",
      "image_url":"https://s3-media3.fl.yelpcdn.com/bphoto/7i9GO6iFkRWPa79w6kAtBg/o.jpg","is_closed":false,
      "url":"https://www.yelp.com/biz/koja-kitchen-fremont-4?adjust_creative=BixayGc6BtXSQo6cWni1qw&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=BixayGc6BtXSQo6cWni1qw","review_count":166,
      "categories":[{"alias":"korean","title":"Korean"},{"alias":"japanese","title":"Japanese"},{"alias":"bars","title":"Bars"}],
      "rating":4,"coordinates":{"latitude":37.50079,"longitude":-121.97006},"transactions":["pickup","delivery"],
      "price":"$$",
      "location":{"address1":"43845 Pacific Commons Blvd","address2":"Ste SP-5G","address3":"","city":"Fremont","zip_code":"94538","country":"US","state":"CA",
      "display_address":["43845 Pacific Commons Blvd","Ste SP-5G","Fremont, CA 94538"]},"phone":"+15105734536","display_phone":"(510) 573-4536","distance":7.281423096646681}*/

    //console.warn(`req.body.identifier: ${req.body.identifier}`);
    fetchYelpBusinessSearch(req.body.identifier).then((response) => {
      if (response && response.name) {
          //console.warn(`YELP response: ${JSON.stringify(response)}`);
          try {
          Restaurant.findOne({listingSummary: response.name}, async (err, foundRestaurant) => {

            if(foundRestaurant || err) {
              if(foundRestaurant) {
                // let's check coordinates as well
                if((Number.parseFloat(foundRestaurant.coordinates.lat).toFixed(4) === Number.parseFloat(response.coordinates.latitude).toFixed(4) )
                    &&
                   (Number.parseFloat(foundRestaurant.coordinates.lng).toFixed(4) === Number.parseFloat(response.coordinates.longitude).toFixed(4)) ) {
                    //console.warn(`Same location....`);
                    res.json({ result: 'OK', createdId: foundRestaurant._id });
                    return;
                }
              }
              else {
                res.json({ result: 'FAIL', reason: err });
                return;
              }
            }

            if(!response.location) {
              console.warn(`fetchYelpBusinessSearch: returned null location`);
              res.json({ result: 'FAIL', reason: 'NULL location' });
              return;
            }

            newListing.listingSummary = response.name;
            newListing.locationString = response.location.display_address[0]+', '+response.location.display_address[1];
            newListing.coverPhoto.path = response.image_url;
            newListing.coordinates.lat = response.coordinates.latitude;
            newListing.coordinates.lng = response.coordinates.longitude;
            newListing.category = response.categories[0].alias;
            newListing.categories = response.categories.map(category => category.alias);
            newListing.place_id = response.id;
            newListing.price = response.price;

            newListing.save((err) => {
              if (err) {
                console.log('New Listing Save Failure');
                console.log(`error = ${err}`);
                res.json({ result: 'New Listing Save Failure' });
              }

              User.findById(req.user._id, (err, foundUser) => {
                //console.warn(`Created new restaurant and added to the places.`);
                foundUser.places.restaurant.push(newListing._id);
                foundUser.save();
                //console.warn(`newListing ID = ${newListing._id}`);
                res.json({ result: 'OK', createdId: newListing._id });

              });
            });

          });
        } catch (err) {
          res.json({ result: 'FAIL', reason: err });
        }
      } else {
        res.json({ result: 'FAIL', reason: 'Yelp returns empty response'});
      }
    });
  });

  router.post('/new_google', (req, res) => {
    const newListing = new Restaurant();
    newListing.requester = req.user._id;
    newListing.listingSource = 'Google';
    newListing.listingUrl = req.body.webViewUrl;

    const handleResponse = (req, res, googleBusinessResponse, googleBusinessPhotoResponse) => {
      if (googleBusinessPhotoResponse) {
        try {
          const { name, geometry, formatted_address, types, price_level, place_id } = googleBusinessResponse;
          Restaurant.findOne({listingSummary: name}, async (err, foundRestaurant) => {
            if (foundRestaurant || err) {
              if (foundRestaurant) {
                if((Number.parseFloat(foundRestaurant.coordinates.lat).toFixed(4) === Number.parseFloat(geometry.location.latitude).toFixed(4) ) &&
                  (Number.parseFloat(foundRestaurant.coordinates.lng).toFixed(4) === Number.parseFloat(geometry.location.longitude).toFixed(4)) ) {
                  res.json({ result: 'OK', createdId: foundRestaurant._id });
                  return;
                }
              } else {
                res.json({ result: 'FAIL', reason: err });
                return;
              }
            }

            newListing.listingSummary = name;
            newListing.locationString = formatted_address;
            newListing.coverPhoto.path = googleBusinessPhotoResponse.res.responseUrl;
            newListing.coordinates = geometry.location;
            newListing.category = types[0];
            newListing.categories = types;
            newListing.place_id = place_id;
            newListing.price = processPriceLevel(price_level);

            newListing.save((err) => {
              if (err) {
                console.log('New Listing Save Failure');
                console.log(`error = ${err}`);
                res.json({ result: 'New Listing Save Failure' });
              }

              User.findById(req.user._id, (err, foundUser) => {
                //console.warn(`Created new restaurant and added to the places.`);
                foundUser.places.restaurant.push(newListing._id);
                foundUser.save();
                //console.warn(`newListing ID = ${newListing._id}`);
                res.json({ result: 'OK', createdId: newListing._id });

              });
            });

          });
        } catch (err) {
          res.json({ result: 'FAIL', reason: err });
        }
      }
    }

    if(req.body.placeCoordinate) {
      fetchGooglePlaceByCoordinate(req.body.placeCoordinate).then((googleBusinessResponse) => {
        if (googleBusinessResponse) {
          fetchGoogleBusinessPhoto(googleBusinessResponse.photos[0].photo_reference).then((googleBusinessPhotoResponse) => {
            handleResponse(req, res, googleBusinessResponse, googleBusinessPhotoResponse);
          });
        }
      });
    }
    else {
      if(req.body.identifier) {
        fetchGoogleBusiness(req.body.identifier).then((googleBusinessResponse) => {
          if (googleBusinessResponse) {
            fetchGoogleBusinessPhoto(googleBusinessResponse.photos[0].photo_reference).then((googleBusinessPhotoResponse) => {
              handleResponse(req, res, googleBusinessResponse, googleBusinessPhotoResponse);
            });
          }
        });
      }
    }
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
            res.json({result: 'FAIL', reason: 'listing save failure'});
        }

        res.json({result: 'OK'});
        });
    });
  });

  router.delete('/:list_id', (req, res) => {
    // Clean all resources such as pictures.

    Restaurant.findById(req.params.list_id, (err, foundListing) => {
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
      listingDbHandler.deleteChildListingFromAllParents(foundListing._id, 'event');

      foundListing.remove();

    	req.flash('success', 'Listing Deleted Successfully');
      // res.send("listing deleted successfully");
      res.json({result: 'OK'});
    });
  });


  router.get('/favorites', async (req, res) => {
    // need to populate favorites...
    // check if user log is logged in
    if(req.user!==undefined) {
      const pathToPopulate = `places.restaurant`;
      await req.user.populate(pathToPopulate, 'listingUrl listingSummary coverPhoto category price coordinates').execPopulate();
      req.user.populated(pathToPopulate);

      //console.warn(`restaurants = ${req.user.places.restaurant}`);

      res.json({result: 'OK', favoriteList: req.user.places.restaurant});

    } else {
      res.json({result: 'FAIL', reason: 'User is not logged in'});
    }

  });


  return router;
};
