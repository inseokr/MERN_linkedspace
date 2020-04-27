var mongoose = require("mongoose");

var ChattingChannelLevel1ParentSchema = new mongoose.Schema({
	
	channel_id: String,

	// 0: posting from tenant looking for house/room
	// 1: posting from landlord looking for tennant 
	channel_type: {type: Number, default: 0},

	channel_creator: {
		id: {
	     	type: mongoose.Schema.Types.ObjectId,
	     	ref: "User"
		},
		name: String
	}, 

	dm_channels: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "ChattingChannel"
		    },
		}
	],

	level2_channels: [
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
});

module.exports = mongoose.model("ChattingChannelLevel1Parent", ChattingChannelLevel1ParentSchema);