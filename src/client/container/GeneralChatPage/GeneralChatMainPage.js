/* eslint-disable */
import React, { Component } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';
import { MessageContext } from '../../contexts/MessageContext';

import GeneralChatHeader from './GeneralChatHeader';
import SearchMessageBox from './SearchMessageBox';
import ChatContactList from './ChatContactList';
import ChatPartySummary from './ChatPartySummary';
import ChattingWindow from './ChattingWindow';
import WriteChat from './WriteChat';

export default class GeneralChatMainPage extends Component {
  static contextType = MessageContext;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //console.log('GeneralChatMainPage is being loaded');
  }

  componentWillMount() {

    if (this.props.compact === 'false' && this.context.chattingContextType !== 0) {
      // ISEO-TBD: switching to "2" will be possible only within the dashboard??
      //console.log('ISEO: need to re-initialize the context: full mode');
      this.context.reset(0);
    }
  }

  render() {
    const leftPanelColumn = (this.props.compact === 'true') ? '1/4' : '4/6';
    const rightPanelColumn = (this.props.compact === 'true') ? '4/13' : '6/10';

    return (
      <div
        className="GeneralChatMainWrapper bg-light"
        style={{ '--leftPanelColumn': leftPanelColumn, '--rightPanelColumn': rightPanelColumn }}
      >
        <div className="MessageLeftPanel">
          <div className="MessageHeader_ls">
            <GeneralChatHeader compact={this.props.compact} />
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
