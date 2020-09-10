import React from 'react';

import MessageEditorIcon from '../../components/Message/MessageEditorIcon'
import '../../app.css';
import './GeneralChatMainPage.css'

function GeneralChatHeader(props) {

  let caller_type = (props.compact==="true")? "listing_dashboard": "general";

  return (
    <React.Fragment>
        <div className="MessageHeaderLabel"> Messaging </div>
        <MessageEditorIcon callerType={caller_type}/>
    </React.Fragment>
  );
}

export default GeneralChatHeader;
