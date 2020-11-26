/* eslint-disable */
import React, { useContext, useEffect } from 'react';
import './mynetwork_style.css';
import { GlobalContext } from '../../contexts/GlobalContext';
import {FILE_SERVER_URL} from '../../globalConstants';

function IncomingFriendRequest() {
  const { network_info } = useContext(GlobalContext);

  function getIncomingFriendRequest() {
    const friendRequests = [];

    const profile_style = {
      maxWidth: '100%',
      maxHeight: '100%',
      marginTop: '10px'
    };

    if (network_info == null) return friendRequests;

    console.log(`getIncomingFriendRequest length = ${network_info.incoming_friends_request_list.length}`);

    for (let i = 0; i < network_info.incoming_friends_request_list.length; i++) {
      friendRequests.push(
        <div className="network_board">
          <div className="profile_picture">
            <img className="img-responsive center rounded-circle" style={profile_style} src={FILE_SERVER_URL+network_info.incoming_friends_request_list[i].profile_picture} />
          </div>
          <div className="friend_information">
            <span className="bold_fonts">{network_info.incoming_friends_request_list[i].name}</span>
            <br />
            <span className="normal_fonts">
              {network_info.incoming_friends_request_list[i].address.city}
              ,
              {network_info.incoming_friends_request_list[i].address.state}
            </span>
          </div>

          <form role="form" action={`/LS_API/mynetwork/${network_info.incoming_friends_request_list[i].id}/friend_accept`} method="post">
            <div className="action">
              <button className="btn btn-info">Accept</button>
            </div>
          </form>
        </div>
      );
    }

    return friendRequests;
  }

  useEffect(() => {

  }, [network_info]);

  return (
    <div className="bottom-shadow">
      <span style={{ textAlign: 'center' }}><h3> Incoming Friend Requests </h3></span>
      <hr />
      <div className="d-flex justify-content-between">
        {getIncomingFriendRequest()}
      </div>
      <hr />
    </div>
  );
}

export default IncomingFriendRequest;
