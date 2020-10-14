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


  return (
    <React.Fragment>
      <div className="ChatPartyName">
        {(currChannelInfo!==undefined&&currChannelInfo.dm!==undefined)? currChannelInfo.dm.name: ""}
      </div>
      <div className="SocialDistance">
        {(currChannelInfo!==undefined&&currChannelInfo.dm!==undefined)? getSocialDistanceString(currChannelInfo.dm.distance): ""}
      </div>
      {(currChannelInfo!==undefined&&currChannelInfo.dm!==undefined)? <OnlineStatus />: ""}
    </React.Fragment>
  );
}

export default ChatPartySummary;
