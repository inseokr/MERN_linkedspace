import React, { Component, useState, useContext, useRef, useEffect} from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';


function ChattingWindow() {

    const messagesEndRef = useRef(null);

    const {numOfMsgHistory, getChattingHistory, loadChattingDatabase, getLastReadIndex} = useContext(MessageContext);
    const {getProfilePicture} = useContext(GlobalContext);

    //const [numOfHistory, setNumOfHistory] = useState(0);

    console.log("loading Chatting Window");

    const scrollToBottom = () => {

        console.log("scrollToBottom. numOfMsgHistory="+numOfMsgHistory);

        if(messagesEndRef.current!=undefined)
        {
            messagesEndRef.current.scrollIntoView({block: "end", inline: "nearest"});

            // smooth option won't be used to load the first history.
            if(numOfMsgHistory>0)
            { 
                console.log("changing behavior to smooth");
                //messagesEndRef.current.scrollIntoView({behavior: "smooth"});
            }
        }
    }


    function getNewMessageMarker()
    {
        return <hr className="newMessage" />;
    }

    function getCurMessageBox(chat, new_msg_marker)
    {
        return <ChattingMessageBox
                    msg_direction={chat.direction}
                    profile_picture={getProfilePicture(chat.username)}
                    message={chat.message}
                    timestamp={chat.timestamp}
                    new_msg={new_msg_marker}
                />;
    }

    function getChatHistory()
    {
        let chatHistory   = getChattingHistory();
        let lastReadIndex = getLastReadIndex("");
        let output        = [];

        console.log("lastReadIndex = " + lastReadIndex);
        
        for(let index=0; index<chatHistory.length; index++)
        {
            output = [...output, getCurMessageBox(chatHistory[index], 
                                                  (index==(lastReadIndex))? true: false)]
        }

        return output;
    }


    function loadChattingHistory()
    {
        console.log("loadChattingHistory");

        if(messagesEndRef.current==undefined) 
        {
            // ISEO-TBD: It's so weird!!!
            // Hmm... I suspect that there is a bug... it may just need time??? how about
            // So indeed it is a bug!! Gosh... 
            //setTimeout(() => {  console.log("World!"); }, 500);
            console.log("reference is not ready, just return empty");
            return "";
        }

        console.log("reference is ready and read chatting history now");

        scrollToBottom();
        return (getChatHistory());
    }
    
    useEffect(() => {
        scrollToBottom();
    }, [numOfMsgHistory]);

    return (
        <>
            {loadChattingHistory()}
            <div ref={messagesEndRef}/>
        </>
    )
}

export default ChattingWindow;