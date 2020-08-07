import React, { useContext } from 'react';
import '../../app.css';
import Search from "../../container/SearchPage/SearchPage"
import {Link} from 'react-router-dom';
import {GlobalContext} from "../../contexts/GlobalContext";
import {MessageContext} from "../../contexts/MessageContext";


function LoginMenu()
{
  const {currentUser} = useContext(GlobalContext);
  const {checkIfAnyNewMsgArrived} = useContext(MessageContext);

  let newMsgMarker = (checkIfAnyNewMsgArrived()==true)?
                      <div>
                      <span className="fa fa-comment"></span>
                      <span className="newMsgSignature">N</span></div>: "";
  
  function editProfile()
  {
      return (
        <img className="img-responsive center rounded-circle"
          style={{
                    maxHeight: '70%',
                    height: '30px'
                  }
                 }
          src={currentUser.profile_picture} alt="Edit Profile"/>
      )
  }


  return (
  	<div>
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#linkedSpacesNavbarToggler" aria-controls="linkedSpacesNavbarToggler" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="linkedSpacesNavbarToggler">
          <a className="navbar-brand" href="/">LinkedSpaces</a>

          <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/MyNetworks">
                    My Network
                    <span className="fa fa-comment"></span>
                    <span className="newMsgSignature">2</span>
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
