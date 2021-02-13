import React, { useEffect, useState, useContext } from 'react';
import './MessageStyle.css';

import PickChattingParty from './PickChattingParty';
import SimpleModal from '../Modal/SimpleModal';

import { MessageContext } from '../../contexts/MessageContext';
// import { GlobalContext } from '../../contexts/GlobalContext';
import { CurrentListingContext } from '../../contexts/CurrentListingContext';
/* eslint no-underscore-dangle: 0 */

function defaultClickHandler() {
  // alert("Default defaultClickHandler")
}

// ISEO-TBD: this page will be re-rendered....
// ChildListingsView seems to be reloaded again when the message editor is clicked again.
function MessageEditorIcon(props) {
  const [modalShow, setModalShow] = useState(false);
  const [overlappedComponents, setOverlappedComponets] = useState(null);
  const {
    postSelectedContactList,
    selectedChatList
  } = useContext(MessageContext);

  // const {currentUser} = useContext(GlobalContext);
  const { currentListing, currentChildIndex } = useContext(CurrentListingContext);

  // let modalFlag = false;
  const { clickHandler, callerType } = props;

  // provide cllick handler if any customization is needed.
  const onClickHandler = (clickHandler !== undefined) ? clickHandler : defaultClickHandler;

  // "general": general messaging without any listing associated
  // "listing_dashboard": message window in the listing dashboard
  // <note> Currently it's only for tenant listing.
  const messageEditorCallerType = callerType;

  // general type doesn't need _childListing.
  const _childListing = (messageEditorCallerType === 'listing_dashboard' && currentListing !== undefined)
    ? currentListing.child_listings[currentChildIndex]
    : [];

  try {
    if (messageEditorCallerType === 'listing_dashboard') {
      // console.log(`currentChildIndex=${currentChildIndex}`);
      if (currentListing.child_listings.length > 0
          && currentListing.child_listings[currentChildIndex] !== undefined) {
        console.log(`listing =${JSON.stringify(currentListing.child_listings[currentChildIndex].listing_id)}`);
      }
    }
  } catch (error) {
    console.log(`error=${error}`);
  }

  const showModal = () => {
    const tenantParentListingId = document.getElementById('tenantParentListing');

    if (tenantParentListingId !== null) {
      setOverlappedComponets(
        {
          id: tenantParentListingId,
          indexValue: tenantParentListingId.style.zIndex
        }
      );

      tenantParentListingId.style.zIndex = '0';
    }

    setModalShow(true);
  };

  const handleClose = async () => {
    setModalShow(false);

    if (overlappedComponents !== null && overlappedComponents.id !== null) {
      overlappedComponents.id.style.zIndex = overlappedComponents.indexValue;
    }

    if (selectedChatList !== undefined && selectedChatList.length >= 1) {
      postSelectedContactList().then(() => { });
      // need to make it sure that the selected chatting party is shown in the contact list.
      onClickHandler();
    }
  };

  const handleCancel = () => {
    setModalShow(false);
    if (overlappedComponents !== null && overlappedComponents.id !== null) {
      overlappedComponents.id.style.zIndex = overlappedComponents.indexValue;
    }
  };

  function messageEditorOnClick(evt) {
    evt.stopPropagation();
    showModal();
  }

  let userGroup = [];

  if (_childListing !== undefined) {
    // userGroup = _childListing.listing.shared_userGroup;
    userGroup = _childListing.shared_user_group;
  }

  useEffect(() => {
  }, [modalShow]);

  return (
    <div>
      <SimpleModal show={modalShow} handle1={handleClose} caption1="Start Conversation" handle2={handleCancel} caption2="Cancel" styles={{ width: '20%' }}>
        <PickChattingParty group={userGroup} modalShow={modalShow} />
      </SimpleModal>
      <div role="button" tabIndex={0} className="MessageEditIcon" onClick={messageEditorOnClick} onKeyDown={messageEditorOnClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          data-supported-dps="24x24"
          fill="currentColor"
          width="24"
          height="24"
          focusable="false"
        >
          <path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z" />
        </svg>
      </div>
    </div>
  );
}

export default MessageEditorIcon;
