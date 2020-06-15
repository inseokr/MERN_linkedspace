import React, { Component, useEffect, useContext } from 'react';
import './MessageStyle.css'

function clickHandler()
{
	alert("Default clickHandler")
}

function MessageEditorIcon(props) {

  let onClickHandler = clickHandler

  if(props.clickHandler!=undefined)
  {
  	onClickHandler = props.clickHandler;
  }

  return (
	  <div class="MessageEditIcon" onClick={onClickHandler}>
	    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor" 
	      width="24" height="24" focusable="false">
	        <path d="M17 13.75l2-2V20a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h8.25l-2 2H5v12h12v-5.25zm5-8a1 1 0 01-.29.74L13.15 15 7 17l2-6.15 8.55-8.55a1 1 0 011.41 0L21.71 5a1 1 0 01.29.71zm-4.07 1.83l-1.5-1.5-6.06 6.06 1.5 1.5zm1.84-1.84l-1.5-1.5-1.18 1.17 1.5 1.5z">
	        </path>
	    </svg>
	  </div>
  );
}

export default MessageEditorIcon;

