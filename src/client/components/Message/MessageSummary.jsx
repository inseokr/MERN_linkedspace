import React, { Component } from 'react';
import '../../app.css';
import { SearchContext } from '../../contexts/SearchContext';
import './MessageStyle.css';

function MessageSummary(props) {
    console.log("img src=" + props.msg.img_src);

  return (
      <div className="d-flex message_summary">
        <div className="MessageImage">
          <img className="MessageImageLocation img-responsive center rounded-circle" src={props.msg.img_src} alt="myFriend" />
        </div>
        <div className="messageSummary-header">
        	<h3> {props.msg.sender_name} </h3>
        	<h3 className="messageSummary-createdTime"> {props.msg.msg_created_time} </h3>
        </div>
        <div className="messageSummary-details">
        <p> {props.msg.msg_summary} </p>
        </div>
      </div>
  );
}
export default MessageSummary;