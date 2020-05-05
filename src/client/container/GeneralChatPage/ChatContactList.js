import React, { Component, useState, useContext } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'

import ContactSummary from './ContactSummary';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function ChatContactList() {

	console.log("ChatContactList");
	const {friendsList, getDmChannelId} = useContext(GlobalContext);
	const {switchChattingChannel, loadChattingDatabase, dmChannelContexts} = useContext(MessageContext);

	// create initial state based on friendsList
	let initClickStates = [];

	if(friendsList==undefined)
	{
		console.log("friendsList is not available yet.");
		return;
	}

	for(var i=0; i< friendsList.length; i++)
	{
		initClickStates.push((i==0)?1: 0);
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

		let channelInfo = {channelName: getDmChannelId(friendsList[index].username)};
		switchChattingChannel(channelInfo);
		loadChattingDatabase();
	}

	let contacts = [];

	for(var i = 0; i<friendsList.length; i++)
	{
		console.log("user name = " + friendsList[i].username);
		// construct channel specific information
		// 1. any indication of new message
		// : It should have been kept in context? Upon database loading.
		//   Check the last read index and the total number of messages in channel DB.
		// 2. latest message
		let channel_name = getDmChannelId(friendsList[i].username);

		let channelSummary = {flag_new_msg: dmChannelContexts[channel_name].flag_new_msg,
		                      timestamp:    dmChannelContexts[channel_name].datestamp,
			                  msg_summary:  dmChannelContexts[channel_name].msg_summary};

		contacts.push(<ContactSummary contactIndex={i} clickState={clickStates[i]} clickHandler={handleClickState} user={friendsList[i]} summary={channelSummary} />);
	}

  	return (
	    <>
	    	{contacts}
	    </>
  	);
}

export default ChatContactList;