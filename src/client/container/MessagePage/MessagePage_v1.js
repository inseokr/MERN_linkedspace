import React, { Component } from 'react';
import '../../app.css';
import Home from '../HomePage/Home';
import Dashboard from '../DashboardPage/Dashboard';
import Map from '../MapPage/index';
import Search from '../SearchPage/SearchPage';
import MessageHeader from './MessageHeader';
import MessageSummaryPanel from './MessageSummaryPanel';
import './MessagePage_v1.css'

function MessagePage_LinkedIn() {

  return (
    <div className="LinkedInWrapper">
    	<div className="MessageHeader_ls" >
    		Messaging header
    	</div>
    	<div className="SearchMessageBox">
    		Search box
    	</div>
    	<div className="MessageContactList">
    		Message Contact List
    	</div>
    	<div className="SenderProfileSummary">
    		Sender Profile Summary
    	</div>
    	<div className="ChattingWindow">
    		Chatting Window
    	</div>
    	<div className="WriteMessageWindow">
    		Write a message...
    	</div>
    </div>
  );
}

export default MessagePage_LinkedIn;
