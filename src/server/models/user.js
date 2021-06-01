const mongoose = require('mongoose');
const randtoken = require('rand-token');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	username: String,
	password: String,
	email: String,
	phone: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	gender: String,
	birthdate: Date,

	expoPushToken: { type: String, default: null },

	loggedInTime: { type: Date, default: null },

	lastVistedListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'TenantRequest', default: null },

	profile_picture: String, // The path to the profile picture

	address: {
	street: String,
	city: String,
	state: String,
	country: String,
	zipcode: Number
	},

	chatting_channels: {
		nextGroupChannelIndex: { type: Number, default: 0 },

		dm_channels:
		[
			{
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'ChattingChannel'
				},
				name: { type: String },
				lastReadIndex: { type: Number, default: 0 }
			}
		],

		// Related to Tenant Dashboard
		tenant_dashboard_level_1:
		[
			{
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'ChattingChannelLevel1Parent'
				},

				dm_channels:
				[
					{
						id: {
							type: mongoose.Schema.Types.ObjectId,
							ref: 'ChattingChannel'
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
							ref: 'ChattingChannelLevel2Parent'
						},

						dm_channels:
						[
							{
								id: {
									type: mongoose.Schema.Types.ObjectId,
									ref: 'ChattingChannel'
								},
								name: String,
								lastReadIndex: { type: Number, default: 0 }
							}
						]
					}
				]
			}
		],

		// Related to landlord listing dashboard
		landlord_dashboard_level_1:
		[
			{
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'ChattingChannelLevel1Parent'
				},

				dm_channels:
				[
					{
						id: {
							type: mongoose.Schema.Types.ObjectId,
							ref: 'ChattingChannel'
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
							ref: 'ChattingChannelLevel2Parent'
						},

						dm_channels:
						[
							{
								id: {
									type: mongoose.Schema.Types.ObjectId,
									ref: 'ChattingChannel'
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
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
	],

	incoming_friends_requests: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
	],

	outgoing_friends_requests: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
	],

	// listing created by myself
	tenant_listing: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'TenantRequest'
	}
	],

	landlord_listing: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'LandlordRequest'
	}
	],

	_3rdparty_listing: [
	{
		type: mongoose.Schema.Types.ObjectId,
		ref: '_3rdPartyListing'
	}
	],

	// listing from my friends
	incoming_tenant_listing: [
	{
		id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'TenantRequest'
		},

		list_of_referring_friends: [
		{
			profile_picture: String,

			friend_id: {
			type: mongoose.Schema.Types.ObjectId,
						ref: 'User'
				},

				username: String,
		}],

			received_date: Date,

			status: { type: String, default: 'New' } // New, Read, Forwarded
	}
	],

	// listing from my friends
	incoming_landlord_listing: [
	{
		id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'LandlordRequest'
		},

		cover_picture: String,

		list_of_referring_friends: [
		{
			profile_picture: String,

			friend_id: {
			type: mongoose.Schema.Types.ObjectId,
						ref: 'User'
				},

				username: String,
		}],

			received_date: Date,

			status: { type: String, default: 'New' }// New, Read, Forwarded
	}
	],

	// Events created by the current user
	events: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event'
		}
	],

	// Event invitation from friends
	incoming_events: [
		{
			id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event'
			},
			received_date: Date,
			status: { type: String, default: 'New' } // New, Accepted, Rejected, Closed
		}
	],

	places: {
		restaurant: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Restaurant'
			}
		],
	}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
