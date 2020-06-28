import React, { Component, useContext } from 'react';
import '../../app.css';
import './MessageStyle.css';
import OnlineStatus from './OnlineStatus';
import {GlobalContext} from '../../contexts/GlobalContext';
import {MessageContext} from '../../contexts/MessageContext';

function PickChattingParty(props) {

	let _group = props.group;
	let _listingId = props.listing_id;

	const {friendsList, currentUser} = useContext(GlobalContext);
	const {loadChattingDatabase, addContactList} = useContext(MessageContext);
	let Header =
	<div className="boldHeader">
	  <h4> New message </h4>
	  <hr/>
	</div>;

	function handleClickFriend(_friend)
	{
		// ISEO-TBD:
		// update chatting context with selected friends
		// selected friend will be added to shared_user_group
		// <problem1> how to find a specific _3rd_party_listings?
		// child_listings._3rd_party_listings.push(_3rdparty_listing);
		// ==> It needs parent listing ID and the ID to find _3rd_party_listings
		// ==> I guess it's better to be handled inside MessageContext
		// ==> parent componet should update the current active listing information
		// ==> and current friend will be added through a callback or handler defined in
		// ==> MessageContext.
		addContactList(_friend);
		
		loadChattingDatabase();
	}

	function getFriend(_friend)
	{
		return (
			<>
			<div className="friendWrapper" onClick={() => handleClickFriend(_friend)}>
				<div>
		    		<img className="center rounded-circle imgCover" src={_friend.profile_picture} alt="myFriend" />
		    	</div>
		    	<div className="friendName">
		    		<h5> {_friend.username} </h5>
		    	</div>
		    	<div>
		    		<OnlineStatus marginLeft="auto"/>	
		    	</div>
			</div>
			<hr/>
			</>
			)
	}

	function checkGroup(name)
	{
		_group.forEach(user =>
		{
			if(user.username==name) 
			{
				return true;
			}
		})

		return false;
	}
	
	function getListOfFriends() {
	// go through the list of direct friends
	let friends = friendsList.map((friend=> {
	  // <note> need to skip friend in the shared_group
	  if((name !== currentUser.username) && !checkGroup(friend.username)) {
	    return getFriend(friend);
	  }
	}));

	return friends;
	}

	return (
		<div className="container">
		  {Header}
		  {getListOfFriends()}
		</div>
	);
}
export default PickChattingParty;
