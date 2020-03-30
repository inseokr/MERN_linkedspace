import React, { Component, useState } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'

import ContactSummary from './ContactSummary';

function ChatContactList() {
	
	const [clickStates, setClickStates] = useState([1,0,0]);


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

  	return (
	    <>
	    	<ContactSummary contactIndex="0" clickState={clickStates[0]} clickHandler={handleClickState} />  
	    	<ContactSummary contactIndex="1" clickState={clickStates[1]} clickHandler={handleClickState}/>  
	    	<ContactSummary contactIndex="2" clickState={clickStates[2]} clickHandler={handleClickState}/>  
	    </>
  	);
}

export default ChatContactList;