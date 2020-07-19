import React, { Component } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';

function ChattingMessageBox(props) {

    let newMsgMarker = "";

    if(props.new_msg==true)
    {
        newMsgMarker = <hr className="newMessage" />;
    }

    if(props.msg_direction=="0")
    {
      return (
        <div className="ChattingMessageBoxWrapper AlignToLeft">
            <div className="ProfilePicture">
                <img className="center rounded-circle imgLeftMsgBox" src={props.profile_picture} alt="myFriend" />
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
        <>
        {newMsgMarker}
        <div className="ChattingMessageBoxWrapper AlignToRight">

            <div className="ProfilePicture">
                <img className="center rounded-circle imgRightMsgBox" src={props.profile_picture} alt="myFriend" />
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
        </>
      );
    }
}

export default ChattingMessageBox;