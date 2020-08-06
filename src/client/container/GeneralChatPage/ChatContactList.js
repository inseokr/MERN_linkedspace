import React, { Component, useState, useContext , useEffect} from 'react';
import shortid from 'shortid';
import '../../app.css';
import './GeneralChatMainPage.css'

import ContactSummary from './ContactSummary';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';


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


	function  removeCurrentUserFromList(_list)
	{
		if(_list==null) return null;
		
		var filtered = _list.filter(function (_item) { return _item.username!=currentUser.username;});
		return filtered;
	}

	let friendsList = removeCurrentUserFromList(getContactList());

	if(friendsList==null)
	{
		console.log("friendsList is not available yet.");
		return (
			<div>
	    	</div>
	    );
	}

    var bFoundDefaultContact = false;

	// ISEO-TBD:
	console.log("friendsList.length = " + friendsList.length);

	for(var i=0; i< friendsList.length; i++)
	{
		if(friendsList[i].username==currentUser.username)
		{
			console.log("Skipping it");
		}
		else
		{
			console.log("ChatContactList: currChannelInfo.channelName = " + currChannelInfo.channelName);
			console.log("getDmChannelId = " + getDmChannelId(friendsList[i].username));

			if(getDmChannelId(friendsList[i].username)==currChannelInfo.channelName)
			{
				console.log("found default contact!!!");

				bFoundDefaultContact = true;
				initClickStates.push(1);
			}
			else
			{
				initClickStates.push(0);
			}
		}
	}
	
	const [clickStates, setClickStates] = useState(initClickStates);

	async function handleClickState(index) {

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

        // We need to make it sure that loadChattingDatabase should be called in sequence.
		switchChattingChannel(channelInfo, true); // second parameter tells if loadChattingDatabase is needed
		//loadChattingDatabase();
	}


	function buildContacts()
	{

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
				console.log("channel_name= "+channel_name+" being added");

				//ISEO-TBD: it's very annoying.... I have to add key information to each item here??
				contacts.push(<div key={shortid.generate()}>
								<ContactSummary contactIndex={i} clickState={clickStates[i]} clickHandler={handleClickState} user={friendsList[i]} summary={channelSummary} />
							  </div>);
			}
		}

		return contacts;
	}

	function clickDefaultContact()
	{
		if(bFoundDefaultContact==false && friendsList.length>=1)
		{
			bFoundDefaultContact = true;
			handleClickState(0);
		}
	}

	useEffect(()=> {

		// ISEO: dmChannelContexts are being updated by loadChatHistory but somehoe ChatContactList is not being reloaded even if dmChannelContexts are being updated....WHY!!
		console.log("ChatContactList:dmChannelContexts being updated with channel name = " + currChannelInfo.channelName);

		clickDefaultContact();
	},[dmChannelContexts]);

	
	//ISEO-TBD: this may lead to infinite rendering
    //clickDefaultContact();

  	return (
	    <div>
	    	{buildContacts()}
	    </div>
  	);
}

export default ChatContactList;