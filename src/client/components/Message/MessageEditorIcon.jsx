import React, { Component, useEffect, useState, useContext } from 'react';
import './MessageStyle.css';

import PickChattingParty from './PickChattingParty';
import SimpleModal from '../Modal/SimpleModal';

import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';


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

    var modalFlag = false;

	let onClickHandler = clickHandler;

	// "generaL": general messaging without any listing associated
	// "parent": chatting associated a specific listing, either tenant or landlord
	// "child": child listing
	let messageEditorCallerType = props.callerType;
	// listingType: "_3rdparty", "internal"
	let _childListing = props.childListing;

	let showModal = () => {

		setModalShow(true);
	}

	let handleClose = () => {
		setModalShow(false);
		onClickHandler();
	}

	if(props.clickHandler!=undefined)
	{
		onClickHandler = props.clickHandler;
	}


	function messageEditorOnClick(evt)
	{

		evt.stopPropagation();

		// check if there is any chatting party for this message context
		// 1. need to know where this message editor located
		// case 1> parent
		// case 2> child
		if(messageEditorCallerType=="parent")
		{
			// We may just call onClickHandler for now.
			// <note> The only corner case will be when there is no friend at all?
			onClickHandler();

			setChattingContextType(1);

			if(props.parent_listing.shared_user_group.length<1 || 
			   ((props.parent_listing.shared_user_group.length==1)
			   	&& (currentUser.username==props.parent_listing.shared_user_group[0].username)
			   )
			  )
			{
				showModal();
			}
			else
			{
				onClickHandler();
			}
		}
		else if(messageEditorCallerType=="child")
		{
			setChattingContextType(2);

			// ISEO-TBD: dang...the following call will trigger the reload of MessageEditor
			// and all the state will be gone when it's reloaded??
			// need to know the type of listing
			if(_childListing.listingType=="_3rdparty")
			{
				setChildType(0);
				setChildIndex(props.index);

				// check the size of shared_user_group and launch modal to add chatting party
				if(_childListing.listing.shared_user_group.length<1 ||
					((_childListing.listing.shared_user_group.length==1) 
						&& (currentUser.username==_childListing.listing.shared_user_group[0].username)))
				{
					showModal();
				}
				else
				{
					onClickHandler();
				}
			}
			else
			{
				setChildType(1);
				onClickHandler();
			}
		}
		else
		{
			onClickHandler();
		}

	}


	let user_group = [];

	if(_childListing!=undefined)
	{
		user_group = _childListing.listing.shared_user_group;
	}


	useEffect(()=>{
		// DB will be loaded only after chattingContextType is updated properly
		//console.log("MessageEditorIcon: loadChattingDatabase");
		// ISEO-TBD: loadChattingDatabase is called multiple times
		//loadChattingDatabase();
	//}, [chattingContextType, modalShow]);
	}, [modalShow]);


	return (
	<>
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
	</>
	);
	}

	export default MessageEditorIcon;


