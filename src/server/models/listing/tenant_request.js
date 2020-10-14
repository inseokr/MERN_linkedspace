var mongoose = require("mongoose");

var TenantRequestSchema = new mongoose.Schema({
	  requester: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String,
      profilePicture: String
  	},

    listingType: {type: String, default: "tenant"},

  	// roommates if any
  	roommates: [
      {
       id: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "User"
       },
       username: String,
       profile_picture: {
          path: String,
          caption: String
       },
       profile: String,
      }
    ],


// index 0 wil be the cover photo.
    num_of_profile_picture_uploaded: {type: Number, default: 0},

    profile_pictures: [
      {
        path: String,
        caption: String
      }
    ],

    // 0. Initial State
    // 1. Being reviewed by middlemen or landlord
    // 2. Connected with at least with one landlord
    // 3. In the middle of negotiation
    // 4. Transaction completed
    state: Number,

  	// list of landlords or middlemen helping this requests
  	request_responses: [
  	 {
        responder: {
      	 	id: {
             	type: mongoose.Schema.Types.ObjectId,
             	ref: "User"
             },
          username: String,
          // 1: middlemen, 2: landlord
          type: Number,
          // reference to the rental post
          post_id: {
          	type: mongoose.Schema.Types.ObjectId,
          	ref: "RentalPost"
          },
          // TBD...
          // 1: middlemen
          //
          // 2: landlord
          state: Number
        }
      }
  	],


    // list of user engaged in chatting regarding this posting
    shared_user_group: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String,
        profile_picture: String
      }
    ],

    list_of_group_chats: [
      // the user in the first entry will be the creator for this group chat
      {
        group_chat: 
        {
          channel_id: String,
          friend_list: [
            {
              username: String,
              profile_pictgure: String
            }
          ] 
        }
      }
    ],

    child_listings: [
      {
        listing_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LandlordRequest" // _3rdPartyListing or LandlordRequest
        },

        // do we need it at all?
        listing_type: String, // _3rdPartyListing or LandlordRequest, DB model name and used for populate.

        created_by: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
          },
          username: String
        },

        shared_user_group: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User"
            },
            username: String,
            profile_picture: String
          }
        ],

        list_of_group_chats: [
          {
            // the user in the first entry will be the creator for this group chat
            channel_id: String,
            friend_list: [
              {
                username: String,
                profile_pictgure: String
              }
            ] 
          }
        ]
      }
    ],

  	// rental location
  	location: {
  		street: String,
  		city: String,
  		state: String,
  		country: String,
  		zipcode: String
  	},
    coordinates: {
	    lat: Number,
      lng: Number
    },
  	// move in date
  	move_in_date: {
  		month: String,
  		date: Number,
  		year: String
  	},
  	// rental duration in months
  	rental_duration: Number,

    // maximum range from the desired location
  	maximum_range_in_miles: Number,

    // maximum possible rental per month in dollars.
  	rental_budget: Number,

  	rental_preferences: {
  		furnished: { type: String, default: 'off' },
      	kitchen: { type: String, default: 'off' },
  		parking: { type: String, default: 'off' },
  		laundry: { type: String, default: 'off' },
  		internet: { type: String, default: 'off' },
  		private_bathroom: { type: String, default: 'off' },
  		shared_living_room: { type: String, default: 'off' },
  		separate_access:{ type:  String , default: 'off' },
  		pet_allowed: { type: String, default: 'off' },
      	smoking_allowed: { type: String, default: 'off' },
  		easy_access_public_transport: { type: String, default: 'off' },
      	rent_whole_unit: { type: String, default: 'off' },
      	rental_unit_type: { type: String, default: 'Single House' },
      	num_of_rooms: { type: Number, default: 1 }
  	},

    // more inforamtion on the rental.
    rental_description: String,

    // want roomate?
    roommate_request: String,
    num_of_requested_roommates: { type: Number, default: 0},

    // already have roommates?
    group_rental: String,
    num_of_roommates: { type: Number, default: 0},

    phone: String,
    email: String,

    list_of_referring_friends: [
      {
        profile_picture: String,

        friend_id: {
            type: mongoose.Schema.Types.ObjectId,
              ref: "User"
          },

          friend_name: String,
      }]

});

module.exports = mongoose.model("TenantRequest", TenantRequestSchema);
