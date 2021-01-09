/* eslint-disable */
import React from 'react';
import '../../app.css';
import { FILE_SERVER_URL } from '../../globalConstants';
import './GeneralChatMainPage.css';

function ChattingMessageBox(props) {
  let newMsgMarker = '';

  if (props.new_msg) {
    newMsgMarker = <hr className="newMessage" />;
  }

  if (props.msg_direction == '0') {
    return (
      <div className="ChattingMessageBoxWrapperNoPicture">
        <div>
          <img className="center rounded-circle imgInMsgBox" style={{display:'none'}} src={FILE_SERVER_URL+props.profile_picture} alt="myFriend" />
        </div>

        <div className="speech-bubble-left marginTop marginBottom">
          <div className="MessageContents">
            <p className="ChattingMessageStyle"> {props.message} </p>
          </div>
          <div className="MessageTimeStampLeft">
            {props.timestamp}
          </div>
        </div>

      </div>
    );
  }
  return (
    <React.Fragment>
      {newMsgMarker}
      <div className="ChattingMessageBoxWrapper">
        <div className="ProfilePictureInMessageBox">
          <img className="center rounded-circle imgInMsgBox" src={FILE_SERVER_URL+props.profile_picture} alt="myFriend" />
        </div>

        <div className="speech-bubble-right marginTop marginBottom">
          <div className="MessageContents">
            <p className="ChattingMessageStyle"> {props.message} </p>
          </div>
          <div className="MessageTimeStamp">
            {props.timestamp}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ChattingMessageBox;
