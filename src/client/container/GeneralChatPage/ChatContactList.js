import React, { Component, useState, useContext } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'

import ContactSummary from './ContactSummary';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';


// ISEO-TBD:
// It's currently based on friendsList.
// Let's get it from MessageContext instead.
function ChatContactList() {

	console.log("!!!!!!! Creating ChatContactList !!!!!");

	const {currentUser} = useContext(GlobalContext);
	const {switchChattingChannel, 
		   currChannelInfo, 
		   loadChattingDatabase, 
		   dmChannelContexts,
		   getContactList,
		   getDmChannelId} = useContext(MessageContext);

	// create initial state based on friendsList
	let initClickStates = [];

	let friendsList = getContactList();

	if(friendsList==null)
	{
		console.log("friendsList is not available yet.");
		return (
			<>
	    	</>
	    );
	}

	for(var i=0; i< friendsList.length; i++)
	{
		initClickStates.push((getDmChannelId(friendsList[i].username)==currChannelInfo.channelName)? 1: 0);
	}
	
	const [clickStates, setClickStates] = useState(initClickStates);

	function handleClickState(index) {

		console.log("handleClickState, index="+index);

		// update clickStates where the index is referring to
		let contactClickStates  = [...clickStates];

		// reset all others
		for(var i=0; i< contactClickStates.length; i++)
		{
			contactClickStates[i] = 0;
		}

		contactClickStates[index] = 1;

		setClickStates([...contactClickStates]);

		let channelInfo = {channelName: getDmChannelId(friendsList[index].username), 
                                      dm: {
                                            name: friendsList[index].username,
                                            distance: 1
                                          }};

		switchChattingChannel(channelInfo);
		loadChattingDatabase();
	}

	let contacts = [];

	for(var i = 0; i<friendsList.length; i++)
	{
		console.log("user name = " + friendsList[i].username);
		
		if(currentUser.username==friendsList[i].username)
			continue;
		
		// construct channel specific information
		// 1. any indication of new message
		// : It should have been kept in context? Upon database loading.
		//   Check the last read index and the total number of messages in channel DB.
		// 2. latest message
		//
		// <note> the channel_name will be different if it's a chatting about posting.
		// peer name won't be good enough if it's related with posting
		// what's the format of channel_id? 
		let channel_name = getDmChannelId(friendsList[i].username);


		if(dmChannelContexts[channel_name]==undefined)
		{
			console.log("channel_name= "+channel_name+" not defined yet");
		}
		else
		{
			let channelSummary = {flag_new_msg: dmChannelContexts[channel_name].flag_new_msg,
			                      timestamp:    dmChannelContexts[channel_name].datestamp,
				                  msg_summary:  dmChannelContexts[channel_name].msg_summary};

			contacts.push(<ContactSummary contactIndex={i} clickState={clickStates[i]} clickHandler={handleClickState} user={friendsList[i]} summary={channelSummary} />);
		}
	}

  	return (
	    <>
	    	{contacts}
	    </>
  	);
}

export default ChatContactList;