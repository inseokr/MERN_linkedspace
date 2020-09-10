import React from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'
// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';

function ContactSummary(props) {

  function handleClick(e) {
    e.preventDefault();
    props.clickHandler(props.contactIndex);
  }

  function getContactSummaryClassName() {
    let listOfClass = (props.clickState===0? "ContactSummary": "ContactSummaryClicked");

    listOfClass = (props.summary.flag_new_msg)? listOfClass + " NewMessageIndicator": listOfClass;

    return listOfClass;
  }

  return (
    <div className={getContactSummaryClassName()} onClick={handleClick}>
      <div className="ProfilePicture">
        <img className="center rounded-circle imgFitToGrid" src={props.user.profile_picture} alt="myFriend" />
      </div>
      <div className="ProfileName">
        {props.user.username}
      </div>
      <div className="TimeStamp">
        {props.summary.timestamp}
      </div>
      <div className="MessageSummary">
        {props.summary.msg_summary}
      </div>
    </div>
  );
}

export default ContactSummary;
