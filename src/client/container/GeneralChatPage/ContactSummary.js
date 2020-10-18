import React, {useContext} from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'
import { MessageContext }  from '../../contexts/MessageContext';

// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';

function ContactSummary(props) {

  const {setCurrentChatPartyPicture} = useContext(MessageContext);

  function handleClick(e) {
    e.preventDefault();
    props.clickHandler(props.contactIndex);
    setCurrentChatPartyPicture(props.user.profile_picture);
  }

  function getContactSummaryClassName() {
    console.log("getContactSummaryClassName: props = " + JSON.stringify(props));
    let listOfClass = (props.clickState===0? "ContactSummary": "ContactSummaryClicked");

    if(props.contactIndex==0)
    {
      setCurrentChatPartyPicture(props.user.profile_picture);
    }     

    listOfClass = (props.summary.flag_new_msg)? listOfClass + " NewMessageIndicator": listOfClass;
    return listOfClass;
  }

  return (
    <div className={getContactSummaryClassName()} onClick={handleClick}>
      <div className="ProfilePicture">
        <img className="center rounded-circle imgFitToGrid" src={props.user.profile_picture} alt="myFriend" />
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
