import React, { Component } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css';
import ChattingMessageBox from './ChattingMessageBox'; 
import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';

var sample_msg1 = "Hello There!!";
var sample_msg2 = "I'm doing good.";


function ChattingWindow() {

  return (
    <>
    	<ChattingMessageBox msg_direction="0" profile_picture={sampleProfile} message={sample_msg1} timestamp="03/28/2020 7:11 P.M" />
    	<ChattingMessageBox msg_direction="1" profile_picture={sampleProfile} message={sample_msg2} timestamp="03/28/2020 8:11 P.M" />
    </>
  );
}

export default ChattingWindow;