import React, { createContext, useState } from 'react';
import ChattingMessageBox from "../container/GeneralChatPage/ChattingMessageBox";
import sampleProfile from "../../assets/images/Chinh - Vy.jpg";
import messageAlertSound from "../../assets/musics/eventually.mp3";



export const MessageContext = createContext();


const chatUrl = 'ws://10.0.0.55:3030';

export function MessageContextProvider(props) {
  const [chattingHistory, addMsgToChatHistory] = useState([]);
  const [waitMessage, setWaitMessage] = useState(false);
  const [socketCreated, setSocketCreated] = useState(false);
  const [chatSocket, setWebSocket] = useState(null);
  const [alertSound, setAlertSound] = useState(null);


    function parseIncomingMessage(msg)
    {
        const regex = /CSD:(.*):(.*)/g;
        let parsedString = regex.exec(msg);

        return parsedString;
    }

  function updateChatHistory(msg, local) {

      if(local==true)
      {
          // sending to chat server
          console.log("Sending message to server. msg = " + msg);

          // need to append header
          // @CSD:channel_id:
          //chatSocket.send(''.concat("CSD:iseo-dm-justin:", JSON.stringify(msg)));
          chatSocket.send(''.concat("CSD:iseo-dm-justin:", msg));
          setWaitMessage(true);
          // it will echo locally added messages.
          // how to filter it out then? Server should not forward it back to me?
          const newHistory = [...chattingHistory, msg];
          addMsgToChatHistory(newHistory);
      }
      else {
          alertSound.play();
          let processedMsg = parseIncomingMessage(msg);

          // <note> processedMsg[1] will contain the channel information.
          console.log("Message for channel ID = " + processedMsg[1]);

          const newHistory = [...chattingHistory, processedMsg[2]];
          addMsgToChatHistory(newHistory);
      }
  }
    if(socketCreated==false)
    {
        console.log("creating WebSocket");
        let ws = new WebSocket(chatUrl);
        setSocketCreated(true);
        setWebSocket(ws);

        let audio = new Audio(messageAlertSound);
        setAlertSound(audio);
    }
    else {
        chatSocket.onopen = () => {
            console.log("Chat Server Connected");
            // let's send the first message to register this socket.
            chatSocket.send("CSC:Register:inseo");
        }

        chatSocket.onmessage = evt => {
            const message = evt.data;
            updateChatHistory(message, false);
            setWaitMessage(false);
        }

        chatSocket.onclose = () => {
            console.log("Disconnected");
            // Do we need to reconnected?
            setWebSocket(null);
            setSocketCreated(false);
        }
    }

    return (
    <MessageContext.Provider value={{ chattingHistory, updateChatHistory }}>
      {props.children}
    </MessageContext.Provider>
  );
}
