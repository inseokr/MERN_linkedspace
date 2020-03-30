import React, { Component } from 'react';
import '../../app.css';
import Search from "../../container/SearchPage/SearchPage"
import {Link} from 'react-router-dom';

export default class LoginMenu extends Component {
  state = { };

  componentDidMount() {
  }

  render() {
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
                  <a class="nav-link" href="/mynetwork">
                      My Network
                      <span class="fa fa-comment"></span>
                      <span class="num">2</span>
                  </a>
                </li>
                <li class="nav-item"><Link class="nav-link" to="/Messages">Messages</Link></li>
                <li class="nav-item"><a class="nav-link" href="/listing">Post listing</a></li>
                <li class="nav-item"><a class="nav-link" href="/listing/show_active_listing">My Active Listing</a></li>
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
                              src="/public/user_resources/pictures/profile_pictures/default_profile.jpg"/>
                    </a>
                </li>
            </ul>
          </div>
        </div>
        </nav>
      </>
    );
  }
 }
