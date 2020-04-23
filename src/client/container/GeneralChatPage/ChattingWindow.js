import React, { Component, useState, useContext} from 'react';
import  {useRef, useEffect } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox';
import { MessageContext } from '../../contexts/MessageContext';
import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';



function ChattingWindow() {

    const divRef = React.createRef();


    useEffect(() => {
        divRef.current.scrollIntoView({behavior: 'smooth'});
    });

    const {getChattingHistory, updateChatHistory} = useContext(MessageContext);

    const chatMessages = getChattingHistory().map(function (chat, index) {
        return <ChattingMessageBox
            msg_direction={(index % 2)}
            profile_picture={sampleProfile}
            message={chat.message}
            timestamp="03/28/2020 7:11 P.M"
        />;
    });

    return (
        <>
            {chatMessages}
            <div ref={divRef}/>
        </>
    )
}

export default ChattingWindow;
