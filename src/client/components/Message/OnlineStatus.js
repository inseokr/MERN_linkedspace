import React from 'react';
import '../../app.css';
import './MessageStyle.css';

function OnlineStatus(props) {
  const { marginLeft } = props;
  const additionalStyle = (marginLeft !== undefined)
    ? { marginLeft } : {};

  return (
    <div className="onlineWrapper">
      <div className="doughnut" style={additionalStyle} />
      <div className="OnlineStatus">
        12h ago
      </div>
    </div>
  );
}

export default OnlineStatus;
