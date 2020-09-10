import React from 'react';
import '../../app.css';
import './MessageStyle.css';

function OnlineStatus(props) {

  let additionalStyle = (props.marginLeft!==undefined) ?
    {marginLeft: props.marginLeft} : {};

  return (
    <div className="onlineWrapper">
      <div className="doughnut" style={additionalStyle}>
      </div>
      <div className="OnlineStatus" >
        12h ago
      </div>
    </div>
  );
}

export default OnlineStatus;
