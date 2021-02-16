/* eslint-disable */
import React, { useContext } from 'react';
import shortid from 'shortid';
import '../../app.css';
import './GeneralChatMainPage.css';
import {FILE_SERVER_URL} from '../../globalConstants';
import OnlineStatus from '../../components/Message/OnlineStatus';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';


// ISEO-TBD:
// currChanneInfo only includes DM channel information
// We may consider adding more information
// Group Chat should be considered
function ChatPartySummary(props) {
  const { currChannelInfo, getProfilePictureByChattingType } = useContext(MessageContext);
  const { currentUser, getUserLoginStatus} = useContext(GlobalContext);
  const { compact, collapseHandler, collapseState, contactListCollapeHandler, contactCollapseState } = props;

  function getChatPartySummary() {
    const _chatPartySummary = [];
    const listOfPictures = [];

    if (currChannelInfo.members == undefined || currentUser === null) {
      return '';
    }

    let numberOfProcessedMember = 0;

    let onlineStatus = '';

    for (let i = 0; i < currChannelInfo.members.length; i++) {

      if (currentUser.username == currChannelInfo.members[i]) continue;

      let additional_style = 
        (getUserLoginStatus(currChannelInfo.members[i])===true)? 
          {
            position: 'relative',
            width: '25px',
            borderColor: 'green',
            borderStyle: 'solid'
          } : 
          {
            position: 'relative',
            width: '25px'
          }

      let onlineStatusStyle = { marginTop: '-20px', marginLeft: '32px' };

      onlineStatus = (currChannelInfo !== undefined && currChannelInfo.members[i] !== undefined) ? 
        <OnlineStatus loginStatus={getUserLoginStatus(currChannelInfo.members[i])} additionalStyle={onlineStatusStyle} /> : '';

      listOfPictures.push(
        <React.Fragment key={shortid.generate()}>
            <img key={shortid.generate()} 
                className="center rounded-circle" 
                style={additional_style} 
                src={FILE_SERVER_URL+getProfilePictureByChattingType(currChannelInfo.members[i])} 
                alt="myFriend" />
        </React.Fragment>
      );
    }

    // it's redundant information. let's remove it for now.
    /*if(currChannelInfo.members.length<=2)
    {
      listOfPictures.push(<React.Fragment>{onlineStatus}</React.Fragment>);
    }*/

    return listOfPictures;
  }

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
      {(compact==='true') &&
      <section onClick={contactListCollapeHandler} style={{marginRight: '10px'}}>
        {contactListExpandIcon}
      </section>}
      <section>
        { getChatPartySummary() }
      </section>
      {(compact==='true') &&
      <section onClick={collapseHandler} style={{position: 'absolute', right: '0'}}>
        {collapseIcon}
      </section>}
    </React.Fragment>
  );
}

export default ChatPartySummary;
