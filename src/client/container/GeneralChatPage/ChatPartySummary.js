import React, { useContext } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'
import OnlineStatus from "../../components/Message/OnlineStatus";
import {MessageContext} from "../../contexts/MessageContext";


// ISEO-TBD:
// currChanneInfo only includes DM channel information
// We may consider adding more information
// Group Chat should be considered
function ChatPartySummary() {

  let {currChannelInfo} = useContext(MessageContext);

  function getSocialDistanceString(distance) {
    switch(distance) {
      case 1: return "1st";
      case 2: return "2nd";
      case 3: return "3rd";
      case 4: return "4th";
      default: return "";
    }
  }


  function getChatPartySummary()
  {
    let _chatPartySummary = [];

    if(currChannelInfo.members==undefined)
    {
      return ""
    }

    for(let i=0; i<currChannelInfo.members.length;i++)
    {
      _chatPartySummary.push(
        <React.Fragment>
          <div className="ChatPartyName">
            {(currChannelInfo!==undefined&&currChannelInfo.members[i]!==undefined)? 
              currChannelInfo.members[i]: ""}
          </div>
          <div className="SocialDistance">
            {getSocialDistanceString(1)}
          </div>
          {(currChannelInfo!==undefined&&currChannelInfo.members[i]!==undefined)? <OnlineStatus />: ""}
        </React.Fragment>
        )
    }

    return _chatPartySummary;
  }


  return (
    <React.Fragment>
      { getChatPartySummary() }
    </React.Fragment>
  );
}

export default ChatPartySummary;
