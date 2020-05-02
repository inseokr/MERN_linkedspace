import React, { Component, useEffect, useContext } from 'react';
import '../../app.css';
import Home from '../HomePage/Home';
import Search from '../SearchPage/SearchPage';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';

import GeneralChatHeader from './GeneralChatHeader';
import SearchMessageBox from './SearchMessageBox';
import ChatContactList from './ChatContactList';
import ChatPartySummary from './ChatPartySummary';
import ChattingWindow from './ChattingWindow';
import WriteChat from './WriteChat';

import './GeneralChatMainPage.css'


export default class GeneralChatMainPage extends Component {
  
  static contextType = MessageContext;

  constructor(props){
    super(props);
  }

  componentDidMount() {
    console.log("GeneralChatMainPage is being loaded");
    //this.context.loadChattingDatabase();
    this.context.setChatMainPageLoaded(true);
  }

  componentWillMount() {
    console.log("GeneralChatMainPage WillMount called");
  }

  render() {
    
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
}
