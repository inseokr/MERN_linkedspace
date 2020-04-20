import React, { createContext, useState, useEffect } from 'react';
import ChattingMessageBox from "../container/GeneralChatPage/ChattingMessageBox";
import sampleProfile from "../../assets/images/Chinh - Vy.jpg";
import messageAlertSound from "../../assets/musics/eventually.mp3";
import axios from 'axios';

export const MessageContext = createContext();

// <note> need to  use IP address variable
const chatUrl = 'ws://localhost:3030';

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


    // loading chatting database from backend
    function loadChattingDatabase()
    {
      var testArray = ["iseo" , "justin"];
      var data = {channel_id: "iseo-dm-justin", channel_type: 0, members: testArray};

      console.log("calling /chatting/new API call");

/*
      fetch('/chatting/get')
      .then(res => res.json())
      .then(channel => {
        console.log("channel ID = " + channel.channel_id);
        //console.log("creator = " + channel.channel_creator.name);
        console.log("history length = " + channel.chat_history.length);
      });
*/
      axios.post('/chatting/new', data)
        .then(res => res.json())
        .then(result => 
        {
            console.log("result = " + result);
        });
    }

    return (
    <MessageContext.Provider value={{ chattingHistory, updateChatHistory, loadChattingDatabase }}>
      {props.children}
    </MessageContext.Provider>
  );
}
