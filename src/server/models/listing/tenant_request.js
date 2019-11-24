var mongoose = require("mongoose");

var TenantRequestSchema = new mongoose.Schema({
	  requester: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
  	},

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
          user_name: String,
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

  	// rental location
  	location: {
  		street: String,
  		city: String,
  		state: String,
  		country: String,
  		zipcode: Number
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

    // already have roomnates?2
    group_rental: String,
    num_of_roommates: { type: Number, default: 0},

    phone: String,
    email: String

});

module.exports = mongoose.model("TenantRequest", TenantRequestSchema);