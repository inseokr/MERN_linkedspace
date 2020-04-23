import React, { Component, useEffect, useContext } from 'react';
import '../../app.css';
import Home from '../HomePage/Home';
import Search from '../SearchPage/SearchPage';
import { MessageContext } from '../../contexts/MessageContext';

import GeneralChatHeader from './GeneralChatHeader';
import SearchMessageBox from './SearchMessageBox';
import ChatContactList from './ChatContactList';
import ChatPartySummary from './ChatPartySummary';
import ChattingWindow from './ChattingWindow';
import WriteChat from './WriteChat';

import './GeneralChatMainPage.css'


function GeneralChatMainPage() {

  const {loadChattingDatabase} = useContext(MessageContext);

  console.log("GeneralChatMainPage is being loaded");
  
  useEffect(() => {
    console.log("loading channel database");
    loadChattingDatabase();
  });

  return (
    <div className="GeneralChatMainWrapper bg-light">
        <div className="MessageLeftPanel">
            <div className="MessageHeader_ls" >
                <GeneralChatHeader />
            </div>
            <div className="SearchMessageBox">
                <SearchMessageBox />
            </div>
            <div className="MessageContactList">
                <ChatContactList />
            </div>
        </div>

        <div className="MessageRightPanel">
            <div className="SenderProfileSummary">
                <ChatPartySummary />
            </div>
            <div className="ChattingWindow">
                <ChattingWindow />
            </div>
            <div className="WriteMessageWindow">
                <WriteChat />
            </div>
        </div>
    </div>
  );
}

export default GeneralChatMainPage;
