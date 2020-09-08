import React, { Component, useEffect, useState, useContext } from 'react';
import './MessageStyle.css';

import PickChattingParty from './PickChattingParty';
import SimpleModal from '../Modal/SimpleModal';

import { MessageContext, MSG_CHANNEL_TYPE_GENERAL, MSG_CHANNEL_TYPE_LISTING_PARENT, MSG_CHANNEL_TYPE_LISTING_CHILD } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';

function clickHandler()
{
	alert("Default clickHandler")
}

// ISEO-TBD: this page will be re-rendered....
// ChildListingsView seems to be reloaded again when the message editor is clicked again.
function MessageEditorIcon(props) {

	const [modalShow, setModalShow] = useState(false);
	const {setChattingContextType,
		   setChildType, 		    childType,
		   setChildIndex,           childIndex,
		   loadChattingDatabase}    = useContext(MessageContext);
    const {currentUser} 		    = useContext(GlobalContext);
    const {currentListing, currentChildIndex} = useContext(CurrentListingContext);

    var modalFlag = false;

    // provide cllick handler if any customization is needed.
	let onClickHandler = (props.clickHandler!=undefined)? props.clickHandler : clickHandler;

	// "general": general messaging without any listing associated
	// "listing_dashboard": message window in the listing dashboard
	// <note> Currently it's only for tenant listing.
	let messageEditorCallerType = props.callerType;

	// general type doesn't need _childListing.
	let _childListing = (messageEditorCallerType=="listing_dashboard")?
						 currentListing.child_listings[currentChildIndex]:
					     [];

	if(messageEditorCallerType=="listing_dashboard")
	{
		console.log("currentChildIndex=" + currentChildIndex);
		if(currentListing.child_listings.length>0 && currentListing.child_listings[currentChildIndex]!=undefined)
		{
			console.log("listing =" + JSON.stringify(currentListing.child_listings[currentChildIndex].listing_id));
		}
	}

	let showModal = () => {
		setModalShow(true);
	}

	let handleClose = () => {
		setModalShow(false);
		// need to make it sure that the selected chatting party is shown in the contact list.
		onClickHandler();
	}

	function messageEditorOnClick(evt)
	{
		evt.stopPropagation();
		showModal();
	}

	let user_group = [];

	if(_childListing!=undefined)
	{
		//user_group = _childListing.listing.shared_user_group;
		user_group = _childListing.shared_user_group;
	}

	useEffect(()=>{
		// DB will be loaded only after chattingContextType is updated properly
		//console.log("MessageEditorIcon: loadChattingDatabase");
		// ISEO-TBD: loadChattingDatabase is called multiple times
		//loadChattingDatabase();
	//}, [chattingContextType, modalShow]);
	}, [modalShow]);

	return (
	<div>
		<SimpleModal show={modalShow} handleClose={handleClose} captionCloseButton="Start Conversation" _width="20%">
			<PickChattingParty group={user_group}/>
		</SimpleModal>
		<div className="MessageEditIcon" onClick={messageEditorOnClick}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor"
			width="24" height="24" focusable="false">
				<path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z">
				</path>
			</svg>
		</div>
	</div>
	);
	}

	export default MessageEditorIcon;


