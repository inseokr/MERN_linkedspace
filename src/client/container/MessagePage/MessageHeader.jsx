import React, { Component } from 'react';
import '../../app.css';
import Search from '../SearchPage/SearchPage';
import MessageNotification from '../../components/Message/MessageNotification';

function MessageHeader() {
  return (
    <div>
      <MessageNotification />
    </div>
  );
}

export default MessageHeader;
