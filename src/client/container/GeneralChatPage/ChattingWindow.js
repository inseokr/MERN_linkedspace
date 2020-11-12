/* eslint-disable */
import React, { useContext, useRef, useEffect } from 'react';
import shortid from 'shortid';

import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
// import sampleProfile from '../../assets/images/Chinh - Vy.jpg';


function ChattingWindow() {
  const messagesEndRef = useRef(null);

  const {
    currChannelInfo, msgCounter, dmChannelContexts, getChattingHistory, getLastReadIndex, currentChatPartyPicture
  } = useContext(MessageContext);
  const { getProfilePicture } = useContext(GlobalContext);

  // const [numOfHistory, setNumOfHistory] = useState(0);

  // console.log("loading Chatting Window");

  const scrollToBottom = () => {
    // console.log("scrollToBottom. numOfMsgHistory="+numOfMsgHistory);

    if (messagesEndRef.current !== undefined && messagesEndRef.current != null) {
      messagesEndRef.current.scrollIntoView({ block: 'end', inline: 'nearest' });
    }
  };

  // function getNewMessageMarker() {
  //   return <hr className="newMessage" />;
  // }

  function getCurMessageBox(chat, new_msg_marker) {
    // console.log("getCurMessageBox: chat.msg = " + chat.message);
    // direction: 0(my own message), 1(from others)
    // <note> not sure if we should rely on currentChatPartyPicture
    // getProfilePicture may return profile picture of friends?
    // console.log("getCurMessageBox: direction = " + chat.direction);
    // console.log("getCurMessageBox: username = " + chat.username);
    // let profilePicture = (chat.direction==0)? getProfilePicture(chat.username): currentChatPartyPicture;
    const profilePicture = getProfilePicture(chat.username);

    return (
      <div key={shortid.generate()}>
        <ChattingMessageBox
          msg_direction={chat.direction}
          profile_picture={profilePicture}
          message={chat.message}
          timestamp={chat.timestamp}
          new_msg={new_msg_marker}
        />
      </div>
    );
  }

  function getChatHistory() {
    const chatHistory = getChattingHistory();
    const lastReadIndex = getLastReadIndex('');
    let output = [];
    // console.log("getChatHistory: chatHistory.length = " + chatHistory.length + " lastReadIndex = " + lastReadIndex);

    let newMsgMarked = false;

    try {
      for (let index = 0; index < chatHistory.length; index++) {
        let newMsgFlag = false;

        if (!newMsgMarked) {
          if (index >= lastReadIndex && (chatHistory[index].direction === 1)) {
            newMsgFlag = true;
            newMsgMarked = true;
          }
        }
        output = [...output, getCurMessageBox(chatHistory[index], newMsgFlag)];
      }
    } catch (err) {
      console.warn(`err=${err}`);
    }

    return output;
  }

  function loadChattingHistory() {
    // //console.log("ISEO: loadChattingHistory!!!!!!!!!!!!!!!!!!!!!!");
    const history = getChatHistory();
    // //console.log("ISEO: length of history = " + history.length);
    return (history);
  }

  useEffect(() => {
    scrollToBottom();
  }, [dmChannelContexts]);

  function triggerScroll() {
    // ISEO-TBD: It's very interesting bug, but I should re-schedule the scrollToBottom with some delay.
    // I assume it's happening because React is doing things in parallel and the scroll operation is made
    // while the data is still being loaded.
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    return '';
  }

  return (
    <div>
      {loadChattingHistory()}
      {triggerScroll()}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChattingWindow;
