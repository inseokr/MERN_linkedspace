import React from 'react';
import '../../app.css';
import './MessageStyle.css';

function OnlineStatus(props) {
  const { additionalStyle, loginStatus } = props;
  const onlineStatusStyle = (additionalStyle !== undefined)
    ? additionalStyle : { marginLeft: '20px' };
  const doghnutClass = (loginStatus === true) ? 'onlineDoughnut' : 'offlineDoughnut';

  return (
    <div className="onlineWrapper">
      <div className={doghnutClass} style={onlineStatusStyle} />
    </div>
  );
}

export default OnlineStatus;
