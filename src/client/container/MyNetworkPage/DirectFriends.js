import React, {useContext, useEffect} from 'react' 
import './mynetwork_style.css'
import { GlobalContext } from '../../contexts/GlobalContext'


function DirectFriends()
{
	const {network_info} = useContext(GlobalContext);

	function getDirectFriends()
	{
		let friends = [];

		const profile_style = {
			maxWidth: "100%", 
			marginTop:"10px"
		}

        if(network_info==null) return friends;

		console.log("getDirectFriends length = " + network_info.direct_friends_list.length);

		for(var i = 0; i< network_info.direct_friends_list.length; i++)
		{
			friends.push(
				<div class="network_board">
					<div class="profile_picture">
						<img class="img-responsive center rounded-circle" style={profile_style} src={network_info.direct_friends_list[i].profile_picture}/>
					</div>
					<div class="friend_information">

						<span class="bold_fonts">{network_info.direct_friends_list[i].name}</span>
						<br/>
						<span class="normal_fonts">{network_info.direct_friends_list[i].address.city+","+network_info.direct_friends_list[i].address.state}</span>
					</div>

					<form role="form" action={"/mynetwork/"+network_info.direct_friends_list[i].id+"/friend_accept"} method="post">
						<div class="action">
							<button class="btn btn-info">Message</button>
						</div>
					</form>
				</div>
			);
		}

		return friends;
	}

	useEffect( () => {

	}, [network_info]);

	return (
		<div class="bottom-shadow" id="direct_friends">
			<span style={{textAlign: "center"}}><h3> Direct Friends </h3></span>
			<hr/>
			<div class="d-flex justify-content-between">
				{getDirectFriends()}
			</div>
			<hr/>
		</div>
	);
}

export default DirectFriends;