import React, { Component } from 'react';

import MessageEditorIcon from '../../components/Message/MessageEditorIcon'
import '../../app.css';
import './GeneralChatMainPage.css'

function GeneralChatHeader() {

  return (
    <React.Fragment>
        <div className="MessageHeaderLabel"> Messaging </div>
        <MessageEditorIcon callerType="general"/>
    </React.Fragment>
  );
}

export default GeneralChatHeader;