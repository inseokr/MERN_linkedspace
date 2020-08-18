import React, { Component, useEffect, useContext } from 'react';
import '../../app.css';
import Home from '../HomePage/Home';
import Search from '../SearchPage/SearchPage';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';

import GeneralChatHeader from './GeneralChatHeader';
import SearchMessageBox from './SearchMessageBox';
import ChatContactList from './ChatContactList';
import ChatPartySummary from './ChatPartySummary';
import ChattingWindow from './ChattingWindow';
import WriteChat from './WriteChat';

import './GeneralChatMainPage.css'


function GeneralChatMainPage (props)
{
    const {chattingContextType, reset} = useContext(MessageContext);

    if(props.compact == "true" && chattingContextType==0)
    {
      console.log("ISEO: need to re-initialize the context: compact mode");
      //this.context.setChattingContextType(1);
    }
    else if(props.compact == "false" && chattingContextType!=0)
    {
      // ISEO-TBD: switching to "2" will be possible only within the dashboard??
      console.log("ISEO: need to re-initialize the context: full mode");
      reset(0);
    }


    let leftPanelColumn  = (props.compact == "true") ? '1/4': '4/6';
    let rightPanelColumn = (props.compact == "true") ? '4/13': '6/10';

    return (
      <div className="GeneralChatMainWrapper bg-light" 
        style={{'--leftPanelColumn': leftPanelColumn, '--rightPanelColumn': rightPanelColumn}}>
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
