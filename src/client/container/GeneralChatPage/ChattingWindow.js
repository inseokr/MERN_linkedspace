import React, { Component, useState, useContext} from 'react';
import  {useRef, useEffect } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox';
import { MessageContext } from '../../contexts/MessageContext';
import { GlobalContext } from '../../contexts/GlobalContext';
import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';


function ChattingWindow() {

    const divRef = React.createRef();
    const {numOfMsgHistory, getChattingHistory, updateChatHistory} = useContext(MessageContext);
    const {getProfilePicture} = useContext(GlobalContext);

    let bFirstLoad = true;

    console.log("loading Chatting Window");

    function loadChattingHistory()
    {
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
        /*
        if(bFirstLoad==true)
        {
            console.log("block to  end");
            divRef.current.scrollIntoView({block: "end"});
            bFirstLoad = false;
        }
        else 
        {
            console.log("block to start");
            divRef.current.scrollIntoView({block: "start"});
        }*/
        divRef.current.scrollIntoView({block: "end"});
        divRef.current.scrollIntoView({behavior: 'smooth'});
    });

    return (
        <>
            {loadChattingHistory()}
            <div ref={divRef}/>
        </>
    )
}

export default ChattingWindow;
