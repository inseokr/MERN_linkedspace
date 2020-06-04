var mongoose = require("mongoose");

var _3rdPartyListingSchema = new mongoose.Schema({
    
    requester: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
    },	  

    // 3rd party ID
    listingSource: {type: String, default: "craigslist"},

    // external URL to the listing
    listingUrl: String,

    // rental summary
    listingSummary: String,

    // rental price
    rentalPrice: Number,
    
    coverPhoto: {
      path: String,
      caption: String
    }
});

module.exports = mongoose.model("_3rdPartyListing", _3rdPartyListingSchema);
