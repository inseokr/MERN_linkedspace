import React from 'react';
import '../../app.css';
import './MessageStyle.css';

function OnlineStatus(props) {
  const { marginLeft, loginStatus } = props;
  const additionalStyle = (marginLeft !== undefined)
    ? { marginLeft } : { marginLeft: '20px' };
  const doghnutClass = (loginStatus === true) ? 'onlineDoughnut' : 'offlineDoughnut';

  return (
    <div className="onlineWrapper">
      <div className={doghnutClass} style={additionalStyle} />
    </div>
  );
}

export default OnlineStatus;
