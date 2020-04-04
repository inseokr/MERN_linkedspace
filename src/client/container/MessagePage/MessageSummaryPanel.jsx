import React, { Component } from 'react';
import './MessagePage.css';
import '../../app.css';
import Search from '../SearchPage/SearchPage';
import MessageSummary from '../../components/Message/MessageSummary';

import myFriend1 from '../../../assets/images/Peter.jpg';
import myFriend2 from '../../../assets/images/Joongho.jpg';
import myFriend3 from '../../../assets/images/Chinh - Vy.jpg';

function MessageSummaryPanel() {
  const msg1 = {
    sender_name: 'Peter Bae',
    msg_created_time: '03/15/2020 9:42 PM',
    msg_summary: 'Long time no see, how are you doing?'
  };
  msg1.img_src = myFriend1;

  const msg2 = {
  	sender_name: 'Joongho Oh',
  	msg_created_time: '03/21/2020 11:42 PM',
  	msg_summary: 'In, how are you doing? I got something really good deal for you.'
  };
  msg2.img_src = myFriend2;

  const msg3 = {
    sender_name: 'Chin Le',
    msg_created_time: '03/22/2020 10:42 PM',
    msg_summary: 'Hello My friend, here comes the new listing for you.'
  };
  msg3.img_src = myFriend3;

  return (
    <div>
      <h2 className="MessageSummaryHeader"> Message summary </h2>
      <MessageSummary msg={msg1} />
      <MessageSummary msg={msg2} />
      <MessageSummary msg={msg3} />
    </div>
  );
}

export default MessageSummaryPanel;
