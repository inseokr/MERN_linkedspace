const express = require('express');

const router = express.Router();
const passport = require('passport');
const node = require('deasync');
const path = require('path');
const User = require('../../models/user');
const RentalRequest = require('../../models/listing/tenant_request');

node.loop = node.runLoopOnce;


router.get('/', (req, res) => {
  res.render('listing_main');
});

router.post('/', (req, res) => {
  if (req.body.post_type == 'landlord') {
    res.render('listing/landlord/new', { listing_info: { listing: null, listing_id: null } });
  } else {
    	res.render('listing/tenant/new', { listing_info: { listing: null, listing_id: null } });
  }
});

router.get('/show_active_listing', (req, res) => {
  User.findById(req.user._id).populate('landlord_listing').populate('tenant_listing').exec((err, foundUser) => {
    // User.findById(req.user._id).populate('tenant_listing').exec(function(err, foundUser){
    // User.findById(req.user._id).exec(function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      const tenant_listing = [];
      const landlord_listing = [];

      // <note> yes, landlord_listing array got screwed up after populate... darn...

      foundUser.tenant_listing.forEach((listing) => {
        const tlist = { id: listing._id, picture: listing.profile_pictures[0].path };
        // console.log("tenant profile picture => " + tlist.picture);
        tenant_listing.push(tlist);
      });


      foundUser.landlord_listing.forEach((listing) => {
        const llist = { id: listing._id, picture: listing.pictures[0].path };
        console.log(`landlord cover picture => ${llist.picture}`);
        landlord_listing.push(llist);
      });

      // passing whole data structure may not be a good idea?
      res.render('listing/show_active_listing', { tenant_listing, landlord_listing });
    }
  });
});

router.get('/getLastVisitedListingId', (req, res) => {
  // console.log('getLastVisitedListingId called');
  User.findById(req.user._id, (err, foundUser) => {
    if (err) {
      console.log('User not found');
      res.json(null);
    }

    // console.log(`sending lastVisitedListingId = ${JSON.stringify(foundUser.lastVistedListingId)}`);
    if (foundUser.lastVistedListingId === null) {
      // check listing from friends first
      if (foundUser.incoming_tenant_listing.length >= 1) {
        // console.warn(`incoming tenant listing ID: ${JSON.stringify(foundUser.incoming_tenant_listing[0].id)}`);
        res.json(foundUser.incoming_tenant_listing[0].id);
      } else if (foundUser.tenant_listing.length >= 1) {
        // console.warn(`tenant listing ID: ${JSON.stringify(foundUser.tenant_listing[0])}`);
        res.json(foundUser.tenant_listing[0]);
      } else {
        res.json(null);
      }
    } else {
      res.json(foundUser.lastVistedListingId);
    }
  });
});

router.get('/get_active_listing/own', (req, res) => {
  User.findById(req.user._id).populate('landlord_listing').populate('tenant_listing').populate('_3rdparty_listing').populate('events')

    .exec(async (err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        const tenant_listing = [];
        const landlord_listing = [];
        const _3rdparty_listing = [];
        const events = [];

        for (let index = 0; index < foundUser.tenant_listing.length; index++) {
          const listing = foundUser.tenant_listing[index];

          const profile_picture = (listing.profile_pictures[0] == undefined) ? '' : listing.profile_pictures[0].path;

          const pathToPopulate = 'requester';
          await listing.populate(pathToPopulate, 'username profile_picture firstname lastname move_in_date').execPopulate();
          listing.populated(pathToPopulate);

          const tlist = {
            id: listing._id,
            picture: profile_picture,
            delegated_posting: listing.delegated_posting,
            username: (listing.delegated_posting == true)
              ? listing.posting_originator.username
              : listing.requester.username,
            location: listing.location,
            listingType: 'tenant',
            date: listing.move_in_date
          };
          tenant_listing.push(tlist);
        }

        for (let index = 0; index < foundUser.landlord_listing.length; index++) {
          const listing = foundUser.landlord_listing[index];

          const listing_picture = (listing.pictures[0] == undefined) ? '' : listing.pictures[0].path;

          const llist = {
            id: listing._id,
            picture: listing_picture,
            location: listing.rental_property_information.location,
            listingType: 'landlord'
          };
          landlord_listing.push(llist);
        }

        for (let index = 0; index < foundUser.events.length; index++) {
          const listing = foundUser.events[index];

          let pathToPopulate = 'requester';
          await listing.populate(pathToPopulate, 'username profile_picture firstname lastname').execPopulate();
          listing.populated(pathToPopulate);

          pathToPopulate = `shared_user_group`;
          await listing.populate(pathToPopulate, 'username profile_picture firstname lastname').execPopulate();

          const event = {
            id: listing._id,
            username: listing.requester.username,
            location: {state: listing.location.state, city: listing.location.city},
            listingType: 'event',
            picture: listing.requester.profile_picture,
            date: listing.date,
            summary: listing.summary,
            coordinates: listing.coordinates,
            attendanceList: listing.attendanceList,
            shared_user_group: listing.shared_user_group
          };
          //console.warn(`pushing event: ${JSON.stringify(event)}`);
          //console.warn(`Date=${listing.date.toDateString()}`);
          events.push(event);
        }

        let numOfProcessedListing = 0;

        foundUser._3rdparty_listing.forEach(async (listing, index) => {
          // populate requester
          const pathToPopulate = `_3rdparty_listing.${index}.requester`;
          await foundUser.populate(pathToPopulate, 'username profile_picture firstname lastname').execPopulate();

          foundUser.populated(pathToPopulate);


          const llist = {
            id: listing._id,
            picture: listing.coverPhoto.path,
            requester: { name: listing.requester.username, profile_picture: listing.requester.profile_picture },
            url: listing.listingUrl,
            source: listing.listingSource,
            summary: listing.listingSummary,
            location: listing.location,
            price: listing.rentalPrice,
            coordinates: listing.coordinates,
            listingType: '_3rdparty'
          };
          _3rdparty_listing.push(llist);

          if (++numOfProcessedListing === foundUser._3rdparty_listing.length) {
            // passing whole data structure may not be a good idea?
            res.json({ tenant_listing, landlord_listing, _3rdparty_listing, events });
          }
        });

        if (foundUser._3rdparty_listing.length === 0) {
          res.json({ tenant_listing, landlord_listing, _3rdparty_listing, events });
        }
      }
    });
});


