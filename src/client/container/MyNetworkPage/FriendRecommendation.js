/* eslint-disable */
import React, { useContext, useEffect } from 'react';
import './mynetwork_style.css';
import { GlobalContext } from '../../contexts/GlobalContext';
import { FILE_SERVER_URL } from '../../globalConstants';


function FriendRecommendation() {
  const { network_info } = useContext(GlobalContext);

  const profile_style = {
    maxWidth: '100%',
    maxHeight: '100%',
    marginTop: '10px',
    width: '80%'
  };

  function getRecommendedFriends() {
    const recommendedFriends = [];

    if (network_info == null) return recommendedFriends;

    console.log(`getRecommendedFriends length = ${network_info.recommended_friends_list.length}`);

    for (let i = 0; i < network_info.recommended_friends_list.length; i++) {
      recommendedFriends.push(
        <div className="network_board">
          <div className="profile_picture">
            <img className="img-responsive center rounded-circle" style={profile_style} src={FILE_SERVER_URL+network_info.recommended_friends_list[i].profile_picture} />
          </div>
          <div className="friend_information">
            <span className="bold_fonts">{network_info.recommended_friends_list[i].name}</span>
          </div>

          <form role="form" action={`/LS_API/mynetwork/${network_info.recommended_friends_list[i].id}/friend_request`} method="post">
            <div className="action">
              <button className="btn btn-info">Connect</button>
            </div>
          </form>
        </div>
      );
    }

    return recommendedFriends;
  }

  function getPendingFriendRequest() {
    const friendRequests = [];

    if (network_info == null) return friendRequests;

    for (let i = 0; i < network_info.pending_friends_request_list.length; i++) {
      friendRequests.push(
        <div className="network_board">
          <div className="profile_picture">
            <img className="img-responsive center rounded-circle" style={profile_style} src={FILE_SERVER_URL+network_info.pending_friends_request_list[i].profile_picture} />
          </div>
          <div className="friend_information">
            <span className="bold_fonts">{network_info.pending_friends_request_list[i].name}</span>
          </div>

          <form role="form" action={`/LS_API/mynetwork/${network_info.pending_friends_request_list[i].id}/friend_request`} method="post">
            <div className="action">
              <button className="btn btn-info">Pending</button>
            </div>
          </form>
        </div>
      );
    }

    return friendRequests;
  }

  useEffect(() => {}, [network_info]);

  return (
    <div>
      <div className="bottom-shadow">
        <span style={{ textAlign: 'center' }}><h3> Friends Recommendation </h3></span>
        <hr />
        <div className="d-flex justify-content-between" style={{ flexWrap: 'wrap' }}>
          {getRecommendedFriends()}
        </div>

        <hr />
        <div className="d-flex justify-content-between" style={{ flexWrap: 'wrap' }}>
          {getPendingFriendRequest()}
        </div>
      </div>
    </div>
  );
}

export default FriendRecommendation;
