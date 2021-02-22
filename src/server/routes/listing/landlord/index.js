const express = require('express');

const router = express.Router();
const passport = require('passport');
const node = require('deasync');
const path = require('path');
const fetch = require('node-fetch');
const User = require('../../../models/user');
const LandlordRequest = require('../../../models/listing/landlord_request');
const listingDbHandler = require('../../../db_utilities/listing_db/access_listing_db');
const userDbHandler = require('../../../db_utilities/user_db/access_user_db');

const { fileDeleteFromCloud } = require('../../../aws_s3_api');

node.loop = node.runLoopOnce;

module.exports = function (app) {
  router.post('/new', async (req, res) => {
    if (req.body.submit == 'exit') {
      res.render('listing_main');
    } else {
      // TODO https://github.com/inseokr/MERN_linkedspace/issues/483
      const {
        street, city, state, zipcode, country
      } = req.body.location;
      const address = `${street}, ${city}, ${state}, ${zipcode}. ${country}`;
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`).then(response => response.json()).then((response) => {
        const { results, status } = response;
        if (status === 'OK') {
          const { geometry } = results[0];
          const { location } = geometry;

          const newListing = new LandlordRequest();

          // add username and id
          newListing.requester = req.user._id;

          newListing.rental_property_information = req.body.rental_property_information;
          newListing.rental_property_information.location = req.body.location;
          newListing.rental_property_information.coordinates = location;

          newListing.move_in_date = req.body.move_in_date;
          newListing.rental_duration = req.body.rental_duration;
          newListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
          newListing.rental_budget = req.body.rental_budget;
          newListing.num_of_bedrooms = 0;

          newListing.save((err) => {
            if (err) {
              console.log('New Listing Save Failure');
              res.render('/');
            }

            User.findById(req.user._id, (err, foundUser) => {
              if (err) {
                console.log('User Not found with given User');
                return;
              }


              foundUser.landlord_listing.push(newListing._id);
              foundUser.save();
            });

            res.render('listing/landlord/new_step2', { listing_info: { listing: newListing, listing_id: newListing._id } });
          });
        } else {
          console.log('New Listing Fetch Coordinate Error.');
          res.render('/');
        }
      });
    }
  });

  router.post('/:listing_id/new', async (req, res) => {
    LandlordRequest.findById(req.params.listing_id, (err, foundListing) => {
      // TODO https://github.com/inseokr/MERN_linkedspace/issues/483
      const {
        street, city, state, zipcode, country
      } = req.body.location;
      const address = `${street}, ${city}, ${state}, ${zipcode}. ${country}`;
      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`).then(response => response.json()).then((response) => {
        const { results, status } = response;
        if (status === 'OK') {
          const { geometry } = results[0];
          const { location } = geometry;

          foundListing.rental_property_information = req.body.rental_property_information;
          foundListing.rental_property_information.location = req.body.location;
          foundListing.rental_property_information.coordinates = location;

          foundListing.save((err) => {
            if (err) {
              console.log('New Listing Save Failure');
              res.render('/');
            }

            res.render('listing/landlord/new_step2', { listing_info: { listing: foundListing, listing_id: req.params.listing_id } });
          });
        } else {
          console.log('Listing Fetch Coordinate Error.');
          res.render('/');
        }
      });
    });
  });

  // the route name may need to be revised.
  router.put('/:list_id', (req, res) => {
    if (req.body.submit == 'exit') {
      res.render('/');
    } else {
      LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
        if (err) {
          req.flash('error', 'No such listing found');
          res.redirect('/');
        } else {
          switch (req.body.submit) {
            case 'step#2':
              handleStep2(req, res, foundListing);
              res.render('listing/landlord/new_step3', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
              break;
            case 'step#3':
              handleStep3(req, res, foundListing);
              res.render('listing/landlord/new_step4', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
              break;
            case 'step#4':
              handleStep4(req, res, foundListing);
              res.render('listing/landlord/new_step5', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
              break;
            case 'step#5':
              handleStep5(req, res, foundListing);
              res.render('listing/landlord/new_step6', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
              break;
            case 'step#6':
              handleStep6(req, res, foundListing);
              // need to add user ID of roommates if exists.
              req.flash('success', 'Listing posted successfully');

      		  var facilities = [];
      		  var amenities = [];

      		  preprocessListing(foundListing, facilities, amenities);

      		  res.redirect(`/listing/landlord/${foundListing._id}/get`);
              /* res.render('listing/landlord/show',
                { listing_info: { listing: foundListing, accessibleSpaces: facilities, availableAmenities: amenities } }); */
              break;
            default:
              req.flash('error', 'No such step found');
              res.redirect('/');
              break;
          }
        }
      });
    }
  });

  router.get('/:list_id/step1', (req, res) => { // Code for the previous button in step 2
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/landlord/new', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/step2', (req, res) => { // Code for the previous button in step 3
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/landlord/new_step2', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/step3', (req, res) => { // Code for the previous button in step 4
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/landlord/new_step3', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/step4', (req, res) => { // Code for the previous button in step 5
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/landlord/new_step4', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/step5', (req, res) => { // Code for the previous button in step 6
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/landlord/new_step5', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  router.get('/:list_id/step6', (req, res) => { // Code for the step 6 stepwizard
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
      if (err) {
    		console.log('Listing not found');
    		return;
    	}
      res.render('listing/landlord/new_step6', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });

  function handleStep1(req, res, foundListing) {
    foundListing.requester = req.user._id;
    foundListing.rental_property_information = req.body.rental_property_information;
    foundListing.rental_property_information.location = req.body.location;
    foundListing.move_in_date = req.body.move_in_date;
    foundListing.rental_duration = req.body.rental_duration;
    foundListing.maximum_range_in_miles = req.body.maximum_range_in_miles;
    foundListing.rental_budget = req.body.rental_budget;
    foundListing.save();
  }

  function handleStep2(req, res, foundListing) {
    // this should be a number instead?
    foundListing.bedrooms = []; // Clear bedroom array to update with new bed forms.
    foundListing.num_of_bedrooms = req.body.num_of_bedrooms;
    for (let bedIndex = 0; bedIndex <= foundListing.num_of_bedrooms; bedIndex++) {
      const curBedRoom = eval(`req.body.bedroom_${bedIndex}`);
      console.log(curBedRoom);
      if (curBedRoom.bedding_provided === 'on') {
        curBedRoom.bedding_provided = true;
      } else {
        curBedRoom.bedding_provided = false;
      }
      foundListing.bedrooms.push(curBedRoom);
      foundListing.num_of_total_guests += Number(curBedRoom.num_of_guests_bedroom);
      const numOfBathRooms = parseFloat(curBedRoom.num_of_bathrooms);
      foundListing.num_of_total_baths += numOfBathRooms;
    }
    foundListing.save();
  }

  function handleStep3(req, res, foundListing) {
    for (const key in req.body.amenities) {
      req.body.amenities[key] = true; // Anything in req.body.amenities should be set to true.
    }
    foundListing.amenities = req.body.amenities;
    foundListing.save();
  }

  function handleStep4(req, res, foundListing) {
    for (const key in req.body.accessible_spaces) {
      req.body.accessible_spaces[key] = true; // Anything in req.body.amenities should be set to true.
    }
    foundListing.accessible_spaces = req.body.accessible_spaces;
    foundListing.save();
  }

  function handleStep5(req, res, foundListing) {
    // handle caption data?
    // 1. need to know the totall numbers uploaded.
    // <note> There could be empty picture entry....
    let processedPictures = 0;

    for (let picIndex = 0; processedPictures < foundListing.num_of_pictures_uploaded; picIndex++) {
      console.log(`ISEO: picIndex = ${picIndex}`);
      if (foundListing.pictures[picIndex].path != '') {
        foundListing.pictures[picIndex].caption = eval(`req.body.caption_${picIndex + 1}`);
        processedPictures++;
      }
    }
    foundListing.save();
  }


  function handleStep6(req, res, foundListing) {
    foundListing.summary_of_listing = req.body.summary_of_listing.trim();
    foundListing.summary_of_neighborhood = req.body.summary_of_neighborhood.trim();
    foundListing.summary_of_transportation = req.body.summary_of_transportation.trim();
    foundListing.rental_terms = req.body.rental_terms;
    foundListing.move_in_date = req.body.move_in_date;
    foundListing.contact = req.body.contact;
    foundListing.save();
  }

  function preprocessListing(listing, accessibleSpaces, amenities) {
    if (listing.accessible_spaces.living_room != 'off') {
      accessibleSpaces.push('living room');
    }

    if (listing.accessible_spaces.pool != 'off') {
      accessibleSpaces.push('pool');
    }

    if (listing.accessible_spaces.gym != 'off') {
      accessibleSpaces.push('gym');
    }

    if (listing.accessible_spaces.laundry != 'off') {
      accessibleSpaces.push('laundry');
    }

    if (listing.accessible_spaces.kitchen != 'off') {
      accessibleSpaces.push('kitchen');
    }

    if (listing.accessible_spaces.parking != 'off') {
      accessibleSpaces.push('parking');
    }

    // amenities
    if (listing.amenities.internet != 'off') {
      amenities.push('Internet');
    }

    if (listing.amenities.closet != 'off') {
      amenities.push('Closet');
    }

    if (listing.amenities.tv != 'off') {
      amenities.push('TV entertainment system');
    }

    if (listing.amenities.ac != 'off') {
      amenities.push('Air Conditioner');
    }

    if (listing.amenities.desk != 'off') {
      amenities.push('Desk');
    }

    if (listing.amenities.smoke_detector != 'off') {
      amenities.push('Smoke detector');
    }

    if (listing.amenities.private_entrance != 'off') {
      amenities.push('Private entrance');
    }

    if (listing.amenities.fire_extinguisher != 'off') {
      amenities.push('Fire extinguisher');
    }
  }

  // ISEO: this is just for testing

  router.get('/show', (req, res) => {
    res.render('listing/landlord/show_v1');
  });

  router.get('/marker_trial', (req, res) => {
    res.render('listing/landlord/marker_trial');
  });

  router.get('/marker_trial_v1', (req, res) => {
    res.render('listing/landlord/marker_trial_v1');
  });

  router.get('/:filename', (req, res) => {
    const fileName = req.params.filename;
 	console.log(`received file name=${fileName}`);
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/landlord/${fileName}`));
  });


  router.get('/new_step3', (req, res) => {
    res.render('listing/landlord/new_step3');
  });

  router.get('/new_step4', (req, res) => {
    res.render('listing/landlord/new_step4');
  });

  router.get('/new_step5', (req, res) => {
    res.render('listing/landlord/new_step5');
  });

  router.get('/new_step6', (req, res) => {
    res.render('listing/landlord/new_step6');
  });


  router.get('/edit', (req, res) => {
    res.render('listing/landlord/new_step5');
  });


  router.get('/temp', (req, res) => {
    res.render('listing/landlord/new_step6');
  });

  router.post('/:list_id/edit', (req, res) => {
    // Get tenant listing.
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not fkkound');
    		return;
    	}
      res.render('listing/landlord/new', { listing_info: { listing: foundListing, listing_id: req.params.list_id } });
    });
  });


  router.get('/:list_id/show', (req, res) => {
    // Clean all resources such as pictures.

    // Get landlord listing.
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}
      const facilities = [];
      const amenities = [];

      preprocessListing(foundListing, facilities, amenities);
      console.log(`ISEO: list_id = ${req.params.list_id}`);

      res.render('listing/landlord/show',
        {
          listing_info: {
            listing: foundListing, accessibleSpaces: facilities, availableAmenities: amenities, list_id: req.params.list_id
          }
        });
    });
  });


  router.get('/:list_id/fetch', (req, res) => {
    // Clean all resources such as pictures.

    // console.log("REACT: fetch landlord listing request with listing id = " + req.params.list_id);
    // Get landlord listing.
    LandlordRequest.findById(req.params.list_id).populate('requester').exec((err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}
      const facilities = [];
      const amenities = [];

      preprocessListing(foundListing, facilities, amenities);

      listing_info = 			{
        listing: foundListing, accessibleSpaces: facilities, availableAmenities: amenities, list_id: req.params.list_id
      };
      res.json(listing_info);

      userDbHandler.findUserById(req.user._id).then(async (foundUser) => {
        if (!foundListing.requester.equals(foundUser._id)) {
          userDbHandler.readListingFromFriends(foundUser, 'landlord', req.params.list_id);
          foundUser.save();
        }
      });
    });
  });

  router.delete('/:list_id', (req, res) => {
    // Clean all resources such as pictures.

    // Get landlord listing.
    LandlordRequest.findById(req.params.list_id, (err, foundListing) => {
    	if (err) {
    		console.log('Listing not found');
    		return;
    	}

    	try {
    		for (let picIndex = 0; picIndex < foundListing.num_of_pictures_uploaded; picIndex++) {
          if (foundListing.pictures[picIndex].path != '') {
          	fileDeleteFromCloud(foundListing.pictures[picIndex].path);
		    fs.unlinkSync(foundListing.pictures[picIndex].path);
          }
        }
	    } catch (err) {
	    	console.error(err);
	    }

	    userDbHandler.deleteListingFromUserDB(foundListing);

      foundListing.remove();

    	req.flash('success', 'Listing Deleted Successfully');
      res.redirect('/ActiveListing');
    });
  });


  // forward listing to direct friends
  // Let's move it to common utility
  router.post('/:list_id/forward', async (req, res) => {
    userDbHandler.handleListingForward(req, res, 'landlord');
  });

  return router;
};
