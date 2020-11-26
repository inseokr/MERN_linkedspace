import React, { useContext } from 'react';
import '../../app.css';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../../contexts/GlobalContext';
import { MessageContext } from '../../contexts/MessageContext';
// import { FILE_SERVER_URL } from '../../globalConstants';

function LoginMenu() {
  const { currentUser } = useContext(GlobalContext);
  const { checkIfAnyNewMsgArrived } = useContext(MessageContext);

  const newMsgMarker = (checkIfAnyNewMsgArrived())
    ? (
      <React.Fragment>
        <span className="fa fa-comment" />
        <span className="newMsgSignature">N</span>
      </React.Fragment>
    ) : '';

  function editProfile() {
    return (
      <img
        className="img-responsive center rounded-circle"
        style={{
          maxHeight: '70%',
          height: '30px'
        }
           }
        src={`${process.env.REACT_APP_FILE_SERVER_URL}${currentUser.profile_picture}`}
        alt="Edit Profile"
      />
    );
  }

  const myNetworkBaloon = (currentUser.incoming_friends_requests.length >= 1)
    ? (
      <React.Fragment>
        <span className="fa fa-comment" />
        <span className="newMsgSignature">{currentUser.incoming_friends_requests.length}</span>
      </React.Fragment>
    )
    : <React.Fragment> </React.Fragment>;

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#linkedSpacesNavbarToggler" aria-controls="linkedSpacesNavbarToggler" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="linkedSpacesNavbarToggler">
            <a className="navbar-brand" href="/">LinkedSpaces</a>

            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/MyNetworks">
                  My Network
                  {myNetworkBaloon}

                </Link>
              </li>
              <Link className="nav-link" to="/Messages">
                Messages
                {newMsgMarker}
              </Link>
              <Link className="nav-link" to="/PostListing">
                Post listing
              </Link>
              <li className="nav-item">
                <Link className="nav-link" to="/ActiveListing">
                  My Active Listing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/ShowListingFromFriends">
                  Listing From Friends
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Logout">
                  Logout
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/EditProfile">
                  {editProfile()}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default LoginMenu;
