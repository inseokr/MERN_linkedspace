/* eslint-disable */
import React, { useContext } from 'react';
import './mynetwork_style.css';
import { GlobalContext } from '../../contexts/GlobalContext';
import { FILE_SERVER_URL } from '../../globalConstants';


function MyNetworkLeftPane() {
  const { network_info } = useContext(GlobalContext);

  const maxPicturesToShow = 4;

  if (network_info == null) return null;

  const img_style = {
    maxHeight: '70%',
    marginTop: '10px'
  };

  function getFriendImages() {
    if (network_info == null) {
      return null;
    }

    const friendsImage = [];

    console.log(`getFriendImages, length = ${network_info.direct_friends_list.length}`);

    
    for (let i = 0; i < network_info.direct_friends_list.length && i < maxPicturesToShow ; i++) {
      friendsImage.push(
        <div className={`image${i + 1}`}>
          <img className="img-responsive center rounded-circle" style={img_style} src={FILE_SERVER_URL+network_info.direct_friends_list[i].profile_picture} />
        </div>
      );
    }

    return friendsImage;
  }

  return (
    <div className="d-flex justify-content-around connection_pannel">
      <div className="connection_image">
        <div className="col">
          {getFriendImages()}
        </div>
      </div>
      <div className="connection_caption bold_fonts">
        <a href="#direct_friends">
          {' '}
          Connections(
          {network_info.direct_friends_list.length}
          )
          {' '}
        </a>
      </div>
    </div>
  );
}

export default MyNetworkLeftPane;
