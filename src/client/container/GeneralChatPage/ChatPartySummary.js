import React, { Component } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'
import OnlineStatus from "./OnlineStatus";

function ChatPartySummary() {

  return (
    <>
        <div className="ChatPartyName">
        	Chinh Le
        </div>
        <div className="SocialDistance">
        	1st
        </div>
        <OnlineStatus />
    </>
  );
}

export default ChatPartySummary;