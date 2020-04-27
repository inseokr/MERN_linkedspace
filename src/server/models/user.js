var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	firstname:       String,
	lastname:        String,
	username:        String,
	password:        String,
	email:           String,
	phone: 			 String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
	gender:          String,
	birthdate:       Date,

	profile_picture: String, // The path to the profile picture
	
	address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipcode: Number
    },

    chatting_channels: {
    	nextGroupChannelIndex: { type:  Number, default: 0 },
    	
    	dm_channels: 
    	[
	    	{
	    		id: {
	    			type: mongoose.Schema.Types.ObjectId,
	    			ref: "ChattingChannel"
	    		},
	    		name: String,
	    		lastReadIndex: { type: Number, default: 0 } 
	    	}
    	],

    	level_1_parents:
    	[
    		{
	    		id: {
	    			type: mongoose.Schema.Types.ObjectId,
	    			ref: "ChattingChannelLevel1Parent"
	    		},

	    		dm_channels: 
	    		[
		    		{
			    		id: {
			    			type: mongoose.Schema.Types.ObjectId,
			    			ref: "ChattingChannel"
			    		},
			    		name: String,
			    		lastReadIndex: { type: Number, default: 0 } 
		    		}
	    		],

	    		level_2_parents:
	    		[
		    		{
			    		id: {
			    			type: mongoose.Schema.Types.ObjectId,
			    			ref: "ChattingChannelLevel2Parent"
			    		},
			    		
		    			dm_channels:
			    		[
				    		{
					    		id: {
					    			type: mongoose.Schema.Types.ObjectId,
					    			ref: "ChattingChannel"
					    		},
					    		name: String,
					    		lastReadIndex: { type: Number, default: 0 } 
				    		}
			    		]
			    	}
		    	]
		    }
    	]
    },  

	direct_friends: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "User"
		    },
		    name: String,
		    username: String,
		    email: String,
		    profile_picture: String,
		}
	],

	incoming_friends_requests: [
		{
			id: {
			    type: mongoose.Schema.Types.ObjectId,
			     ref: "User"
			},
			name: String
		}
	],

	outgoing_friends_requests: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "User"
		     },
			name: String
		}
	],

	// listing created by myself
	tenant_listing: [ 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "TenantRequest"
		}
	],

	landlord_listing: [ 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "LandlordRequest"
		}
	],

	// listing from my friends
	incoming_tenant_listing: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "TenantRequest"
			},

			profile_picture: String,

			friend_id: {
					type: mongoose.Schema.Types.ObjectId,
		     		ref: "User"
		    },

		    friend_name: String,

  			received_date: {
  				month: String,
  				date: Number,
  				year: String
  			},
		}
	],

	// listing from my friends
	incoming_landlord_listing: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "TenantRequest"
			},

			cover_picture: String,

			friend_id: {
					type: mongoose.Schema.Types.ObjectId,
		     		ref: "User"
		    },

		    friend_name: String,

  			received_date: {
  				month: String,
  				date: Number,
  				year: String
  			},
		}
	],
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);