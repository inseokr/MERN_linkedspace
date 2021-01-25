/* eslint-disable */
import React, { useContext } from 'react';
import shortid from 'shortid';
import '../../app.css';
import './GeneralChatMainPage.css';
import OnlineStatus from '../../components/Message/OnlineStatus';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';


// ISEO-TBD:
// currChanneInfo only includes DM channel information
// We may consider adding more information
// Group Chat should be considered
function ChatPartySummary(props) {
  const { currChannelInfo } = useContext(MessageContext);
  const { currentUser, getUserLoginStatus} = useContext(GlobalContext);
  const { collapseHandler, collapseState, contactListCollapeHandler, contactCollapseState } = props;

  function getSocialDistanceString(distance) {
    switch (distance) {
      case 1: return '1st';
      case 2: return '2nd';
      case 3: return '3rd';
      case 4: return '4th';
      default: return '';
    }
  }

  function getChatPartySummary() {
    const _chatPartySummary = [];

    if (currChannelInfo.members == undefined || currentUser === null) {
      return '';
    }

    let numberOfProcessedMember = 0;

    for (let i = 0; i < currChannelInfo.members.length; i++) {

      if (currentUser.username == currChannelInfo.members[i]) continue;


      _chatPartySummary.push(
        <React.Fragment key={shortid.generate()}>
          <div className="ChatPartyName">
            {(currChannelInfo !== undefined && currChannelInfo.members[i] !== undefined)
              ? currChannelInfo.members[i] : ''}
          </div>
          <div className="SocialDistance">
            {getSocialDistanceString(1)}
          </div>
          {(currChannelInfo !== undefined && currChannelInfo.members[i] !== undefined) ? <OnlineStatus loginStatus={getUserLoginStatus(currChannelInfo.members[i])}/> : ''}
        </React.Fragment>
      );

      if(++numberOfProcessedMember===1) break;

    }

    return _chatPartySummary;
  }

  console.warn(`collapseState=${collapseState}`);

  let collapseIcon = (collapseState==='false')? 
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" class="mercado-match" width="16" height="16" focusable="false">
        <path d="M1 5l7 4.61L15 5v2.39L8 12 1 7.39z"></path>
      </svg>
     :
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" class="mercado-match" width="16" height="16" focusable="false">
        <path d="M15 11L8 6.39 1 11V8.61L8 4l7 4.61z"></path>
      </svg>

  let contactListExpandIcon = (contactCollapseState==='true')? 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" class="mercado-match" width="16" height="16" focusable="false">
      <path d="M11 1L6.39 8 11 15H8.61L4 8l4.61-7z"></path>
    </svg>: 
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" class="mercado-match" width="16" height="16" focusable="false">
      <path d="M5 15l4.61-7L5 1h2.39L12 8l-4.61 7z"></path>
    </svg>

  return (
    <React.Fragment>
      <section onClick={contactListCollapeHandler} style={{marginRight: '10px'}}>
        {contactListExpandIcon}
      </section>
      { getChatPartySummary() }
      <section onClick={collapseHandler}>
        {collapseIcon}
      </section>
    </React.Fragment>
  );
}

export default ChatPartySummary;
