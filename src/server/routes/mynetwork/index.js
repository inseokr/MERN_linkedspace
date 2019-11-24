var express = require("express");
var User    = require("../../models/user");
var router  = express.Router();

var node = require("deasync");

node.loop = node.runLoopOnce;


async function getCurUser(req)
{
	return new Promise((resolve, reject) => {
		User.findById(req.user._id, function(err, curr_user){
			if(err)
			{
				console.log("err = " + err);
				reject("user doesn't exist");
			}
			else
			{
				resolve(curr_user);
			}
		});
	});

}


function getSummaryOfUser(user_id) {

	return new Promise(resolve => {
		User.findById(user_id, function(err, curr_user){
			var friend = 
			{
				profile_picture: "../public/user_resources/pictures/Chinh - Vy.jpg",
				name: curr_user.firstname+curr_user.lastname, 
				address: {city: "San Jose", state: "CA"},
				id: user_id
			}; 

			resolve(friend);
		});	

	});

}


function pushFriendReqstList(list, friend){
	return new Promise(resolve => {
		list.push(friend);
		resolve(list);
	});
}

function requestedAlready(curr_user, friend_id)
{
	let bFound = false;

	curr_user.outgoing_friends_requests.forEach(function(friend){
		if(friend.id.equals(friend_id)==true)
		{
			bFound = true;
			// ISEO: seriously??? function return twice??
			// I returned true from here, 
			// but it didn't break out from the function and it moved on to return outside of this for loop.
		} 
	});

	return bFound;
}

function isDirectFriend(curr_user, friend_id)
{
	let bFound = false;

	curr_user.direct_friends.forEach(function(friend){
		if(friend.id.equals(friend_id)==true)
		{
			bFound = true;
			// ISEO: seriously??? function return twice??
			// I returned true from here, 
			// but it didn't break out from the function and it moved on to return outside of this for loop.
		} 
	});

	return bFound;

}

async function buildRecommendedFriendsList(curr_user) {

	return new Promise(resolve => {

		User.find({}, function(error, users) {
			var recommended_friends_list = [];

			users.forEach(function(user){
				if((curr_user._id.equals(user._id)!=true) && 
				   (requestedAlready(curr_user, user._id)==false) &&
				   (isDirectFriend(curr_user, user._id)==false))
				{
					var friend = {profile_picture: "../public/user_resources/pictures/Chinh - Vy.jpg", 
					              name: user.firstname + user.lastname, 
					              address: {city: "San Jose", state: "CA"},
					              id: user._id};
					recommended_friends_list.push(friend);
				}
			});

			resolve(recommended_friends_list);
		});
	});
} 

function buildFriendsList(input_list) {

	return new Promise(async resolve => {

		var output_list = [];

		if(input_list.length==0)
		{
			resolve(output_list);
		}

		for(var friend_idx=0; friend_idx < input_list.length ;  friend_idx++)
		{
			const friend =  await getSummaryOfUser(input_list[friend_idx].id);
			const res    =  await pushFriendReqstList(output_list, friend);

			if((friend_idx+1)==input_list.length)
			{
				resolve(output_list);
			}			
		}

	});
}

function buildAsyncFriendList(input_list) {

	return new Promise(async resolve => {

		buildFriendsList(input_list).then((output_list) => {resolve(output_list)});

	});
} 


async function buildMyNetworkList(req) {

     return new Promise(async resolve => {

		var networkInfo = {};

		const curUser = await getCurUser(req);

		networkInfo.recommended_friends_list 	  = await buildRecommendedFriendsList(curUser);
		networkInfo.pending_friends_request_list  = await buildAsyncFriendList(curUser.outgoing_friends_requests);
		networkInfo.direct_friends_list           = await buildAsyncFriendList(curUser.direct_friends);

		buildAsyncFriendList(curUser.incoming_friends_requests).then((req_list) => 
		{
			networkInfo.number_of_friends = curUser.direct_friends.length;
			networkInfo.incoming_friends_request_list=req_list;
			resolve(networkInfo);
		});
	});
}

router.get("/", function(req, res){

	buildMyNetworkList(req).then((networkInfo) => {

		res.render("mynetwork/mynetwork_main", {network_info: networkInfo});

	});
});


router.post("/:friend_id/friend_request", function(req, res){

	User.findById(req.params.friend_id, function(err, user){

		if(err){
			console.log("No such user found");
		}
		else
		{
			User.findById(req.user._id, function(err, curr_user){
				// ISEO: I don't know why name is not saved to the database...
				var requestingFriend = {id: req.user._id, name: curr_user.firstname + curr_user.lastname};
				user.incoming_friends_requests.push(requestingFriend);
				user.save();

				var invitedFriend = {id: user._id, name: user.firstname + user.lastname};

				curr_user.outgoing_friends_requests.push(invitedFriend);
				curr_user.save();

				// Let's render with updated database...
				res.redirect("/mynetwork");
			});
		}
	});

});

router.post("/:friend_id/friend_accept", function(req, res){

	User.findById(req.params.friend_id, function(err, friend){

		if(err){
			console.log("No such user found");
		}
		else
		{
			User.findById(req.user._id, function(err, curr_user){
				var acceptingFriend = {id: req.user._id, name: curr_user.firstname + curr_user.lastname, email: curr_user.email};
				friend.direct_friends.push(acceptingFriend);


				User.update({
				    _id: req.params.friend_id
				}, {
				    $pull: 
				        {outgoing_friends_requests: {id: req.user._id}}
				    },
				    function (err, val) {
						friend.save();
				});
				
				var acceptedFriend = {id: friend._id, name: friend.firstname + friend.lastname, email: friend.email};

				curr_user.direct_friends.push(acceptedFriend);

				// ISEO-TBD:... can't believe but remove/pull only works with _id, not other fields.
				//result = curr_user.incoming_friends_requests.remove({_id: friendObjectToRemove._id});
				//result =curr_user.incoming_friends_requests.pull(friend._id);
		
				// This works but non-sense to me... why should I query again??
				User.update({
				    _id: req.user._id
				}, {
				    $pull: 
				        {incoming_friends_requests: {id: friend._id}}
				    },
				    function (err, val) {
						curr_user.save();
						// Let's render with updated database...
						res.redirect("/mynetwork");
				});
				
			});
		}
	});

});

router.get("/:filename", function(req, res){
	var fileName = req.params.filename;
 	console.log("received file name=" + fileName)
  	res.sendFile(path.join(__dirname, `../../../public/user_resources/pictures/${fileName}`));
});

module.exports = router;