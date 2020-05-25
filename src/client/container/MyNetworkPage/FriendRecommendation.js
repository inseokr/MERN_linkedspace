import React, {useContext, useEffect} from 'react' 
import './mynetwork_style.css'
import { GlobalContext } from '../../contexts/GlobalContext'


function FriendRecommendation()
{
	const {network_info} = useContext(GlobalContext);

	const profile_style = {
		maxWidth: "100%", 
		marginTop: "10px"
	};

	function getRecommendedFriends()
	{
		let recommendedFriends = [];

		if(network_info==null) return recommendedFriends;

		console.log("getRecommendedFriends length = " + network_info.recommended_friends_list.length);

		for(var i = 0; i< network_info.recommended_friends_list.length; i++)
		{
			recommendedFriends.push(
				<div class="network_board">
					<div class="profile_picture">
						<img class="img-responsive center rounded-circle" style={profile_style} src={network_info.recommended_friends_list[i].profile_picture}/>
					</div>
					<div class="friend_information">
						<span class="bold_fonts">{network_info.recommended_friends_list[i].name}</span>
						<br />
						<span class="normal_fonts">{network_info.recommended_friends_list[i].address.city + "," + network_info.recommended_friends_list[i].address.state}</span>
					</div>

					<form role="form" action={"/mynetwork/"+network_info.recommended_friends_list[i].id+"/friend_request"} method="post">
						<div class="action">
							<button class="btn btn-info">Connect</button>
						</div>
					</form>
				</div>
			);
		}

		return recommendedFriends;
	}

	function getPendingFriendRequest()
	{
		let friendRequests = [];

		if(network_info==null) return friendRequests;

		console.log("getPendingFriendRequest length = " + network_info.pending_friends_request_list.length);

		for(var i = 0; i< network_info.pending_friends_request_list.length; i++)
		{
			friendRequests.push(
				<div class="network_board">
					<div class="profile_picture">
						<img class="img-responsive center rounded-circle" style={profile_style} src={network_info.pending_friends_request_list[i].profile_picture}/>
					</div>
					<div class="friend_information">
						<span class="bold_fonts">{network_info.pending_friends_request_list[i].name}</span>
						<br />
						<span class="normal_fonts">{network_info.pending_friends_request_list[i].address.city + "," + network_info.pending_friends_request_list[i].address.state}</span>
					</div>

					<form role="form" action={"/mynetwork/"+network_info.pending_friends_request_list[i].id+"/friend_request"} method="post">
						<div class="action">
							<button class="btn btn-info">Pending</button>
						</div>
					</form>
				</div>
			);
		}

		return friendRequests;
	}

	useEffect(()=>{}, [network_info]);

	return (
		<div>
			<div class="bottom-shadow">
				<span style={{textAlign:"center"}}><h3> Friends Recommendation </h3></span>
				<hr/>
				<div class="d-flex justify-content-between">
					{getRecommendedFriends()}
				</div>

				<hr/>
				<div class="d-flex justify-content-between">
					{getPendingFriendRequest()}
				</div>
			</div>
		</div>
	);
}

export default FriendRecommendation;