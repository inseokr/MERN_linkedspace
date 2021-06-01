const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  type: { type: String, default: 'social' },

  summary: { type: String, default: 'Social Gathering'},

  // 0. Initial State
  // 1. Planning Phase
  // 2. Closed
  state: Number,

  // Preferred Event place
  // <note> City will be the mandatory information
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

  // event date
  date: Date,

  // list of user engaged in chatting regarding this posting
  shared_user_group: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
  places: [
    {
      id: {
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
