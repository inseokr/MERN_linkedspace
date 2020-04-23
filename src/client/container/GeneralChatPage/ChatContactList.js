import React, { Component, useState, useContext } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'

import ContactSummary from './ContactSummary';
import { GlobalContext } from '../../contexts/GlobalContext';

function ChatContactList() {

	const {friendsList} = useContext(GlobalContext);

	// create initial state based on friendsList
	let initClickStates = [];

	for(var i=0; i< friendsList.length; i++)
	{
		initClickStates.push((i==0)?1: 0);
	}
	
	const [clickStates, setClickStates] = useState(initClickStates);


	function handleClickState(index) {
		// update clickStates where the index is referring to
		let contactClickStates  = [...clickStates];

		// reset all others
		for(var i=0; i< contactClickStates.length; i++)
		{
			contactClickStates[i] = 0;
		}

		contactClickStates[index] = 1;

		setClickStates([...contactClickStates]);
	}

	let contacts = [];

	for(var i = 0; i<friendsList.length; i++)
	{
		console.log("user name = " + friendsList[i].username);
		console.log("name = " + friendsList[i].name);
		contacts.push(<ContactSummary contactIndex="0" clickState={clickStates[i]} clickHandler={handleClickState} user={friendsList[i]}/>);
	}

  	return (
	    <>
	    	{contacts}
	    </>
  	);
}

export default ChatContactList;