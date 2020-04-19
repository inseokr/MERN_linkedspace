var mongoose = require("mongoose");

// Do we need to create a separate schema for the array of channels?
// I don't see much need yet.
// 0: general channels, 2: Posting related Channel
// user scenario to create posting channel
// 1. tenant post tenant request to find home or room
//    1.1 tenant create channel on it.
//        There could be many different conversations going on.
//        How to organize all those conversation per listing?
//        It sounds like it may need kind of hiearch or level.2
//        Root channel(tenant listing)
//        Group Channels, DM Channels, 3rd party posting 
//        <note1> each DM could turn into group channel if needed. 
//        <note2> chatting history could be shared or not shared.
//        <note3> private group channel may share the history.
//		  <note4> 3rd party posting could be created by anyone.
// 
//    1.2 middlemen create channel on it.
//        It gets new posting notifiction, and create a channel to communicate on that posting.
//        Sometimes he or she will forward the posting, and initiate another discussion with other middlemen or landlord.
//        <note1> Like tenant, those channels will be organized under the same posting.
//        <note2> tenant may not have an access those those channels unless middlement creates group channel on it.
//        <note3> the list of people in between will be shown as potential participants.
//
//    1.3 house owner create channel on it?
//        landlord receives the request, and start conversation through all different channels.
//        <question1> Now the landlord decided to create a landlord listing... then what happens?
//                    Do we need to create another channel under this posting?
//                    Probably we don't need to in this case? 
//                    From tenant perspective, the channel with landlord should be managed different I think.
//                    The channel headline may include the link to the landlord's listing if created.
//                    From landlord perspective, it will be still under the tenant's request, nothing much changed.
//                    Not the channel headline will include both tenant/landlord listings.

// Question1> How we will present the list of channels?
// 1. general channels no issue, and it's very clear.
// 2. how about posting related?
// 2.1 tenant case
// : It should have the list of channels under a specific posting he created. 
//   + preliminary discussions
//   + discussion on a specific posting
//     : there could be more channels and it should be under this specific posting
//   + discussion on a 3rd party posting
//     : Same thing and there could be more channels
// 2.2 middlemen case
//   + just preliminary discussions
//   + discussion on a specific posting
//     : it could be something he created or from landlord
//     <note> Tenant case there could be multiple channels related to that 3rd party posting.
//     But it will be just one channel if it's the 3rd party posting he found?
//     Let's simplify it...middlemen will have just one channel in this case.
// 2.3 landlord case
//    + just preliminary discussions
//    + discussion on a specific posting
//      : There could be many channels in this case 
// 
// Question2> Channel will have the complete information? probably not... it's better that it has the hierachy?
// I think it's the best that the hierachy information is kept in user DB level as well.
// So it should have...
// 1. list of general channels
// 2. list of nested channels
//    : Keep the reference to the nested channels
//      Probably we could keep the channel inside as well.
//      We need a posting information and creator.
// <note> main DB may have a different view as individual user due to visibility. 
// Anyhow main DB should keep all the channels under the specific posting created or posed by a specific user.
// And each user may have subset of view.
// It's a bit complicated... but I guess I kind of sorted it out now.
//
// Main DB will have the following structures
// + 1st level channel created by either tenant or landlord
// + It will include DMs and another nested channels
// + the parent of neste channel may have some header information and channels
// Root channel(posting information + creator and other information)
// 		array of DMs or group channels
// 		parent channel(posting information, 3rd party, or from landlord)
//  		array of DMs or group channels
// 
// This schema may not be necessary.
var ChattingDBSchema = new mongoose.Schema({

	DMChannels: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "ChattingChannel"
		    },
		}
	],

	Level1ParentChannels: [
		{
			id: {
		     	type: mongoose.Schema.Types.ObjectId,
		     	ref: "ChattingChannelLevel1Parent"
		    },
		}
	]
});

module.exports = mongoose.model("ChattingDB", ChattingDBSchema);