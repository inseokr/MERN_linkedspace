var mongoose = require("mongoose");

var ChattingChannelSchema = new mongoose.Schema({
	
	channel_id: { type: String, unique: true, required: true},

	// 0: general channels, 1: Posting related channel
	// <note> 3rd party posting could used as well, 
	// and we may need to create different data model for that
	// <question1> When tenant's creating such 3rd party posting
	// There is no conversation in the beginning... how to present it?
	// It's something needing discussion. It's better that all the listings shown
	// in the same level.
	channel_type: { type: Number, default: 0 },
	
	channel_creator: {
		id: {
	     	type: mongoose.Schema.Types.ObjectId,
	     	ref: "User"
		},
		name: String
	}, 

	members: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "User"
		    },
		    name: String
		}
	],

	chat_history : [
		{
			writer: String,
			message: String,
			timestamp: Date
		}
	],

	// Posting channel specific data
	tenant_listing: [ 
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "TenantRequest"
		    },
		}
	],

	landlord_listing: [ 
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "LandlordRequest"
		    },
		}
	],

});

module.exports = mongoose.model("ChattingChannel", ChattingChannelSchema);