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
      <div className="ChattingMessageBoxWrapper AlignToLeft">
        <div className="ProfilePicture">
          <img className="center rounded-circle imgLeftMsgBox" src={FILE_SERVER_URL+props.profile_picture} alt="myFriend" />
        </div>

        <div className="speech-bubble-left marginTop marginBottom">
          <div className="MessageContents">
            {props.message}
          </div>
          <div className="MessageTimeStamp">
            {props.timestamp}
          </div>
        </div>

      </div>
    );
  }
  return (
    <React.Fragment>
      {newMsgMarker}
      <div className="ChattingMessageBoxWrapper AlignToRight">

        <div className="ProfilePicture">
          <img className="center rounded-circle imgRightMsgBox" src={FILE_SERVER_URL+props.profile_picture} alt="myFriend" />
        </div>

        <div className="speech-bubble-right marginTop marginBottom">
          <div className="MessageContents">
            {props.message}
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
