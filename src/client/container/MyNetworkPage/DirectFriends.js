/* eslint-disable */
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './mynetwork_style.css';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';
import { FILE_SERVER_URL } from '../../globalConstants';


function DirectFriends() {
  const { network_info } = useContext(GlobalContext);
  const { switchDmByFriendName } = useContext(MessageContext);

  function handleClick(evt) {
	    // param is the argument you passed to the function
	    // e is the event object that returned
	    // evt.preventDefault();
    console.log(`handleClick, index = ${evt.target.value}`);
    switchDmByFriendName(network_info.direct_friends_list[evt.target.value].username);
  }

  function getDirectFriends() {
    const friends = [];

    const profile_style = {
      maxWidth: '100%',
      maxHeight: '100%',
      marginTop: '10px',
      width: '80%'
    };

    if (network_info == null) return friends;

    console.log(`getDirectFriends length = ${network_info.direct_friends_list.length}`);

    for (let i = 0; i < network_info.direct_friends_list.length; i++) {
      friends.push(
        <div className="network_board">
          <div className="profile_picture">
            <img className="img-responsive center rounded-circle" style={profile_style} src={FILE_SERVER_URL+network_info.direct_friends_list[i].profile_picture} />
          </div>
          <div className="friend_information">

            <span className="bold_fonts">{network_info.direct_friends_list[i].username}</span>
            <br />
          </div>

          <Link to="/Messages">
            <div className="action">
              <button className="btn btn-info" onClick={handleClick} value={i}>Message</button>
            </div>
          </Link>
        </div>
      );
    }

    return friends;
  }

  useEffect(() => {

  }, [network_info]);

  return (
    <div className="bottom-shadow" id="direct_friends">
      <span style={{ textAlign: 'center' }}><h3> Direct Friends </h3></span>
      <hr />
      <div className="d-flex flex-wrap justify-content-between">
        {getDirectFriends()}
      </div>
      <hr />
    </div>
  );
}

export default DirectFriends;
