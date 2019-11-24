var mongoose = require("mongoose");

var LandlordRequestSchema = new mongoose.Schema({
	  requester: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
  	},

    // 0. Initial State
    // 1. Being reviewed by middlemen or landlord
    // 2. Connected with at least with one tenant
    // 3. In the middle of negotiation
    // 4. Transaction completed 
    state: Number,

  	// list of tenants or middlemen helping this requests
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
          // TBD
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

    // rental house/room information
    rental_property_information: {
      room_type: String,
      unit_type: String,
      // rental location
      location: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipcode: Number
      },  
    },

    // bedroom information
    num_of_bedrooms: {type: Number, default: 0}, // TBD: should be Number instead?

    bedrooms: {
      type: Array,
      default: {
        num_of_guests_bedroom: '0',
        bedding_provided: false, 
        num_of_bathrooms: '0',

        num_of_single_bed_bedroom: '0',
        num_of_double_bed_bedroom: '0',
        num_of_queen_bed_bedroom: '0',
        num_of_sofa_bed_bedroom: '0',
        num_of_floor_mattress_bedroom: '0'
      }
    },

    amenities: {
      internet: { type: Boolean, default: false },
      closet: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      desk: { type: Boolean, default: false },
      smoke_detector: { type: Boolean, default: false },
      private_entrance: { type: Boolean, default: false },
      fire_extinguisher: { type: Boolean, default: false },
    }, 

    accessible_spaces: {
      living_room: { type: Boolean, default: false },
      pool: { type: Boolean, default: false },
      gym: { type: Boolean, default: false },
      kitchen: { type: Boolean, default: false },
      laundry: { type: Boolean, default: false },
      parking: { type: Boolean, default: false }
    },


    // index 0 wil be the cover photo.
    num_of_pictures_uploaded: {type: Number, default: 0},

    pictures: [
      { 
        path: String,
        caption: String
      }
    ],

  	summary_of_listing: String,

    summary_of_neighborhood: String,

    summary_of_transportation: String,

    rental_terms: {
      asking_price: String,
      security_deposit: String,
      duration: String // in months
    },


  	// available date
  	move_in_date: {
  		month: String,
  		date: Number,
  		year: String
  	},

    // contact information
    contact: {
      phone: String,
      email: String
  }

});

module.exports = mongoose.model("LandlordRequest", LandlordRequestSchema);