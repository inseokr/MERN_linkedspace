import React, { Component, useState, useContext } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'

import ContactSummary from './ContactSummary';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

function ChatContactList() {

	console.log("ChatContactList");
	const {friendsList, getDmChannelId} = useContext(GlobalContext);
	const {switchChattingChannel, loadChattingDatabase} = useContext(MessageContext);

	// create initial state based on friendsList
	let initClickStates = [];

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
		contacts.push(<ContactSummary contactIndex={i} clickState={clickStates[i]} clickHandler={handleClickState} user={friendsList[i]}/>);
	}

  	return (
	    <>
	    	{contacts}
	    </>
  	);
}

export default ChatContactList;