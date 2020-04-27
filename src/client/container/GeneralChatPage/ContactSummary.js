import React, { Component, useState } from 'react';
import '../../app.css';
import './GeneralChatMainPage.css'


import sampleProfile from '../../../assets/images/Chinh - Vy.jpg';

function ContactSummary(props) {

  	function handleClick(e) {
	    e.preventDefault();
		props.clickHandler(props.contactIndex);
  	}

  	function getContactSummaryClassName()
  	{
  		return (props.clickState===0? "ContactSummary": "ContactSummaryClicked");
  	}

  	return (
	    <div className={getContactSummaryClassName()} onClick={handleClick}>
	    	<div className="ProfilePicture">
	    		<img className="center rounded-circle imgFitToGrid" src={props.user.profile_picture} alt="myFriend" />
	    	</div>
	    	<div className="ProfileName">
	    		{props.user.username}
	    	</div>
	    	<div className="TimeStamp">
	    		Mar 23,2020
	    	</div>
	    	<div className="MessageSummary">
	    		Happy Birthday, ...
	    	</div>
	    </div>
  	);
}

export default ContactSummary;