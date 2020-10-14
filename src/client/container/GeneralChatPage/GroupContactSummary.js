import React, {useContext} from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'
import { MessageContext }  from '../../contexts/MessageContext';

// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';

function GroupContactSummary(props) {

  const {setCurrentChatPartyPicture} = useContext(MessageContext);

  function handleClick(e) {
    e.preventDefault();
    props.clickHandler(props.contactIndex);
    setCurrentChatPartyPicture(props.user.profile_picture);
  }

  function getContactSummaryClassName() {
    let listOfClass = (props.clickState===0? "GroupContactSummary": "GroupContactSummaryClicked");

    if(props.contactIndex==0)
    {
      setCurrentChatPartyPicture(props.user.profile_picture);
    }     

    listOfClass = (props.summary.flag_new_msg)? listOfClass + " NewMessageIndicator": listOfClass;
    return listOfClass;
  }

  let stringOfFriendList = "";

  for(let i=0; i<props.user.length; i++)
  {
    let friendSeparator = (i==0)? "": " ";

    stringOfFriendList = stringOfFriendList + friendSeparator + props.user[i].username;
  } 

  return (
    <div className={getContactSummaryClassName()} onClick={handleClick}>
      <div className="ContactName">
        {stringOfFriendList}
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

export default GroupContactSummary;
