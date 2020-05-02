import React, { Component, useState, useContext, useRef, useEffect} from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';


function ChattingWindow() {

    const messagesEndRef = useRef(null);

    const {numOfMsgHistory, getChattingHistory} = useContext(MessageContext);
    const {getProfilePicture} = useContext(GlobalContext);

    const [numOfHistory, setNumOfHistory] = useState(0);

    console.log("loading Chatting Window");

    const scrollToBottom = () => {

        if(messagesEndRef.current!=undefined)
        {
            console.log("setting scrollIntoView mode");
            messagesEndRef.current.scrollIntoView({block: "end", inline: "nearest"});
            
            // smooth option won't be used to load the first history.
            if(numOfHistory>0)
            { 
                messagesEndRef.current.scrollIntoView({behavior: "smooth"});
            }
            setNumOfHistory(numOfMsgHistory);
        }
    }

    function loadChattingHistory()
    {

        console.log("loadChattingHistory");

        if(messagesEndRef.current==undefined) 
        {
            // ISEO-TBD: It's so weird!!!
            // Hmm... I suspect that there is a bug... it may just need time??? how about
            // So indeed it is a bug!! Gosh... 
            setTimeout(() => {  console.log("World!"); }, 500);
            return;
        }

        if(numOfHistory!=numOfMsgHistory)
        {
            console.log("Number of history got udpated. old = " + numOfHistory + " new = " + numOfMsgHistory);
            scrollToBottom();
        }

        let chatHistory = getChattingHistory().map(function (chat, index) {
            return <ChattingMessageBox
                msg_direction={chat.direction}
                profile_picture={getProfilePicture(chat.username)}
                message={chat.message}
                timestamp={chat.timestamp}
            />;
        });
        return chatHistory;
    }
    

    useEffect(() => {
        scrollToBottom();
    });

    return (
        <>
            {loadChattingHistory()}
            <div ref={messagesEndRef}/>
        </>
    )
}

export default ChattingWindow;
