import React, { Component } from 'react';
import '../../app.css';
import Search from '../../container/SearchPage/SearchPage';
import { FILE_SERVER_URL } from '../../globalConstants';

import './MessageStyle.css';

// Is there any way to use absolute path?
import myFriend1 from '../../assets/images/Peter.jpg';
import myFriend2 from '../../assets/images/Joongho.jpg';
import myFriend3 from '../../assets/images/Chinh - Vy.jpg';

function MessageNotification() {
  return (
    <div className="d-flex justify-content-around connection_pannel">
      <div className="connection_image">
        <div className="col">
          <div className="image1">
            <img className="image_location img-responsive center rounded-circle" src={FILE_SERVER_URL + myFriend1} alt="myFriend" />
          </div>
          <div className="image2">
            <img className="image_location img-responsive center rounded-circle" src={FILE_SERVER_URL + myFriend2} alt="myFriend" />
          </div>
          <div className="image3">
            <img className="image_location img-responsive center rounded-circle" src={FILE_SERVER_URL + myFriend3} alt="myFriend" />
          </div>
        </div>
      </div>

      <div className="connection_caption bold_fonts">
        Messages(1)
      </div>
    </div>
  );
}

export default MessageNotification;
