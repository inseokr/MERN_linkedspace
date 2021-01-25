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
     this.state = {
      leftPanelColumn: (this.props.compact === 'true') ? '1/4' : '4/6',
      rightPanelColumn: (this.props.compact === 'true') ? '4/13' : '6/10',
      viewHeight: (this.props.compact === 'true') ? '25vh' : '90vh',
      leftPanelStyle: (this.props.meeting === 'true')? {display: 'none'}: {},
      rightPanelStyle: (this.props.meeting === 'true')? {width: '135%', marginLeft: '-33.5%'}: {},
      mainWidth: (this.props.meeting === 'true')? '20%': 'auto',
      viewHeight: '90vh',
      chattingWindowStyle: {},
      writeChatStyle: {},
      collapse: 'false',
      contactCollapseState: 'true'
    };

    this.collapseHandler = this.collapseHandler.bind(this);
    this.contactListCollapeHandler = this.contactListCollapeHandler.bind(this);
  }

  componentDidMount() {
    this.context.refreshUserDataFromMessageContext();
  }

  componentWillMount() {
    // ISEO-TBD: this could be depricated
    this.context.refreshUserDataFromMessageContext();
    if (this.props.compact === 'false' && this.context.chattingContextType !== 0) {
      // ISEO-TBD: switching to "2" will be possible only within the dashboard??
      //console.log('ISEO: need to re-initialize the context: full mode');
      this.context.reset(0);
    }
  }

  collapseHandler() {
    if(this.state.collapse==='false')
    {
      this.setState({chattingWindowStyle: {display:'none'}, writeChatStyle: {display:'none'}, viewHeight: '5vh', collapse: 'true'});
    }
    else
    {
      this.setState({chattingWindowStyle: {display:'block'}, writeChatStyle: {display:'block'}, viewHeight: '90vh', collapse: 'false'}); 
    }
  }  

  contactListCollapeHandler() {
    if(this.state.contactCollapseState==='false')
    {
      this.setState({leftPanelStyle: {display: 'none'}, contactCollapseState: 'true'});
    }
    else
    {
      this.setState({leftPanelStyle: {display: 'block', position: 'absolute', left: '-300%', width: '300%'}, contactCollapseState: 'false'}); 
    }
  }  

  render() {
    //let viewHeight = (this.props.compact === 'true') ? '25vh' : '90vh';

    //let leftPanelStyle = {};
    //let rightPanelStyle = {};
    //let mainWidth = 'inherit';

    /*if(this.props.meeting === 'true')
    {
      leftPanelStyle = {display: 'none'};
      rightPanelStyle = {width: '135%', marginLeft: '-33.5%'};
      mainWidth = '20%';
      viewHeight = '90vh';
    }*/
    return (
      <div
        className="GeneralChatMainWrapper bg-light"
        id="chattingPanel"
        style={{ '--leftPanelColumn': this.state.leftPanelColumn, 
                 '--rightPanelColumn': this.state.rightPanelColumn,
                 '--chatMainHeight': this.state.viewHeight,
                 '--chatLeftPanelHeight': this.state.viewHeight,
                 '--chatRightPanelHeight': this.state.viewHeight,
                 borderBottom: 'hidden',
                 width: this.state.mainWidth,
                 zIndex: '10'}}
      >
        <div className="MessageLeftPanel" style={this.state.leftPanelStyle}>
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

        <div className="MessageRightPanel" style={this.state.rightPanelStyle}>
          <div className="SenderProfileSummary">
            <ChatPartySummary 
              collapseHandler={this.collapseHandler} collapseState={this.state.collapse} 
              contactListCollapeHandler={this.contactListCollapeHandler} contactCollapseState={this.state.contactCollapseState} />
          </div>
          <div className="ChattingWindow" style={this.state.chattingWindowStyle}>
            <ChattingWindow />
          </div>
          <div className="WriteMessageWindow style={this.state.writeChatStyle}">
            <WriteChat />
          </div>
        </div>
      </div>
    );
  }
}
