var mongoose = require("mongoose");

var ChattingChannelLevel2ParentSchema = new mongoose.Schema({
	
	channel_id: String,

	// 0: posting about tenant
	// 1: posting about house/room
	// 2: posting about 3rd party, like craigslist 
	channel_type: {type: Number, default: 1},

	channel_creator: {
		id: {
	     	type: mongoose.Schema.Types.ObjectId,
	     	ref: "User"
		},
		name: String
	}, 

	channels: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "ChattingChannel"
		    },
		}
	],

    // channel_type: 0
	tenant_listing: [ 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "TenantRequest"
		}
	],

    // channel_type: 1
	landlord_listing: [ 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "LandlordRequest"
		}
	],

	// channel_type: 2
	// not defined yet.
});

module.exports = mongoose.model("ChattingChannelLevel2Parent", ChattingChannelLevel2ParentSchema);