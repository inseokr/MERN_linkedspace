/* eslint-disable */
import React, { useContext, useRef, useState, useEffect } from 'react';
import '../../app.css';
import { FILE_SERVER_URL } from '../../globalConstants';
import './GeneralChatMainPage.css';
import { MessageContext } from '../../contexts/MessageContext';

// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';

function ContactSummary(props) {
  const { setCurrentChatPartyPicture, currChannelInfo, checkIfAnyNewMessage } = useContext(MessageContext);
  const [currentClickState, setCurrentClickState] = useState(false);

  const contactRef = useRef(null);

  // let's use scrollIntoView only if it's clicked by a new message.
  useEffect(() => {
    if(contactRef.current)
    {
      if(currentClickState!=props.clickState)
      {
        //contactRef.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest'});
        if(checkIfAnyNewMessage(currChannelInfo.channelName)===true) {
          contactRef.current.scrollIntoView();
        }
        setCurrentClickState(props.clickState);
      }
    }
  }, [props.clickState]);

  function handleClick(e) {
    e.preventDefault();
    props.clickHandler(props.contactIndex);
    setCurrentChatPartyPicture(props.user.profile_picture);
  }

  function getContactSummaryClassName() {
    //console.log(`getContactSummaryClassName: props = ${JSON.stringify(props)}`);
    let listOfClass = (props.clickState === 0 ? 'ContactSummary' : 'ContactSummaryClicked');

    listOfClass = (props.summary.flag_new_msg) ? `${listOfClass} NewMessageIndicator` : listOfClass;
    return listOfClass;
  }


  //console.warn("ContactSummary: summary = " + props.summary.msg_summary);

  return (
    <div className={getContactSummaryClassName()} ref={contactRef} onClick={handleClick}>
      <div className="ProfilePicture">
        <img className="center rounded-circle imgFitToGrid" src={FILE_SERVER_URL+props.user.profile_picture} alt="myFriend" />
      </div>
      <div className="ContactName">
        {props.user.username}
      </div>
      <div className="ChatTimeStamp">
        {props.summary.timestamp}
      </div>
      <div className="ChatSummary">
        {props.summary.msg_summary}
      </div>
    </div>
  );
}

export default ContactSummary;
