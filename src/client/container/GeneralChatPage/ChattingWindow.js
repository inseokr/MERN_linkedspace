import React, { Component, useState, useContext, useRef, useEffect} from 'react';
import shortid from 'shortid';

import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';


function ChattingWindow() {

    const messagesEndRef = useRef(null);

    const {numOfMsgHistory, getChattingHistory, getLastReadIndex} = useContext(MessageContext);
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
        console.log("getCurMessageBox: chat.msg = " + chat.message);
        
        return (
            <div key={shortid.generate()}>
                <ChattingMessageBox
                            msg_direction={chat.direction}
                            profile_picture={getProfilePicture(chat.username)}
                            message={chat.message}
                            timestamp={chat.timestamp}
                            new_msg={new_msg_marker}
                />
            </div>
        ) 
    }

    function getChatHistory()
    {
        let chatHistory   = getChattingHistory();
        let lastReadIndex = getLastReadIndex("");
        let output        = [];
        console.log("getChatHistory: chatHistory.length = " + chatHistory.length + " lastReadIndex = " + lastReadIndex);
        
        let newMsgMarked = false;
        
        for(let index=0; index<chatHistory.length; index++)
        {
            let newMsgFlag = false;

            if(newMsgMarked==false)
            {
                if(index>=lastReadIndex && (chatHistory[index].direction == 1))
                {
                    newMsgFlag = true;
                    newMsgMarked = true;
                }
            }
            output = [...output, getCurMessageBox(chatHistory[index], newMsgFlag)];
        }

        return output;
    }


    function loadChattingHistory()
    {
        console.log("ISEO: loadChattingHistory!!!!!!!!!!!!!!!!!!!!!!")
        var history = getChatHistory();
        console.log("ISEO: length of history = " + history.length)

        return (history);
    }

    useEffect(() => {
        scrollToBottom();
    }, [numOfMsgHistory]);

    function triggerScroll()
    {
        // ISEO-TBD: It's very interesting bug, but I should re-schedule the scrollToBottom with some delay.
        // I assume it's happening because React is doing things in parallel and the scroll operation is made
        // while the data is still being loaded.
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 100);

        return "";
    }
    return (
        <div>
            {loadChattingHistory()}
            {triggerScroll()}
            <div ref={messagesEndRef}/>
        </div>
    )
}

export default ChattingWindow;