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
                      <> 
                      <span class="fa fa-comment"></span>
                      <span class="newMsgSignature">N</span></>: "";                      
  
  return (
  	<>
    <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div class="container">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#linkedSpacesNavbarToggler" aria-controls="linkedSpacesNavbarToggler" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="linkedSpacesNavbarToggler">
          <a class="navbar-brand" href="/">LinkedSpaces</a>
          
          <ul class="navbar-nav ml-auto">
              <li class="nav-item">
                <Link class="nav-link" to="/MyNetworks">
                    My Network
                    <span class="fa fa-comment"></span>
                    <span class="newMsgSignature">2</span>
                </Link>
              </li>
              <Link class="nav-link" to="/Messages">
                Messages
              {newMsgMarker}
              </Link>
              <li class="nav-item"><a class="nav-link" href="/listing">Post listing</a></li>
              <li class="nav-item">
                <Link class="nav-link" to="/ActiveListing"> 
                  My Active Listing
                </Link>
              </li>
              <li class="nav-item"><a class="nav-link" href="/listing/tenant/tenant_dashboard">Dashboard</a></li>
              <li class="nav-item">
                <a class="nav-link" href="/logout" style={{position: 'relative'}}>
                  Logout
                </a>
              </li>

              <li class="nav-item">
                  <a class="nav-link" href="/profile">
                      <img class="img-responsive center rounded-circle"
                            style={{
                                      maxHeight: '70%',
                                      height: '30px'
                                    }
                                   }
                            src={currentUser.profile_picture}/>
                  </a>
              </li>
          </ul>
        </div>
      </div>
      </nav>
    </>
  );
 }

 export default LoginMenu;
