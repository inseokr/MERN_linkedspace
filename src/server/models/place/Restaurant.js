const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  listingType: { type: String, default: 'restaurant' },

  listingSource: { type: String, default: 'Yelp' },

  // external URL to the place
  listingUrl: String,

  // brief summary or title of place
  listingSummary: String,

  coverPhoto: {
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

  locationString: String,

  coordinates: {
    lat: Number,
    lng: Number
  },

  category: { type: String, default: 'Korean' },
  
  price: {type: String, default: '$'}

});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
