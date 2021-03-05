/* eslint-disable */
import React, { Component } from 'react';
import './app.css';
import 'leaflet/dist/leaflet.css';
import {
  BrowserRouter as Router,
  Switch
} from 'react-router-dom';
import { Route } from 'react-router';
import CommonHeader from './components/Header/CommonHeader';
import LandingPage from './container/LandingPage/LandingPage';
import GeneralChatMainPage from './container/GeneralChatPage/GeneralChatMainPage';
import MyNetworkPage from './container/MyNetworkPage/MyNetworkPage';
import ModalLoginForm from './components/Login/ModalLoginForm';
import ModalSignupForm from './components/Login/ModalSignupForm';
import ModalForgotPasswordForm from './components/Login/ModalForgotPasswordForm';
import Signup from './components/Login/Signup';
import Logout from './components/Login/Logout';
import Map from './container/MapPage/index';
import ListingLandlordMainPage from './container/ListingPage/landlord/ListingLandlordMainPage';
import ListingTenantMainPage from './container/ListingPage/tenant/ListingTenantMainPage';
import TenantListingDashboard from './container/ListingPage/tenant/TenantListingDashboard';
import ShowActiveListingPageWrapper from './container/ListingPage/ShowActiveListingPageWrapper';
import PostListingPage from './container/ListingPage/PostListingPage';
import Post3rdPartyListing from './container/ListingPage/3rdParty/Post3rdPartyListing';
import EditProfileMain from './container/EditProfilePage/EditProfileMain';
import FacebookLogin from './components/Login/FacebookLogin';
import FavoriteDashboard from './container/Favorite/FavoriteDashboard';


import { MessageContextProvider } from './contexts/MessageContext';
import { GlobalProvider } from './contexts/GlobalContext';
import { ListingsProvider } from './contexts/ListingsContext';
import { CurrentListingProvider } from './contexts/CurrentListingContext';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoginModal: false,
      showSignupModal: false,
      showForgotPasswordModal: false,
      loggedInStatus: false
    };

    this.clickHandler = this.clickHandler.bind(this);
    this.signupClickHandler = this.signupClickHandler.bind(this);
    this.forgotPasswordClickHandler = this.forgotPasswordClickHandler.bind(this);
    this.updateLoginStatus = this.updateLoginStatus.bind(this);
    this.hideLoginModal = this.hideLoginModal.bind(this);
    this.hideSignupModal = this.hideSignupModal.bind(this);
    this.hideForgotPasswordModal = this.hideForgotPasswordModal.bind(this);
  }

  componentDidMount() {
    document.title = 'LinkedSpaces';
  }

  clickHandler() {
    //console.warn('loginClickHander called');
    if(this.state.showLoginModal===false)
    {
      this.setState({ showLoginModal: true });
    }
  }

  hideLoginModal() {
    if(this.state.showLoginModal===true)
    {
      this.setState({ showLoginModal: false });
    }
  }

  signupClickHandler() {
    console.log('signupClickHandler called');
    this.setState({ showSignupModal: true });
  }

  hideSignupModal() {
    if(this.state.showSignupModal===true)
    {
      this.setState({ showSignupModal: false });
    }
  }

  forgotPasswordClickHandler() {
    console.log('forgotPasswordClickHandler called');
    this.setState({ showLoginModal: false });
    this.setState({ showForgotPasswordModal: true });
  }

  hideForgotPasswordModal() {
    if(this.state.showForgotPasswordModal===true)
    {
      this.setState({ showForgotPasswordModal: false });
    }
  }

  updateLoginStatus(status) {
    console.log(`updateLoginStatus: status = ${status}`);

    this.setState({ loggedInStatus: status });
  }

  render() {
    const { loggedInStatus, showLoginModal, showSignupModal, showForgotPasswordModal } = this.state;

    return (
      <GlobalProvider>
        <ListingsProvider>
          <CurrentListingProvider>
            <MessageContextProvider>
              <Router>
                <CommonHeader
                  loginClickHandler={this.clickHandler}
                  signupClickHandler={this.signupClickHandler}
                  hideLoginModal={this.hideLoginModal}
                  updateLoginStatus={this.updateLoginStatus}
                />
                <ModalLoginForm display={showLoginModal} forgotPasswordHandler={this.forgotPasswordClickHandler} closeHandler={this.hideLoginModal}/>
                <ModalSignupForm display={showSignupModal} closeHandler={this.hideSignupModal}/>
                <ModalForgotPasswordForm display={showForgotPasswordModal} clickHandler={this.hideForgotPasswordModal} />
                <Switch>
                  <Route exact path="/Map">
                    <Map />
                  </Route>
                  <Route exact path="/Messages">
                    <GeneralChatMainPage compact="false" meeting='false' />
                  </Route>
                  <Route exact path="/MyNetworks">
                    <MyNetworkPage />
                  </Route>

                  <Route exact path="/PostListing">
                    <PostListingPage />
                  </Route>
                  <Route exact path="/Signup">
                    <Signup />
                  </Route>
                  <Route exact path="/Logout">
                    <Logout />
                  </Route>
                  <Route exact path="/EditProfile">
                    <EditProfileMain />
                  </Route>

                  <Route exact path="/" render={props => <LandingPage {...props} />} />

                  <Route path="/facebooklogin/:id/login" render={props => <FacebookLogin {...props} updateLoginStatus={this.updateLoginStatus} />} />

                  <Route exact path="/homepage">
                    <LandingPage />
                  </Route>

                  <Route exact path="/3rdParty" component={Post3rdPartyListing} />

                  <Route exact path="/Favorite" render={props => <FavoriteDashboard {...props} />} />
                  <Route exact path="/ActiveListing">
                    <ShowActiveListingPageWrapper type="own" listingControl="" />
                  </Route>
                  <Route exact path="/ShowListingFromFriends">
                    <ShowActiveListingPageWrapper type="friend" listingControl="" />
                  </Route>
                  <Route path="/listing/landlord/:id/get" render={props => <ListingLandlordMainPage {...props} isLoggedIn={loggedInStatus} />} />
                  <Route path="/listing/tenant/:id/get" render={props => <ListingTenantMainPage {...props} isLoggedIn={loggedInStatus} />} />
                  <Route
                    path="/listing/tenant/:id/dashboard"
                    render={({
                      match, props
                    }) => (
                      <TenantListingDashboard {...props} match={match} loginClickHandler={this.clickHandler} hideLoginModal={this.hideLoginModal}/>
                    )}
                  />
                </Switch>
              </Router>
            </MessageContextProvider>
          </CurrentListingProvider>
        </ListingsProvider>
      </GlobalProvider>
    );
  }
}
