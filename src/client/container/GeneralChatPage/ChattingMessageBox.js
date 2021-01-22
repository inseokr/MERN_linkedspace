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


  function parseMessage(msg) {
    // no more to process
    if(msg==="" || msg.length===0) return {type: 'plain', msg: ''};

    let messages = [];
    const regex = /(?<leadingPureText>^((?!http(?:|s):\/\/).)*|^)(?<hyperlink>http(?:|s):\/\/[^ ]*)(?<remainder> .*|)/;
    const processedMsg = regex.exec(msg);

    if(processedMsg!==null) 
    {
      //console.warn(`hyperlink=${parsedString.groups.hyperlink}`);
      if(processedMsg.groups.leadingPureText.length>0){
        messages.push({type: 'plain', msg: processedMsg.groups.leadingPureText});
      }

      if(processedMsg.groups.hyperlink.length>0){
        messages.push({type: 'hyperlink', msg: processedMsg.groups.hyperlink}); 
      }

      if(processedMsg.groups.remainder.length>0){
        let _msg = parseMessage(processedMsg.groups.remainder); 
        messages = messages.concat(_msg);
      }
    }
    else
    {
      messages.push({type: 'plain', msg: msg});
    }

    return messages;
  }

  function generateMessageComponents(msg) {
    let processedMsg = parseMessage(msg);
    let htmlComponents = [];

    for(let index=0; index<processedMsg.length; index++)
    {
      if(processedMsg[index].type==="plain")
      {
        htmlComponents.push(processedMsg[index].msg);
      }
      else
      {
        htmlComponents.push(<a href={processedMsg[index].msg} target="_blank"> {processedMsg[index].msg} </a>);
      }
    }

    return htmlComponents;
  }

  if (props.msg_direction == '0') {
    return (
      <div className="ChattingMessageBoxWrapperNoPicture">
        <div>
          <img className="center rounded-circle imgInMsgBox" style={{display:'none'}} src={FILE_SERVER_URL+props.profile_picture} alt="myFriend" />
        </div>

        <div className="speech-bubble-left marginTop marginBottom">
          <div className="MessageContents">
            <p className="ChattingMessageStyle"> {generateMessageComponents(props.message)} </p>
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
      <div className="ChattingMessageBoxWrapper">
        <div className="ProfilePictureInMessageBox">
          <img className="center rounded-circle imgInMsgBox" src={FILE_SERVER_URL+props.profile_picture} alt="myFriend" />
        </div>

        <div className="speech-bubble-right marginTop marginBottom">
          <div className="MessageContents">
            <p className="ChattingMessageStyle"> {generateMessageComponents(props.message)} </p>
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
