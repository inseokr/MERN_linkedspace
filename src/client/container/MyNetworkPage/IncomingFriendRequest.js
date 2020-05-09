import React, {useContext, useEffect} from 'react' 
import './mynetwork_style.css'
import { GlobalContext } from '../../contexts/GlobalContext'


function IncomingFriendRequest()
{
	const {network_info} = useContext(GlobalContext);
	
	function getIncomingFriendRequest()
	{
		let friendRequests = [];

		let profile_style = {
			maxWidth: "100%",
			marginTop:"10px"
		};

		if(network_info==null) return friendRequests;

		console.log("getIncomingFriendRequest length = " + network_info.incoming_friends_request_list.length);

		for(var i = 0; i< network_info.incoming_friends_request_list.length; i++)
		{
			friendRequests.push(
				<div class="network_board">
					<div class="profile_picture">
						<img class="img-responsive center rounded-circle" style={profile_style} src={network_info.incoming_friends_request_list[i].profile_picture}/>
					</div>
					<div class="friend_information">
						<span class="bold_fonts">{network_info.incoming_friends_request_list[i].name}</span>
						<br />
						<span class="normal_fonts">{network_info.incoming_friends_request_list[i].address.city}+","+{network_info.incoming_friends_request_list[i].address.state}</span>
					</div>

					<form role="form" action={"/mynetwork/"+network_info.incoming_friends_request_list[i].id+"/friend_accept"} method="post">
						<div class="action">
							<button class="btn btn-info">Accept</button>
						</div>
					</form>
				</div>
			);
		}

		return friendRequests;
	}

	useEffect (()=> {

	}, [network_info]);

	return (
		<div class="bottom-shadow">
			<span style={{textAlign:"center"}}><h3> Incoming Friend Requests </h3></span>
			<hr />
			<div class="d-flex justify-content-between">
				{getIncomingFriendRequest()}
			</div>
			<hr />
		</div>
	);
}

export default IncomingFriendRequest;