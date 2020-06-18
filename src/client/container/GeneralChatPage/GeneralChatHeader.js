import React, { Component } from 'react';

import MessageEditorIcon from '../../components/Message/MessageEditorIcon'
import '../../app.css';
import './GeneralChatMainPage.css'

function GeneralChatHeader() {

  return (
    <>
        <div className="MessageHeaderLabel"> Messaging </div>
        <MessageEditorIcon callerType="general"/>
    </>
  );
}

export default GeneralChatHeader;