import React, { Component, useState, useContext } from 'react';
import { MessageContext } from '../../contexts/MessageContext';
import '../../app.css';
import './GeneralChatMainPage.css';

function WriteChat() {
  const {updateChatHistory} = useContext(MessageContext);
  const [chatMessage, setChatMessage] = useState("Write message...");

  const handleKeyPress = (e) => {
    if(e.which == 13 && !e.shiftKey) {
      handleSubmit(e);
      e.preventDefault();
    }
  }

  const handleChangeChatMessage = (e) => {
    setChatMessage(e.target.value);
  };

  const cleanMessage = (event) => {
    event.preventDefault();
    setChatMessage("");
  }


  const handleSubmit = (event) => {
    event.preventDefault();
    setChatMessage("");
    updateChatHistory(chatMessage, true);
  };

  	return (
    <div>
      <div>
        <svg className="FileAttachIcon" viewBox="0 0 24 24" role="presentation" aria-hidden="true" focusable="false">
          <path d="m7.5 5.5c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm0 3c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm10.5 13.5h-12c-1.191 0-2.249-.531-2.982-1.357l5.536-7.382 2.592 2.593c.226.225.602.185.774-.083l4.082-6.35 5.941 9.14c-.275 1.941-1.926 3.439-3.943 3.439zm-16-16c0-2.209 1.791-4 4-4h12c2.209 0 4 1.791 4 4v10.813l-5.581-8.585c-.197-.305-.644-.304-.839.001l-4.165 6.479-2.561-2.562c-.215-.215-.571-.189-.754.054l-5.673 7.564c-.265-.534-.427-1.127-.427-1.764zm16-5h-12c-2.761 0-5 2.239-5 5v12c0 2.761 2.239 5 5 5h12c2.761 0 5-2.239 5-5v-12c0-2.761-2.239-5-5-5z" />
        </svg>
      </div>

      <div className="WriteMessageBox">
        <form onSubmit={handleSubmit}>
          <textarea
            id="ChattingMessage"
            cols="50"
            placeholder="Write a message..."
			      value={chatMessage}
            onChange={handleChangeChatMessage}
            onKeyPress={handleKeyPress}
            onClick={cleanMessage}
          />
        </form>
      </div>
    </div>
  	);
}

export default WriteChat;
