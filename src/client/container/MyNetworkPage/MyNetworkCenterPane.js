import React from 'react';

import FriendRecommendation from './FriendRecommendation';
import IncomingFriendRequest from './IncomingFriendRequest';
import DirectFriends from './DirectFriends';

import './mynetwork_style.css';

function MyNetworkCenterPane() {
  return (
    <div>
      <DirectFriends />
      <IncomingFriendRequest />
      <FriendRecommendation />
    </div>
  );
}

export default MyNetworkCenterPane;
