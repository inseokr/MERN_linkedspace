import React from 'react';
import '../../app.css';
import './MessageStyle.css';

function OnlineStatus(props) {
  const { marginLeft, loginStatus } = props;
  const additionalStyle = (marginLeft !== undefined)
    ? { marginLeft } : {};
  const status = (loginStatus === true) ? 'Online' : 'Offline';
  const doghnutClass = (loginStatus === true) ? 'onlineDoughnut' : 'offlineDoughnut';

  return (
    <div className="onlineWrapper">
      <div className={doghnutClass} style={additionalStyle} />
      <div className="OnlineStatus">
        {status}
      </div>
    </div>
  );
}

export default OnlineStatus;
