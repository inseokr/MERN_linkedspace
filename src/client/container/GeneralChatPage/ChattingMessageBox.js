import React, { Component } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';

function ChattingMessageBox(props) {

    if(props.msg_direction=="0")
    {
      return (
        <div className="ChattingMessageBoxWrapper">
            
            <div className="ProfilePicture">
                <img className="center rounded-circle imgMsgBox" src={props.profile_picture} alt="myFriend" />
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
    else 
    {
      return (
        <div className="ChattingMessageBoxWrapper">

            <div className="speech-bubble-right marginTop marginBottom">
                <div className="MessageContents">
                    {props.message}
                </div>
                <div className="MessageTimeStamp">
                    {props.timestamp}
                </div>
            </div>
            
            <div className="ProfilePicture">
                <img className="center rounded-circle imgMsgBox" src={props.profile_picture} alt="myFriend" />
            </div>
        </div>
      );
    }
}

export default ChattingMessageBox;