const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  category: { type: String, default: 'Korean' },

  source: { type: String, default: 'Yelp' },

  // external URL to the place
  url: String,

  // brief summary or title of place
  summary: String,

  photo: {
    path: String,
    caption: String
  },

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
  }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