router.get('/get_active_listing/friend', (req, res) => {
  User.findById(req.user._id).exec(async (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      const tenant_listing = [];
      const landlord_listing = [];
      const _3rdparty_listing = [];
      const events = [];

      for (let index = 0; index < foundUser.incoming_landlord_listing.length; index++) {
        const listing = foundUser.incoming_landlord_listing[index];
        const pathToPopulate = `incoming_landlord_listing.${index}.id`;
        await foundUser.populate({ path: pathToPopulate, model: 'LandlordRequest' }).execPopulate();
        foundUser.populated(pathToPopulate);
        if (listing.id != null) {
          const llist = {
            id: listing.id._id,
            picture: listing.id.pictures[0].path,
            friend: listing.list_of_referring_friends[listing.list_of_referring_friends.length - 2],
            location: listing.id.rental_property_information.location,
            timestamp: listing.received_date,
          };
          landlord_listing.push(llist);
        }
      }

      for (let index = 0; index < foundUser.incoming_tenant_listing.length; index++) {
        const listing = foundUser.incoming_tenant_listing[index];
        const pathToPopulate = `incoming_tenant_listing.${index}.id`;

        await foundUser.populate({ path: pathToPopulate, model: 'TenantRequest' }).execPopulate();
        foundUser.populated(pathToPopulate);

        const listingOriginator = (listing.posting_originator === undefined) ? '' : listing.id.posting_originator.username;

        if (listing.id != null) {
          const tlist = {
            id: listing.id._id,
            picture: listing.id.profile_pictures[0].path,
            friend: listing.list_of_referring_friends[listing.list_of_referring_friends.length - 2],
            delegated_posting: listing.id.delegated_posting,
            username: listingOriginator,
            location: listing.id.location,
            timestamp: listing.received_date,
            date: listing.id.move_in_date
          };

          tenant_listing.push(tlist);
        }
      }

      for (let index = 0; index < foundUser.incoming_events.length; index++) {
        const listing = foundUser.incoming_events[index];

        let pathToPopulate = `incoming_events.${index}.id`;
        await foundUser.populate({ path: pathToPopulate, model: 'Event' }).execPopulate();
        foundUser.populated(pathToPopulate);

        pathToPopulate = `incoming_events.${index}.id.requester`;
        await foundUser.populate(pathToPopulate, 'username profile_picture firstname lastname').execPopulate();
        foundUser.populated(pathToPopulate);

        pathToPopulate = `incoming_events.${index}.id.shared_user_group`;
        await foundUser.populate(pathToPopulate, 'username profile_picture firstname lastname').execPopulate();

        try {
          if(listing.id) {
            const event = {
              id: listing.id._id,
              username: listing.id.requester.username,
              location: {state: listing.id.location.state, city: listing.id.location.city},
              listingType: 'event',
              picture: listing.id.requester.profile_picture,
              date: listing.id.date,
              summary: listing.id.summary,
              coordinates: listing.id.coordinates,
              attendanceList: listing.id.attendanceList,
              shared_user_group: listing.id.shared_user_group
            };
            //console.warn(`pushing event: ${JSON.stringify(event)}`);
            //console.warn(`Date=${listing.id.date.toDateString()}`);
            events.push(event); 
          }
        } catch(err) {
          console.warn(err);
        }
      }

      // passing whole data structure may not be a good idea?
      res.json({ tenant_listing, landlord_listing, _3rdparty_listing, events });
    }
  });
});

router.get('/:filename', (req, res) => {
  const fileName = req.params.filename;
 	console.log(`received file name=${fileName}`);
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;
