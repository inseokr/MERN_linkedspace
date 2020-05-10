import React, {useContext, useEffect} from 'react'
import {Link} from 'react-router-dom' 
import './mynetwork_style.css'
import { GlobalContext } from '../../contexts/GlobalContext'
import { MessageContext } from '../../contexts/MessageContext'


function DirectFriends()
{
	const {network_info} = useContext(GlobalContext);
	const {switchDmByFriendName} = useContext(MessageContext);

	function handleClick(evt){
	    // param is the argument you passed to the function
	    // e is the event object that returned
		console.log("handleClick, index = " + evt.target.value);
		switchDmByFriendName(network_info.direct_friends_list[evt.target.value].username);
	};

	function getDirectFriends()
	{
		let friends = [];

		const profile_style = {
			maxWidth: "100%", 
			maxHeight: "100%",
			marginTop: "10px"
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

					<Link to="/Messages">
						<div class="action">
							<button class="btn btn-info" onClick={handleClick} value={i}>Message</button>
						</div>
					</Link>
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