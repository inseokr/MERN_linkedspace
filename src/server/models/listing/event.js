const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  listingType: { type: String, default: 'event' },

  type: { type: String, default: 'social' },

  summary: { type: String, default: 'Social Gathering'},

  note: { type:String, default: ''},

  // 0. Initial State
  // 1. Planning Phase
  // 2. Closed
  state: Number,

  // Preferred Event place
  // <note> City will be the mandatory information
  location: {
    street: String,
    city: { type: String, default: 'San Jose'},
    state: { type: String, default: 'CA'},
    country: String,
    zipcode: String
  },

  coordinates: {
    lat: Number,
    lng: Number
  },

  // event date
  date: Date,

  // list of user shared with this event
  shared_user_group: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  attendanceList: [
    {
      type: String
    }
  ],

 
  list_of_group_chats: [
    // the user in the first entry will be the creator for this group chat
    {
      channel_id: String,
      friend_list: [
        {
          username: String,
          profile_picture: String
        }
      ]
    }
  ],

  // list of places(restaurants) for the event
  child_listings: [
    {
      hide: { type: Boolean, default: false},
      note: { type:String, default: ''},
      listing_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant' // _3rdPartyListing or LandlordRequest
      },

      created_by: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        username: String
      },

      shared_user_group: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],

      listOfLikedUser: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],


      listOfDislikedUser: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ],


      list_of_group_chats: [
        {
          // the user in the first entry will be the creator for this group chat
          channel_id: String,
          friend_list: [
            {
              username: String,
              profile_picture: String
            }
          ]
        }
      ]
    }
  ],

});

module.exports = mongoose.model('Event', EventSchema);
